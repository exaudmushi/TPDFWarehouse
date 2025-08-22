from django.shortcuts import render
from django.views.generic import RedirectView
from django.urls import reverse_lazy
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import requests
from .serializer import LoginSerializer,FileUploadSerializer
import base64
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import os, zipfile, json, pyodbc
from data_shop.tasks.processor import FileProcessor
from rest_framework.parsers import MultiPartParser
import uuid
from .dataservices import file_converter, servicefacility

logger = logging.getLogger(__name__)



##
##
## User get generates user app level token, its called only once and token is stored in local storage
##
##

class GenerateTokenView(APIView):
    permission_classes = [AllowAny]

    def get_app_level_access(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            app_level = {
                '_refresh': str(refresh),
                '_access': str(refresh.access_token),
            }
            return app_level
        else:
            invalid_app_access = {'error': 'Invalid credentials'}
            
            return invalid_app_access 
##
##
## User get access IMPACT token
##
##
class GetAccess(APIView):

    def get(self, request):
        token = request.session.get('app_token')
        return Response({'token':token})
    
##
##
## Login API View - IMPACT Instance
##
##

class LoginAPIView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Encode client credentials in Base64
            credentials = f"{settings.CLIENT_ID}:{settings.CLIENT_SECRET}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
             # Set headers
            headers = {
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }

            # Set payload
            payload = {
                "grant_type": "password",
                "username": username,
                "password": password
            }
            #generate App level access

            app_level_request = GenerateTokenView.get_app_level_access(self,request)
            # Send request
            response = requests.post(settings.TOKEN_URL, headers=headers, data=payload)
        

            if response.status_code == 200:
                try:
                    token_ = response.json()
                
                    request.session['app_token'] = token_
                    request.session['username'] = username
                    
                    # Set payload
                    payload = {
                        "grant_type": "password",
                        "username": username,
                        "password": password
                    }

                    return Response({'message': 'Login successful','base_url':settings.BASE_URL,'tkn': token_,'app_level':app_level_request},  status=200)
                except ValueError as e:
                    logger.error(f"JSON parse error: {e}, content: {response.text[:1000]}")
                    return Response({'error': 'Invalid DHIS2 response'}, status=500)
            else:
                logger.error(f"DHIS2 error: {response.status_code} - {response.text[:1000]}")
                error_msg = 'Redirected to login' if response.status_code == 302 else 'Authentication failed'
                return Response({'error': error_msg}, status=401)

        except requests.exceptions.RequestException as e:
            logger.error(f"DHIS2 connection failed: {e}")
            return Response({'error': 'DHIS2 unreachable'}, status=503)

class LogoutView(RedirectView):
    url = reverse_lazy('home')  # Set to a valid URL, e.g., reverse_lazy('login')

    def get(self, request, *args, **kwargs):
        request.session.flush()
        return super().get(request, *args, **kwargs)
    
##
##
##  Data Upload class, it extract data trnasform and store data into Pg DB instance 
##
##

class UploadAPIView(APIView):
    parser_classes = [MultiPartParser]
    
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            zip_file = serializer.validated_data['file']
            
            upload_dir = os.path.join("data_shop/uploads")
            zip_path = os.path.join(upload_dir, "original.zip")
            file_name = os.path.splitext(os.path.basename(zip_file.name))[0]  # removes .zip extension
            try:
                

                # Create a folder named after the file (without extension)
                upload_dir = os.path.join("data_shop/uploads", file_name)
                os.makedirs(upload_dir, exist_ok=True)

                # Save the uploaded file inside that folder
                zip_path = os.path.join(upload_dir, zip_file.name)
                with open(zip_path, "wb") as f:
                    for chunk in zip_file.chunks():
                        f.write(chunk)
                # Now you can extract it
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(os.path.join(upload_dir, "extracted_files"))
            except zipfile.BadZipFile:
                return Response({"error": "Uploaded file is not a valid ZIP archive."}, status=400)


            with open(zip_path, "wb") as f:
                for chunk in zip_file.chunks():
                    f.write(chunk)

            all_tables_data = {}
            format_name = servicefacility.HighlevelFunction
            data_file = format_name.format_filename(file_name)
            json_data_process = file_converter.JsonConverter(
                all_tables_data,
                output_folder="converted_json",
                weekly_file=data_file
            )
            print(file_name)
            extract_path = os.path.join(settings.MEDIA_ROOT, file_name)
            absolute_path = os.path.abspath(extract_path)
            print(absolute_path)
            clear_temp = servicefacility.HighlevelFunction
            clear_temp.clear_temp_files()
            json_data_process.convert_mdb_to_json(weekfile_name=file_name)
            

            return Response({
                "task_id": "",
            }, status=status.HTTP_201_CREATED)

       

##
##
##  Data Task progrss status
##

class TaskStatusAPIView(APIView):
    def get(self, request, task_id):
        zip_path = os.path.join("warehouse/uploads", task_id, "original.zip")
        processor = FileProcessor(zip_path, task_id)
        return Response(processor.get_status(), status=status.HTTP_200_OK)

##
##
##  Task results
##
##
import re
class TaskResultAPIView(APIView):
    def get(self, request, task_id):

        def is_valid_task_id(task_id):
            return bool(re.match(r'^[\w\-]+$', task_id))  # Only allow alphanumeric, underscore, hyphen

        # In your view:
        if not is_valid_task_id(task_id):
            return Response({"error": "Invalid task ID"}, status=400)
        
        zip_path = os.path.join("warehouse/uploads", task_id, "original.zip")
        processor = FileProcessor(zip_path, task_id)
        print(f"Received task_id: {task_id}")

        return Response({
            "convertedFiles": processor.get_results()
        }, status=status.HTTP_200_OK)

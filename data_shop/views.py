from django.shortcuts import render
from django.views.generic import RedirectView
from django.urls import reverse_lazy
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import requests
from .serializer import LoginSerializer
import base64

# Create your views here.
import os, zipfile, json, pyodbc


logger = logging.getLogger(__name__)


class GetAccess(APIView):

    def get(self, request):
        token = request.session.get('app_token')
        return Response({'token':token})
    
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

            # Send request
            response = requests.post(settings.TOKEN_URL, headers=headers, data=payload)
        

            if response.status_code == 200:
                try:
                    token = response.json()
                
                    request.session['app_token'] = token
                    request.session['username'] = username
                    
                    # Set payload
                    payload = {
                        "grant_type": "password",
                        "username": username,
                        "password": password
                    }

                    return Response({'message': 'Login successful','base_url':settings.BASE_URL}, status=200)
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


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from data_shop.tasks.processor import FileProcessor
import uuid, os

class UploadAPIView(APIView):

    def post(self, request):

        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        task_id = str(uuid.uuid4())
        upload_dir = os.path.join("data_shop/uploads", task_id)
        os.makedirs(upload_dir, exist_ok=True)
        zip_path = os.path.join(upload_dir, "original.zip")

        with open(zip_path, "wb") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        processor = FileProcessor(zip_path, task_id)
        processor.create_folder()
        processor.extract_zip()
        processor.convert_mdb_to_json()

        return Response({
            "task_id": task_id,
            "status": processor.get_status()["status"]
        }, status=status.HTTP_201_CREATED)


class TaskStatusAPIView(APIView):
    def get(self, request, task_id):
        zip_path = os.path.join("warehouse/uploads", task_id, "original.zip")
        processor = FileProcessor(zip_path, task_id)
        return Response(processor.get_status(), status=status.HTTP_200_OK)


class TaskResultAPIView(APIView):
    def get(self, request, task_id):
        zip_path = os.path.join("warehouse/uploads", task_id, "original.zip")
        processor = FileProcessor(zip_path, task_id)
        return Response({
            "convertedFiles": processor.get_results()
        }, status=status.HTTP_200_OK)

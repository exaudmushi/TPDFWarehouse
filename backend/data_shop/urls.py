from django.contrib import admin
from django.urls import path, include
from .views import LoginAPIView
from .views import UploadAPIView, TaskStatusAPIView, TaskResultAPIView, GetAccess

app_name = "data_shop"
urlpatterns = [
    path('', LoginAPIView.as_view(), name='entry'),
    path('upload', UploadAPIView.as_view(), name='api-upload'),
    path('access/', GetAccess.as_view(), name='token'),
    path('status/<str:task_id>', TaskStatusAPIView.as_view(), name='api-status'),
    path('result/<str:task_id>', TaskResultAPIView.as_view(), name='api-result'),
]

from rest_framework import serializers
import zipfile

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith('.zip'):
            raise serializers.ValidationError("Only ZIP files are allowed.")
        if not zipfile.is_zipfile(value):
            raise serializers.ValidationError("Uploaded file is not a valid ZIP archive.")
        return value
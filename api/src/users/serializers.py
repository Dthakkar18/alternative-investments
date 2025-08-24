from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ("email", "name", "password")

    def create(self, validated):
        return User.objects.create_user(
            email=validated["email"],
            password=validated["password"],
            name=validated.get("name", ""),
        )

class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name")


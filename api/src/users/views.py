from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, MeSerializer

User = get_user_model()

@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    # sets csrftoken cookie; body empty
    return Response({"detail": "CSRF cookie set"})

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def register_view(request):
    s = RegisterSerializer(data=request.data)
    if s.is_valid():
        user = s.save()
        return Response(MeSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def login_view(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    user = authenticate(request, email=email, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    login(request, user)  # session cookie set (httpOnly)
    return Response(MeSerializer(user).data)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out"})

@api_view(["GET"])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(MeSerializer(request.user).data)


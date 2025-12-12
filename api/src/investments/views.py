from rest_framework import viewsets, permissions
from .models import Investment
from .serializers import InvestmentSerializer


class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Investment.objects.none()
        return (
            Investment.objects.filter(investor=user)
            .select_related("listing")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(investor=self.request.user)

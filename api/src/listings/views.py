from rest_framework import viewsets, permissions
from .models import Listing
from .serializers import ListingSerializer
from rest_framework.exceptions import PermissionDenied



class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Only the seller can update/delete; everyone can read.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]

    def get_queryset(self):
        qs = (
            Listing.objects.all()
            .select_related("seller")
            .order_by("-created_at")
        )

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        mine_param = self.request.query_params.get("mine")
        if mine_param in ("1", "true", "True"):
            if self.request.user.is_authenticated:
                qs = qs.filter(seller=self.request.user)
            else:
                # if not logged in, no personal listings
                qs = Listing.objects.none()

        return qs

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        listing = self.get_object()
        new_status = request.data.get("status")

        # If we're changing status (e.g., publish/unpublish),
        # allow it even if the current status is not "draft".
        # Permissions already ensure only the seller can do this.
        if new_status is not None:
            return super().partial_update(request, *args, **kwargs)

        # For all OTHER partial edits (title, description, etc.),
        # require that the listing is currently a draft.
        if listing.status != Listing.STATUS_DRAFT:
            raise PermissionDenied("Only draft listings can be edited.")

        return super().partial_update(request, *args, **kwargs)

    # Also block full update
    def update(self, request, *args, **kwargs):
        listing = self.get_object()

        if listing.status != Listing.STATUS_DRAFT:
            raise PermissionDenied("Only draft listings can be edited.")

        return super().update(request, *args, **kwargs)


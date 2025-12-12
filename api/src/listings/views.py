from rest_framework import viewsets, permissions, status
from .models import Listing
from .serializers import ListingSerializer
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied



class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Only the seller can update/delete; everyone can read.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user
    
    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.status != Listing.STATUS_DRAFT:
            raise PermissionDenied("Only draft listings can be deleted.")
        return super().destroy(request, *args, **kwargs)


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]

    def get_queryset(self):
        qs = (
            Listing.objects.all()
            .select_related("seller")
            .order_by("-created_at")
        )
        request = self.request
        user = getattr(request, "user", None)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        # If client asks for mine=1 and user is authenticated,
        # return only this user's listings (for seller portfolio view)
        mine_param = self.request.query_params.get("mine")
        if mine_param in ("1", "true", "True") and user and user.is_authenticated:
            if self.request.user.is_authenticated:
                qs = qs.filter(seller=user)
            else:
                # if not logged in, no personal listings
                qs = Listing.objects.none()

        return qs

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Handles both PUT and PATCH.

        - Allows status only changes (publish/unpublish) regardless of current status.
        - Blocks editing other fields unless the listing is in draft.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        incoming_fields = set(request.data.keys())
        non_status_fields = incoming_fields - {"status"}
        new_status = request.data.get("status")

        # Case 1: Pure status change ({"status": "draft"} or {"status": "live"})
        # Allowed even if listing is not draft, as long as IsSellerOrReadOnly passes.
        if new_status is not None and not non_status_fields:
            pass

        # Case 2: Any other field edits on non draft listings then forbidden
        elif instance.status != Listing.STATUS_DRAFT:
            raise PermissionDenied("Only draft listings can be edited.")

        # Case 3: Draft listing with non status edits then allowed

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


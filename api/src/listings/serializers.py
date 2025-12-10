from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.name", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "seller_name",
            "seller_email",
            "title",
            "description",
            "category",
            "target_amount",
            "min_investment",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "seller",
            "seller_name",
            "seller_email",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            # optional on create/patch, defaults to "draft"
            "status": {"required": False}
        }

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["seller"] = request.user
        return super().create(validated_data)

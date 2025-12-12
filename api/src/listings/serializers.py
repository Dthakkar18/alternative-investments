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
            "asset_value",
            "seller_retain_percent",
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
            "target_amount",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "asset_value": {"required": True},
            "seller_retain_percent": {"required": True},
            "status": {"required": False},
        }

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["seller"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # normal partial update model.save() will recompute target_amount
        return super().update(instance, validated_data)

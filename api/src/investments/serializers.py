from decimal import Decimal
from rest_framework import serializers
from .models import Investment


class InvestmentSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_asset_value = serializers.DecimalField(
        source="listing.asset_value", max_digits=12, decimal_places=2, read_only=True
    )
    listing_target_amount = serializers.DecimalField(
        source="listing.target_amount", max_digits=12, decimal_places=2, read_only=True
    )

    ownership_percent = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            "id",
            "investor",
            "listing",
            "listing_title",
            "listing_asset_value",
            "listing_target_amount",
            "amount",
            "ownership_percent",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "investor",
            "listing_title",
            "listing_asset_value",
            "listing_target_amount",
            "ownership_percent",
            "created_at",
        ]

    def get_ownership_percent(self, obj) -> str:
        asset_value = obj.listing.asset_value
        if not asset_value or asset_value == 0:
            return "0.00"
        pct = (obj.amount / asset_value) * Decimal("100.00")
        return f"{pct.quantize(Decimal('0.01'))}"

    def validate(self, attrs):
        request = self.context.get("request")
        listing = attrs.get("listing")

        if not request or not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        if listing.status != listing.STATUS_LIVE:
          raise serializers.ValidationError("You can only invest in live listings.")

        amount = attrs.get("amount")
        if amount is None or amount <= 0:
            raise serializers.ValidationError("Investment amount must be positive.")

        if listing.min_investment and amount < listing.min_investment:
            raise serializers.ValidationError(
                f"Minimum investment is {listing.min_investment}."
            )

        # Capacity check
        already = listing.total_invested
        if already + amount > listing.target_amount:
            remaining = listing.target_amount - already
            if remaining <= 0:
                raise serializers.ValidationError("This listing is fully funded.")
            raise serializers.ValidationError(
                f"Only {remaining} remaining in this offering."
            )

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["investor"] = request.user
        return super().create(validated_data)

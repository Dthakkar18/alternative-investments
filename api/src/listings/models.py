from django.conf import settings
from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator


class Listing(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_LIVE = "live"
    STATUS_FUNDED = "funded"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_LIVE, "Live"),
        (STATUS_FUNDED, "Funded"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True)

    # Full value of the asset
    asset_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Full value of the asset (100% ownership).",
    )

    # Percent of the asset the seller keeps (which will be 0–100)
    seller_retain_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        default=Decimal("0.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of the asset the seller keeps (0–100).",
    )

    target_amount = models.DecimalField(
        max_digits=12, decimal_places=2
    )
    
    min_investment = models.DecimalField(
        max_digits=12, decimal_places=2, default=100
    )

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        # If we know the full asset value and seller retention,
        # keep target_amount in sync as "amount offered to investors"
        if self.asset_value is not None and self.seller_retain_percent is not None:
            for_sale_percent = Decimal("100.00") - self.seller_retain_percent
            if for_sale_percent < 0:
                for_sale_percent = Decimal("0.00")
            self.target_amount = (
                self.asset_value * for_sale_percent / Decimal("100.00")
            ).quantize(Decimal("0.01"))

        super().save(*args, **kwargs)

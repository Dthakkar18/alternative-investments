from django.conf import settings
from django.db import models


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

    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
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

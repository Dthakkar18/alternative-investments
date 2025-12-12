from decimal import Decimal
from django.conf import settings
from django.db import models
from listings.models import Listing


class Investment(models.Model):
    investor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="investments",
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="investments",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.investor.email} → {self.listing.title}: {self.amount}"

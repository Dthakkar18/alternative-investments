from django.contrib import admin
from .models import Listing


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "seller", "status", "target_amount", "created_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("title", "description", "seller__email")

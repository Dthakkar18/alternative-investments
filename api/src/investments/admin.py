from django.contrib import admin
from .models import Investment


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("id", "investor", "listing", "amount", "created_at")
    list_filter = ("created_at", "listing")
    search_fields = ("investor__email", "listing__title")

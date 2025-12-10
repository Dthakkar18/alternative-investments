from django.contrib import admin
from django.urls import path, include
from users import views as u

urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/auth/csrf/", u.csrf_view),
    path("api/auth/register", u.register_view),
    path("api/auth/login", u.login_view),
    path("api/auth/logout", u.logout_view),
    path("api/auth/me", u.me_view),
    path("api/", include("listings.urls"))
    # path("api/auth/portfolio", u.portfolio_view),
]


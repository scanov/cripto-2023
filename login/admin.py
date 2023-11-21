from django.contrib import admin
from .models import Sesion


class SesionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ra",
        "rb",
        "ga_mod_p",
        "b",
        "gb_mod_p",
        "k",
        "timestamp",
    )


admin.site.register(Sesion, SesionAdmin)

from django.contrib import admin
from .models import Mensaje


class MensajeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "texto",
        "timestamp",
        "iv",
    )
    

admin.site.register(Mensaje, MensajeAdmin)

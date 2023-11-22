from django.db import models

class Mensaje(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name="ID",
        editable=False,
    )
    texto = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    iv = models.CharField(max_length=255)
    def get_fecha(self) -> str:
        return self.timestamp.strftime("%d/%m/%Y %H:%M:%S")
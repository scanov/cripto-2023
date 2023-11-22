from django.db import models


class Sesion(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name="ID",
        editable=False,
    )
    ra = models.CharField(
        max_length=255,
        blank=False)
    rb = models.CharField(
        max_length=255,
        blank=False)
    ga_mod_p = models.TextField(
        max_length = 300,
        null=True,
        blank=True
    )
    b = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    gb_mod_p = models.TextField(
        max_length = 300,
        null=True,
        blank=True
    )
    k = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    h = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    tunel_establecido = models.BooleanField(default=False)

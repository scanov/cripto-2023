from django.db import models


class Sesion(models.Model):
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name="ID",
        editable=False,
    )
    ra = models.IntegerField()
    rb = models.IntegerField()
    ga_mod_p = models.IntegerField(
        null=True,
        blank=True
    )
    b = models.IntegerField(
        null=True,
        blank=True
    )
    gb_mod_p = models.IntegerField(
        null=True,
        blank=True
    )
    k = models.IntegerField(
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)

from rest_framework import serializers
from .models import Mensaje


class MensajeSerializer(serializers.ModelSerializer):
    fecha = serializers.SerializerMethodField()

    class Meta:
        model = Mensaje
        fields = ('id', 'texto', 'fecha')

    def get_fecha(self, mensaje: Mensaje) -> str:
        return mensaje.timestamp.strftime("%d/%m/%Y %H:%M:%S")
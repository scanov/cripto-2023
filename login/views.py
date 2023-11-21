from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from secrets import randbits

from .models import Sesion


@api_view(['POST'])
def ssh1(request):
    data = request.data
    # Verificar que los datos contienen estrictamente un nombre de usuario y un reto (ra)
    if len(data) != 2 or "username" not in data or "ra" not in data:
        return JsonResponse({"message": "Datos incorrectos"}, status=status.HTTP_400_BAD_REQUEST)
    # Verificar que el nombre de usuario es "Alice"
    if data["username"] != "Alice":
        return JsonResponse({"message": "Usuario no existe"}, status=status.HTTP_404_NOT_FOUND)
    # Crear una nueva sesion con ra y rb aleatorio
    rb = randbits(10)
    sesion = Sesion(ra=data["ra"], rb=rb)
    sesion.save()
    # Retornar rb
    return JsonResponse(data, status=status.HTTP_200_OK)

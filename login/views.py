from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from secrets import randbits

from .models import Sesion
from .helpers import is_logged_in, get_sesion, g, p, PB


@api_view(['POST'])
def ssh1(request):
    # Verificar que no hay sesion activa
    if is_logged_in():
        return JsonResponse({"message": "Ya hay una sesion activa"}, status=status.HTTP_400_BAD_REQUEST)
    data = request.data
    # Verificar que los datos contienen estrictamente un nombre de usuario y un reto (ra)
    if len(data) != 2 or "username" not in data or "ra" not in data:
        return JsonResponse({"message": "Datos incorrectos"}, status=status.HTTP_400_BAD_REQUEST)
    # Verificar que el nombre de usuario es "Alice"
    if data["username"] != "Alice":
        return JsonResponse({"message": "Usuario no existe"}, status=status.HTTP_404_NOT_FOUND)
    # Crear una nueva sesion con ra y rb aleatorio
    rb = str(hex(randbits(128)))[2:]
    sesion = Sesion(ra=data["ra"], rb=rb)
    sesion.save()
    # Retornar rb
    return JsonResponse({"rb": rb}, status=status.HTTP_200_OK)


@api_view(['POST'])
def ssh2(request):
    # Verificar que hay una sesion activa
    if not is_logged_in():
        return JsonResponse({"message": "No hay una sesion activa"}, status=status.HTTP_400_BAD_REQUEST)
    data = request.data
    # Verificar que los datos contienen exclusivamente ga_mod_p
    if len(data) != 1 or "ga_mod_p" not in data:
        return JsonResponse({"message": "Datos incorrectos"}, status=status.HTTP_400_BAD_REQUEST)
    # Almacenar ga_mod_p en la sesion
    sesion = get_sesion()
    sesion.ga_mod_p = data["ga_mod_p"]
    # Generar b
    b = randbits(128)
    # Calcular gb_mod_p y almacenarlo en la sesion
    gb_mod_p = str(hex(pow(g, b, p)))[2:]
    sesion.gb_mod_p = gb_mod_p
    # Calcular k, usar sha256 para reducir y truncar a 128 bits, luego almacenarlo en la sesion
    k = str(hex(pow(int(data["ga_mod_p"], 16), b, p)))[2:]
    #sesion.k = k
    # Calcular SB
    # Guardar la sesión cambiada en base de datos
    print("holi")
    sesion.save()
    # Responder gb_mod_p, PB, SB
    PB_data = {"N": PB[0], "e": PB[1]}
    return JsonResponse({"gb_mod_p": gb_mod_p, "PB": PB_data, "SB": 0}, status=status.HTTP_200_OK)
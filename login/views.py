from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from secrets import randbits
from django.shortcuts import render

from .models import Sesion
from .helpers import is_logged_in, get_sesion, g, p, PB, h, N, e, decrypt, NA
from os import environ


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
    #rb = str(hex(randbits(128)))[2:].upper()
    rb = "C4944595FE0A83CEC05B5BAFD85157E5"
    sesion = Sesion(ra=data["ra"], rb=rb)
    sesion.save()
    # Retornar rb
    return JsonResponse({"rb": rb}, status=status.HTTP_200_OK)


@api_view(['PUT'])
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
    #b = randbits(128)
    b = int("a243cc63e803badd66e2da2770b1d2ae", 16)
    # Calcular gb_mod_p y almacenarlo en la sesion
    gb_mod_p = str(hex(pow(g, b, p)))[2:]
    sesion.gb_mod_p = gb_mod_p
    # Calcular k, usar sha256 para reducir a 256 bits, luego almacenarlo en la sesion
    k = str(hex(pow(int(data["ga_mod_p"], 16), b, p)))[2:]
    k = h(k)
    sesion.k = k
    # Calcular SB y guardar H en la sesion
    H = h("Alice" + "Bob" + sesion.ra + sesion.rb + sesion.ga_mod_p + sesion.gb_mod_p + sesion.k)
    sesion.h = H
    # Encriptar SB usando d
    d = int(environ.get("PRIVATE_KEY"), 16)
    SB = str(hex(pow(int(H, 16), d, int(N, 16))))[2:].upper()
    # Guardar la sesión cambiada en base de datos
    sesion.save()
    # Responder gb_mod_p, PB, SB
    PB_data = {"N": PB[0], "e": PB[1]}
    return JsonResponse({"gb_mod_p": gb_mod_p, "PB": PB_data, "SB": SB}, status=status.HTTP_200_OK)


@api_view(['PUT'])
def ssh3(request):
    # Verificar que hay una sesion activa con k calculado y tunel no establecido
    if not is_logged_in():
        return JsonResponse({"message": "No hay una sesion activa"}, status=status.HTTP_400_BAD_REQUEST)
    sesion = get_sesion()
    if sesion.k is None:
        return JsonResponse({"message": "No hay llave simetrica establecida"}, status=status.HTTP_400_BAD_REQUEST)
    if sesion.tunel_establecido:
        return JsonResponse({"message": "Tunel ya establecido"}, status=status.HTTP_400_BAD_REQUEST)
    # Verificar que los datos contienen exclusivamente encripcion y iv
    data = request.data
    if len(data) != 2 or "encripcion" not in data or "iv" not in data:
        return JsonResponse({"message": "Datos incorrectos"}, status=status.HTTP_400_BAD_REQUEST)
    # Desencriptar encripcion usando k
    C = data["encripcion"]
    k = sesion.k
    IV = data["iv"]
    try:
        desencripcion = decrypt(C, k, IV)
    except:
        return JsonResponse({"message": "Encripcion incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    # print(f"{desencripcion=}")
    # Verificar que la desencripcion contiene a "Alice"
    if "Alice" not in desencripcion:
        return JsonResponse({"message": "Encripcion incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    # Obtener la llave pública de Alice del comienzo de la desencripcion hasta "Alice"
    try:
        eA = desencripcion[:desencripcion.index("Alice")]
        # Verificar la firma de Alice
        SA_signed = desencripcion[desencripcion.index("Alice") + 5:]
        # print(f"{SA_signed=}")
        SA_int = str(hex(pow(int(SA_signed, 16), int(eA, 16), int(NA, 16))))[2:].upper()
        SA = bytes.fromhex(SA_int).decode('utf-8')
    except:
        return JsonResponse({"message": "Firma incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    if not SA.endswith("Alice") or SA[:-5] != sesion.h:
        return JsonResponse({"message": "Firma incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
    # Activar el tunel y retornar mensaje de tunel establecido
    sesion.tunel_establecido = True
    sesion.save()
    return JsonResponse({"message": "Tunel establecido"}, status=status.HTTP_200_OK)

def login(request):
    return render(request, 'login.html')

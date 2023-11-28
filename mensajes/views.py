from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from secrets import token_hex
from django.shortcuts import render

from .models import Mensaje
from .serializers import MensajeSerializer
from .helpers import is_tunnel_established, get_sesion, decrypt, encrypt, aes_k
from os import environ


@api_view(['POST', 'GET'])
def send_read_message(request):
    if request.method == "POST":
        # Verificar que hay un tunel establecido
        if not is_tunnel_established():
            return JsonResponse({"message": "No hay un tunel establecido"}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data
        # Verificar que los datos contienen exclusivamente un texto encriptado y un IV
        if len(data) != 2 or "texto" not in data or "iv" not in data:
            return JsonResponse({"message": "Datos incorrectos"}, status=status.HTTP_400_BAD_REQUEST)
        # Obtener la sesion
        sesion = get_sesion()
        # Desencriptar el mensaje
        try:
            texto = decrypt(data["texto"], sesion.k, data["iv"])
            print('texto')
        except Exception as e:
            return JsonResponse({"message": "Encripcion invalida"}, status=status.HTTP_400_BAD_REQUEST)
        # Guardar el mensaje reencriptado en la base de datos
        # IV = token_hex(16)
        IV = "7be219757228099f1bc4a47000d38b13"
        texto_encriptado = encrypt(texto, aes_k, IV)
        mensaje = Mensaje(texto=texto_encriptado, iv=IV)
        mensaje.save()
        # Retornar el mensaje de éxito
        return JsonResponse({"message": "Mensaje almacenado exitosamente"}, status=status.HTTP_200_OK)

    elif request.method == "GET":
        # Verificar que hay un tunel establecido
        if not is_tunnel_established():
            return JsonResponse({"message": "No hay un tunel establecido"}, status=status.HTTP_400_BAD_REQUEST)
        # Obtener la sesion
        sesion = get_sesion()
        # Obtener los mensajes
        mensajes = Mensaje.objects.all()
        # Retornar diccionario con id y fecha para cada mensaje
        mensajes_list = list()
        for mensaje in mensajes:
            mensajes_list.append({"id": mensaje.id, "fecha": mensaje.get_fecha()})
        return JsonResponse({"mensajes": mensajes_list}, status=status.HTTP_200_OK)


@api_view(['GET'])
def read_message(request, mensaje_id: int):
    # Verificar que hay un tunel establecido
    if not is_tunnel_established():
        return JsonResponse({"message": "No hay un tunel establecido"}, status=status.HTTP_400_BAD_REQUEST)
    # Obtener la sesion
    sesion = get_sesion()
    # Obtener el mensaje
    try:
        mensaje = Mensaje.objects.get(pk=mensaje_id)
    except Mensaje.DoesNotExist:
        return JsonResponse({"message": "Mensaje no existe"}, status=status.HTTP_404_NOT_FOUND)
    # Desencriptar el mensaje
    try:
        texto = decrypt(mensaje.texto, aes_k, mensaje.iv)
    except:
        return JsonResponse({"message": "Encripcion interna invalida"}, status=status.HTTP_400_BAD_REQUEST)
    # Reencriptar el mensaje con la llave de sesion
    # IV = token_hex(16)
    IV = "7be219757228099f1bc4a47000d38b13"
    texto_encriptado = encrypt(texto, sesion.k, IV)
    # Retornar el mensaje
    return JsonResponse({"texto": texto_encriptado, "iv": IV}, status=status.HTTP_200_OK)

from login.models import Sesion
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from os import environ

# Llave de aes local
aes_k = environ.get("AES_KEY")

# Función que devuelve una lista con las sesiones con tunel establecido
def tuneles_establecidos():
    sesiones = list()
    for sesion in Sesion.objects.all():
        if sesion.tunel_establecido:
            sesiones.append(sesion)
    return sesiones


# Función que devuelve True si hay al menos un tunel establecido
def is_tunnel_established():
    return len(tuneles_establecidos()) > 0


# Función que devuelve la sesión con tunel establecido
def get_sesion():
    return tuneles_establecidos()[-1]


# Desencriptar AES
def decrypt(C, k, IV):
    cipher = AES.new(bytes.fromhex(k), AES.MODE_CBC, iv=bytes.fromhex(IV))
    return cipher.decrypt(bytes.fromhex(C)).decode('utf-8').rstrip('\x05')



# Encriptar AES
def encrypt(m, k, IV):
    cipher = AES.new(bytes.fromhex(k), AES.MODE_CBC, iv=bytes.fromhex(IV))
    return cipher.encrypt(pad(bytes(m, 'utf-8'), 16)).hex().upper()
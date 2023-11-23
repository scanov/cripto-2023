from django.urls import path
from . import views

urlpatterns = [
    path('mensaje/', views.send_read_message, name='send_message'),
    path('mensaje/<int:mensaje_id>/', views.read_message, name='read_message'),
    path('mensaje/', views.send_read_message, name='read_all_messages'),
    path('mensajes/', views.mensajes, name='mensajes')
    ]

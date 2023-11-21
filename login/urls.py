from django.urls import path
from . import views

urlpatterns = [
    path('ssh1/', views.ssh1, name='ssh1'),
    path('ssh2/', views.ssh2, name='ssh2'),
    ]
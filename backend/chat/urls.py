from django.urls import path
from . import views


urlpatterns = [
    path('<int:pk>/', views.MessageViewSet.as_view({'get': 'retrieve'}), name='get-messages'),
    path('create/', views.MessageViewSet.as_view({'post': 'create'}), name='create-message'),
    path('<int:pk>/update/', views.MessageViewSet.as_view({'patch': 'partial_update'}), name='update-message'),
    path('<int:pk>/delete/', views.MessageViewSet.as_view({'delete': 'destroy'}), name='delete-message'),
    path('get_chat_messages/<int:user_id>/', views.MessageViewSet.as_view({'get': 'get_chat_messages'}), name='get_chat_messages'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('<int:pk>/', views.CustomUserViewset.as_view({'get': 'retrieve'}), name='get-user'),
    path("search/", views.CustomUserViewset.as_view({"get": "search"}), name="search-users",),
    path('create/', views.CustomUserViewset.as_view({'post': 'create'}), name='create-user'),
    path('<int:pk>/update/', views.CustomUserViewset.as_view({'patch': 'partial_update'}), name='update-user'),
    path('<int:pk>/delete/', views.CustomUserViewset.as_view({'delete': 'destroy'}), name='delete-user'),
    path('get_user_chats/', views.CustomUserViewset.as_view({'get': 'get_user_chats'}), name='get-user-chats'),
]

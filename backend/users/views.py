from django.db.models import Q
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .serializers import CustomUser, CustomUserSerializer
from .permissions import AllowAnyCreateElseIsAuthenticated


class CustomUserViewset(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAnyCreateElseIsAuthenticated]

    @action(methods=['GET'], detail=False)
    def get_user_chats(self, request: Request) -> Response:
        users = CustomUser.objects.filter(Q(messages_sent__reciever=request.user) | Q(messages_recieved__sender=request.user)).distinct()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data, status=200)

    @action(methods=['GET'], detail=False)
    def search(self, request):
        username = request.query_params.get("username", "")

        users = CustomUser.objects.filter(
            username__icontains=username
        )

        serializer = self.get_serializer(users, many=True)

        return Response(serializer.data)

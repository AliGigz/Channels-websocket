from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from users.models import CustomUser
from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['sender_id'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["GET"], url_path=r'get_chat_messages/(?P<user_id>\d+)')
    def get_chat_messages(self, request: Request, user_id: int) -> Response:
        other_user = CustomUser.objects.get(pk=user_id)
        messages = Message.objects.filter(Q(sender=self.request.user, reciever=other_user) | Q(sender=other_user, reciever=self.request.user)).order_by('-date_created')
        serializer = MessageSerializer(messages, many=True)
        print(serializer.data)
        return Response(serializer.data)

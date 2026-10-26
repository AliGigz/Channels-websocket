from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField
from users.serializers import CustomUserSerializer
from . import models


class MessageSerializer(ModelSerializer):
    sender = CustomUserSerializer(read_only=True)
    sender_id = PrimaryKeyRelatedField(
        queryset=models.CustomUser.objects.all(),
        source='sender',
        write_only=True
    )
    reciever = CustomUserSerializer(read_only=True)
    reciever_id = PrimaryKeyRelatedField(
        queryset=models.CustomUser.objects.all(),
        source='reciever',
        write_only=True
    )
    class Meta:
        model = models.Message
        fields = ['sender', 'reciever', 'content', 'date_created', 'sender_id', 'reciever_id']

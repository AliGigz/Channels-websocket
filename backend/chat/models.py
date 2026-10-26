from django.db import models
from users.models import CustomUser


class Message(models.Model):
    sender = models.ForeignKey(to=CustomUser, related_name='messages_sent', on_delete=models.CASCADE)
    reciever = models.ForeignKey(to=CustomUser, related_name='messages_recieved', on_delete=models.CASCADE)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message(sender_pk={self.sender.pk}, reciever_pk={self.reciever.pk})'

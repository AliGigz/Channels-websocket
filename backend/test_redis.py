import asyncio

from channels_redis.core import RedisChannelLayer


async def main():
    layer = RedisChannelLayer(
        hosts=[
            {
                "host": "redis",
                "port": 6379,
            }
        ]
    )
    channel = await layer.new_channel()

    print("CHANNEL:", channel)

    await layer.send(
        channel,
        {
            "type": "test.message",
            "text": "hello",
        },
    )

    print("SEND OK")

    message = await layer.receive(channel)

    print("RECEIVED:", message)


asyncio.run(main())
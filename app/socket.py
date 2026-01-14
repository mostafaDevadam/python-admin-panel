import socketio

from app.database import AsyncSessionLocal
from app.security import decode_token
from app.services.users_service import getUserWithHisRole

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")


def setupSocketIO(app):
    socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
    return socket_app


@sio.event
async def connect(sid, environ, auth):
    if 'token' not in auth:
        raise ConnectionRefusedError('Authentication required')

        # print(f"environ: {environ}")
    print(f" auth: {auth}")
    token = auth.get("token")
    print(f"token: {token}")

    try:
        payload = decode_token(token)
        print(f"payload in socket: {payload}")
        await sio.save_session(sid, {
            "user_id": payload["sub"],
        })

        user = await getUserWithHisRole(payload["sub"])
        print(f"user role_name: {user.role.name}")
        if user.role.name == "admin":
            await sio.enter_room(sid, f"role_{user.role.name}")
            print(f"User {payload['sub']} connected with role {user.role.name}")
        else:
            await sio.leave_room(sid, f"role_{user.role.name}")

    except Exception as e:
        print("ERROR Socket: ", e)
        return False

    print(f"Client {sid} connected")
    await sio.emit('message', {'data': 'Connected to Socket.IO!'}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")


@sio.on('client_message')
async def handle_message(sid, data):
    print(f"Received message from {sid}: {data}")
    # Echo back to the sender
    await sio.emit('server_message', {'reply': f"Echo: {data}"}, to=sid)


async def send_admin_notification(message: str, data: dict = None):
    await sio.emit("notification", {"message": message, "data": data}, room="role_admin")

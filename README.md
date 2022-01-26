# sockpuppet.ts

SockPuppet.ts is the server side package of SockPuppet written for Deno. SockPuppet is a lightweight WebSocket library that requires minimal configuration to get up and running, while still offering plenty of options for configurations.

The ethos behind SockPuppet is that the server can be set up and deployed with very little additional code while channels and networks are created dynamically from the front-end.

By default, channels will echo the payload of signals to every member of the channel. Middleware can be applied to channels, allowing for authentication and more complex handling of messages. Networks group channels together, allowing for separation of disciplines. Additionally, middlware can be applied to entire networks

There is also a small web server built in that allows for endpoints to be used in tandem with sockets.

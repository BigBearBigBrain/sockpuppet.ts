# Sockpuppet

![img](https://github.com/BigBearBigBrain/sockpuppet.ts/raw/main/sockpuppet-logo.svg)

Sockpuppet is a lightweight WebSocket library that requires minimal configuration to get up and running, while still offering plenty of options for configurations.

The ethos behind Sockpuppet is that the server can be set up and deployed with very little additional code while channels and networks are created dynamically from the front-end.

Middleware can be applied to channels, allowing for authentication and more complex handling of messages. Networks group channels together, allowing for separation of disciplines. Additionally, middlware can be applied to entire networks

There is also a small web server built in that allows for endpoints to be used in tandem with sockets.

## Usage

#### Server
```
import { Sockpuppet } from 'http://deno.land/x/sockpuppet/mod.ts'

const puppet = new Sockpuppet({
  port: 3000
});

puppet.createNewChannel('chat');
```

#### Client
```
import { Sockpuppet } from 'http://deno.land/x/sockpuppet/client/mod.ts'

const puppet = new Sockpuppet('ws://localhost:6969', () => {
  console.log('Sockpuppet is ready to play!');
  puppet.joinChannel('chat', message => console.log(message));
  puppet.getChannel('chat').send('Hello, world!);
}
```

The above example uses an explicitly defined "chat" channel. In the future, the `createNewChannel` method will also be available on the client side so cases where you need to create a new channel can be done more dynamically from the front end without needing to worry about those cases in your setup.

### Roadmap
- [x] Basic channel structure
- [ ] Better client side interactions
- [ ] Dynamic channel creation
- [ ] Channel middleware
- [ ] Networks of channels
- [ ] Network middleware
- [ ] React Hooks Package
- [ ] Angular Package
- [ ] Vue Package
- [ ] CDN for compiled client
- [ ] Docker image for instant deployment
- [ ] Public test site

# Sockpuppet

![img](https://github.com/BigBearBigBrain/sockpuppet.ts/raw/main/sockpuppet-logo.svg)

## Contents
[Usage](#usage)
- [Server](#server)
- [Client](#client)
- [Roadmap](#roadmap)

Sockpuppet is a lightweight WebSocket library that requires minimal configuration to get up and running, while still offering plenty of options for configurations.

The ethos behind Sockpuppet is that the server can be set up and deployed with very little additional code while channels and networks are created dynamically from the front-end.

Middleware can be applied to channels, allowing for authentication and more complex handling of messages. Networks group channels together, allowing for separation of disciplines. Additionally, middlware can be applied to entire networks

There is also a small web server built in that allows for endpoints to be used in tandem with sockets.

## Usage

#### Server
```ts
import { Sockpuppet } from 'http://deno.land/x/sockpuppet/mod.ts';

const puppet = new Sockpuppet({
  port: 3000
});

puppet.createChannel('chat');
```

#### Client
```js
import { Sockpuppet } from 'http://deno.land/x/sockpuppet/client/mod.ts';

const puppet = new Sockpuppet('ws://localhost:6969', () => {
  console.log('Sockpuppet is ready to play!');
  puppet.joinChannel('chat', message => console.log(message));
  puppet.getChannel('chat').send('Hello, world!);
}
```

The above example uses an explicitly defined "chat" channel. The `createChannel` method will also be available on the client side so cases where you need to create a new channel can be done more dynamically from the front end without needing to worry about those cases in your setup.

#### Dashboard - Puppetshow
Sockpuppet now ships with a built-in dashboard called Puppetshow! Puppetshow will allow you to see real-time statistics* of your server, as well as give you tools to be able to interact with and manage channels and networks.

The dashboard is on by default, however it can be disabled by setting `PuppetOptions.dashboard` to `false`:
```ts
...
const puppet = new Sockpuppet({
  ...options,
  dashboard: false
})
...
```

**statistics are currently volatile and only show records from the time the server was started. Eventually, these statistics will be recorded permanently*

## Docker
There is now a Docker image available on Dockerhub that allows you to spin up a no-config Sockpuppet instance. Simply run `docker pull cyborggrizzly/sockpuppet` to pull the image or include it in your own Docker ecosystem.


### Roadmap
- [x] Basic channel structure
- [X] Better client side interactions
- [x] Dynamic channel creation
- [x] Channel middleware
- [ ] Public test site
- [X] Networks of channels
- [X] Network middleware
- [ ] React Hooks Package
- [ ] Angular Package
- [ ] Vue Package
- [ ] CDN for compiled client
- [X] Docker image for instant deployment

---

*More updates coming soon!*
*❤️ - Emma*

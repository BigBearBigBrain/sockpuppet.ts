# Sockpuppet

![img](https://github.com/BigBearBigBrain/sockpuppet.ts/raw/main/sockpuppet-logo.svg)

## Contents

- [Usage](#usage)
  - [Server](#server)
  - [Client](#client)

<!-- - [Roadmap](#roadmap) -->

Sockpuppet is a lightweight, event driven, and easy to use WebSocket library for
Deno. It is designed to be simple and easy to use, while still providing a
powerful and flexible API for building real-time applications.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Usage

### Server

To use Sockpuppet, you first need to create a new instance of the `Sockpuppet`
class. This class represents the server that will handle all of the WebSocket
connections and messages.

```typescript
import { Sockpuppet } from "@cgg/sockpuppet";

const sockpuppet = new Sockpuppet();
```

Sockpuppet is up and running! Now you can start handling WebSocket connections
and messages.

### Client

The client handles all of the everything. The core objective of Sockpuppet is
flexibility, so the just about anything you can do with the server, you can do
with the client.

```typescript
import { Message, Sockpuppet } from "@cgg/sockpuppet/client";

const sockpuppet = new Sockpuppet("ws://localhost:8000");
const channelName = "channel";

sockpuppet.createChannel(channelName);
sockpuppet.joinChannel(channelName);

sockpuppet.subscribe(channelName, (channel) => {
  const listener = (message) => {
    console.log(message.content);
  };
  channel.addEventListener("message", listener);
  channel.sendMessage(Message.create("Hello World!", { echo: true }));
  return () => channel.removeEventListener("message", listener);
});
```

## Event Driven API

Sockpuppet is event driven. You can listen for events on the client and server
using the `addEventListener` method. The message event is triggered every time a
message is sent, regardless of its event type.

These events are triggered on both the core sockpuppet instance and on the
respective channel.

```typescript
import { Message, Sockpuppet } from "@cgg/sockpuppet/client";

const sockpuppet = new Sockpuppet("ws://localhost:8000");
const channelName = "channel";

sockpuppet.createChannel(channelName);
sockpuppet.joinChannel(channelName);

sockpuppet.addEventListener("message", (e) => {
  console.log(e.detail.message);
});

sockpuppet.subscribe(channelName, (channel) => {
  const listener = (e) => {
    console.log(e.detail.message);
  };
  channel.addEventListener("message", listener);
  channel.sendMessage(Message.create("Hello World!", { echo: true }));
  return () => channel.removeEventListener("message", listener);
});
```

### Custom Events

You can create your own events by simply building a custom event and dispatching
it using the Message static methods.

#### Client

```typescript
import { Message, Sockpuppet } from "@cgg/sockpuppet/client";

const sockpuppet = new Sockpuppet("ws://localhost:8000");

const eventName = "custom-event";
sockpuppet.addEventListener(eventName, (e) => {
  console.log(e.detail.message);
});

const event = Message.event(eventName, "Custom Event");
sockpuppet.sendMessage(event);
```

#### Server

```typescript
import { Message, Sockpuppet } from "@cgg/sockpuppet";

const sockpuppet = new Sockpuppet();

sockpuppet.addEventListener("custom-event", (e) => {
  console.log(e.detail.message);
});
```

### News

Version 1.0 is here, and we are out of alpha. This version was a massive rewrite
that got rid of a lot of unnecessary complication. As you would have noticed,
the API is a lot cleaner and easier to use. By moving to the JS native
EventTarget API, we were able to remove a lot of the complexity that was
previously required to make a real-time application.

Unfortunately this version is not backwards compatible as the original methods
were too vague and "dangerous." To help mitigate this, a new handshake protocol
has been implemented so that disparate clients can understand the server's
capabilities. If this handshake fails, the client will be disconnected.

There is also an unfortunate regression, that being the removal of the
dashboard. This will be re-added in 1.1 with new features. In theory, existing
instances of the dashboard could work for testing messages, but it will not get
updated channel and client information.

---

_More updates coming soon!_ _❤️ - Emma_

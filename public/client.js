// client/channel.ts
var Channel = class extends EventTarget {
  constructor(id, parent) {
    super();
    this.id = id;
    this.parent = parent;
    this.parent = parent;
  }
  receiveMessage(packet) {
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: packet
      })
    );
    if (packet.message !== "message") {
      this.dispatchEvent(
        new CustomEvent(packet.event, {
          detail: packet
        })
      );
    }
  }
  sendMessage(packet) {
    packet.to = this.id;
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: packet
      })
    );
    if (packet.message !== "message") {
      this.dispatchEvent(
        new CustomEvent(packet.event, {
          detail: packet
        })
      );
    }
    this.parent.sendMessage(packet);
  }
  delete() {
    this.dispatchEvent(new CustomEvent("delete"));
  }
};

// client/Sockpuppet.ts
var Sockpuppet = class extends EventTarget {
  _socket;
  _handshakeVersion = "1.0";
  _serverVersion = "1.0";
  _serverOutdated = false;
  channels = /* @__PURE__ */ new Map();
  subscriptions = /* @__PURE__ */ new Map();
  _id;
  get id() {
    return this._id;
  }
  queue = [];
  constructor(url) {
    super();
    this.configureSocket(url);
  }
  configureSocket(url) {
    this._socket = new WebSocket(url);
    this._socket.addEventListener("open", () => {
      this._socket.send(JSON.stringify({
        version: this._handshakeVersion,
        event: "handshake"
      }));
      this.processQueue();
    });
    this._socket.addEventListener("message", (e) => {
      try {
        const message = e.data;
        switch (message) {
          case "ping":
            this._socket.send("pong");
            break;
          default:
            this.handleMessage(message);
        }
      } catch (e2) {
        console.log("[Sockpuppet]: Error processing message", e2);
      }
    });
  }
  handleMessage(e) {
    const message = JSON.parse(e);
    switch (message.event) {
      case "join":
        this.handleJoin(message);
        break;
      case "create":
        this.handleCreate(message);
        break;
      case "leave":
        this.handleLeave(message);
        break;
      case "handshake":
        this.handleHandshake(e);
        break;
      default:
        this.handleMessageEvent(message);
        break;
    }
  }
  handleHandshake(message) {
    const handshake = JSON.parse(message);
    this._id = handshake.clientId;
    this._serverVersion = handshake.version;
    this._serverOutdated = Boolean(handshake.status);
  }
  handleMessageEvent(message) {
    this.dispatchEvent(
      new CustomEvent("message", {
        detail: message
      })
    );
    if (message.to === this.id && message.event !== "message") {
      this.dispatchEvent(
        new CustomEvent(message.event, {
          detail: message
        })
      );
      return;
    }
    const channel = this.channels.get(message.to);
    if (channel) {
      channel.receiveMessage(message);
    }
  }
  handleLeave(message) {
    const channel = this.channels.get(message.to);
    if (channel) {
      channel.delete();
      this.channels.delete(message.to);
    }
  }
  handleCreate(message) {
    this.dispatchEvent(
      new CustomEvent("create", {
        detail: message.message
      })
    );
  }
  handleJoin(message) {
    const channel = new Channel(message.message, this);
    this.channels.set(message.message, channel);
    for (const [pattern, subscriptions] of this.subscriptions.entries()) {
      if (channel.id.match(pattern)) {
        for (const subscription of subscriptions) {
          this.subscribeToChannel(subscription, channel);
        }
      }
    }
  }
  sendMessage(packet) {
    this.queue.push(packet);
    this.processQueue();
  }
  disconnect() {
    this._socket.close();
  }
  subscribe(pattern, callback) {
    const subscriptions = this.subscriptions.get(pattern);
    if (subscriptions) {
      subscriptions.push(callback);
      for (const [id, channel] of this.channels) {
        if (id.match(pattern)) {
          this.subscribeToChannel(callback, channel);
        }
      }
    } else {
      this.subscriptions.set(pattern, [callback]);
    }
  }
  subscribeToChannel(subscription, channel) {
    const unsub = subscription(channel);
    channel.addEventListener("delete", unsub);
  }
  processQueue() {
    if (this._socket.OPEN !== 1) return;
    while (this.queue.length > 0) {
      const packet = this.queue.shift();
      this._socket.send(JSON.stringify(packet));
    }
  }
  createChannel(channelId) {
    this.queue.push(Message.event("create", void 0, channelId));
  }
  joinChannel(channelId) {
    this.queue.push(Message.event("join", void 0, channelId));
  }
  leaveChannel(channelId) {
    this.queue.push(Message.event("leave", void 0, channelId));
  }
};

// client/message.ts
var Message = class {
  static create(message, opts) {
    return {
      event: "message",
      message,
      echo: opts?.echo ?? false,
      to: "all",
      from: ""
    };
  }
  /**
   * @description Creates a custom event. If you are sending an event to a channel, you should not supply a channel name and instead use the channel's `sendMessage` method.
   * @param event The name of the event
   * @param message The message to send
   * @param channel The channel to send the message to
   */
  static event(event, message, channel) {
    return {
      event,
      message: message ?? "",
      echo: false,
      to: channel ?? "all",
      from: ""
    };
  }
};

// testClient.ts
var sockpuppet = new Sockpuppet("ws://localhost:8000");
var channelName = "channel";
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

// client/channel.ts
var Channel = class extends EventTarget {
  constructor(id, parent) {
    super();
    this.id = id;
    this.parent = parent;
    this.parent = parent;
  }
  receiveMessage(packet) {
    this.dispatchEvent(new CustomEvent("message", {
      detail: packet
    }));
    this.dispatchEvent(new CustomEvent(packet.event, {
      detail: packet
    }));
  }
  sendMessage(packet) {
    this.dispatchEvent(new CustomEvent("message", {
      detail: packet
    }));
    this.dispatchEvent(new CustomEvent(packet.event, {
      detail: packet
    }));
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
    if (message.to === this.id) {
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
    this._socket.send(JSON.stringify(packet));
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
  createChannel(channelId) {
    this._socket.send(JSON.stringify({
      event: "create",
      to: channelId
    }));
  }
  joinChannel(channelId) {
    this._socket.send(JSON.stringify({
      event: "join",
      to: channelId
    }));
  }
  leaveChannel(channelId) {
    this._socket.send(JSON.stringify({
      event: "join",
      to: channelId
    }));
  }
};

// testClient.ts
globalThis.Sockpuppet = Sockpuppet;

import { Message, Sockpuppet } from "@cgg/sockpuppet/client";

const sockpuppet = new Sockpuppet("ws://localhost:8000");
const channelName = "channel";

sockpuppet.createChannel(channelName);
sockpuppet.joinChannel(channelName);

sockpuppet.addEventListener("message", (e) => {
  console.log(e.detail.message);
});

sockpuppet.subscribe(channelName, (channel) => {
  const listener = (e: CustomEvent<ClientPacket>) => {
    console.log(e.detail.message);
  };
  channel.addEventListener("message", listener);
  channel.sendMessage(Message.create("Hello World!", { echo: true }));
  return () => channel.removeEventListener("message", listener);
});

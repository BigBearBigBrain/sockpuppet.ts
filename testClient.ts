import { Message, Sockpuppet } from "@cgg/sockpuppet/client";

const sockpuppet = new Sockpuppet("ws://localhost:8000");
const channelName = "channel";

sockpuppet.createChannel(channelName);
sockpuppet.joinChannel(channelName);

sockpuppet.addEventListener("message", (e: any) => {
  console.log(e.detail.content);
});

sockpuppet.subscribe(channelName, (channel) => {
  const listener = (e: any) => {
    console.log(e.detail);
  };
  channel.addEventListener("message", listener);
  channel.sendMessage(Message.create("Hello World!", { echo: true }));
  return () => channel.removeEventListener("message", listener);
});

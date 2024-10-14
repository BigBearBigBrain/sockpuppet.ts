import type { Channel } from "./server/channel.ts";
import type { Channel as ClientChannel } from "./client/channel.ts";
import type { Packet } from "./mod.ts";

declare global {
  type ChannelSubscription<T> = (channel: IChannel<T>) => () => void;
  interface ClientPacket {
    event: string,
    to: string,
    from: string,
    message: string,
  } 
  interface IChannel<T = ClientPacket | Packet> extends EventTarget {
    id: string,
    sendMessage: (packet: T) => void
    delete: () => void
  }
}

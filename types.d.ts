import type { Channel } from "./server/channel.ts";
import type { Channel as ClientChannel } from "./client/channel.ts";
import type { Packet } from "./server/packet.ts";

declare global {
  type ChannelSubscription = (channel: Channel) => () => void;
  type ClientChannelSubscription = (channel: ClientChannel) => () => void;
  interface ClientPacket {
    event: string;
    to: string;
    from: string;
    message: string;
    echo?: boolean;
  }

  type TypedEventTarget<EventMap extends object> = {
    new (): IntermediateEventTarget<EventMap>;
  };

  interface IntermediateEventTarget<EventMap> extends EventTarget {
    addEventListener<K extends keyof EventMap>(
      type: K,
      listener: (
        event: EventMap[K] extends Event ? EventMap[K] : Event,
      ) => EventMap[K] extends Event ? void : never,
      options?: boolean | AddEventListenerOptions,
    ): void;

    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof EventMap>(
      type: K,
      listener: (
        event: EventMap[K] extends Event ? EventMap[K] : Event,
      ) => EventMap[K] extends Event ? void : never,
      options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }
  type PuppetEvent = CustomEvent<ClientPacket>;

  interface SockpuppetEventMap {
    "message": PuppetEvent;
    "create": PuppetEvent;
    "join": PuppetEvent;
    "leave": PuppetEvent;
    "handshake": PuppetEvent;
    [key: string]: PuppetEvent;
  }
}

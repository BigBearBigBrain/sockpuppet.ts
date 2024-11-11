import type { Channel } from "./server/channel.ts";
import type { Channel as ClientChannel } from "./client/channel.ts";

// declare global {
export type ChannelSubscription = (channel: Channel) => () => void;
export type ClientChannelSubscription = (channel: ClientChannel) => () => void;
export interface ClientPacket {
  event: string;
  to: string;
  from: string;
  message: string;
  echo?: boolean;
}

export type TypedEventTarget<EventMap extends object> = {
  new (): IntermediateEventTarget<EventMap>;
};

export interface IntermediateEventTarget<EventMap> extends EventTarget {
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
export type PuppetEvent = CustomEvent<ClientPacket>;

export interface SockpuppetEventMap {
  "message": PuppetEvent;
  "create": PuppetEvent;
  "join": PuppetEvent;
  "leave": PuppetEvent;
  "handshake": PuppetEvent;
  [key: string]: PuppetEvent;
}
export type Handler = (req: Request) => Response | Promise<Response>;
// }

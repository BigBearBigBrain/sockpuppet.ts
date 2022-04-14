import { Packet } from './Packet.ts';

// deno-lint-ignore no-explicit-any
export type packetCallback = ((packet: Packet<any>) => void);
export type disconnectCallback = (clientId: string) => void;

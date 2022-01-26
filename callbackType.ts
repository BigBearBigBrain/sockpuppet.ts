import { Packet } from './Packet.ts';

export type packetCallback = ((packet: Packet<any>) => void);
export type disconnectCallback = (clientId: number) => void;

import Client from './Client.ts';
import EventEmitter from './EventEmitter.ts';

export class Packet<T = unknown> {
  from: Client | EventEmitter;

  message?: T;

  to: string;

  constructor(
    from: Client | EventEmitter,
    to: string,
    message?: T
  ) {
    this.from = from;
    this.to = to;
    // if (message) this.message = JSON.stringify(message);
    this.message = message;
  }
}
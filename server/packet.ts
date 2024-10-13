import type { Client } from "./client.ts";

export class Packet {
  private _event: string;
  private _to: string;
  private _message: string;
  private _echo: boolean;
  private _from: Client;

  constructor(from: Client, event: string, to: string, message: string, echo?: boolean) {
    this._event = event;
    this._to = to;
    this._message = message;
    this._echo = echo ?? false;
    this._from = from;
  }

  public get event() {
    return this._event;
  }

  public get to() {
    return this._to;
  }

  public get message() {
    return this._message;
  }

  public get echo() {
    return this._echo;
  }

  public get from() {
    return this._from;
  }
  
  public serialize() {
    return JSON.stringify({
      event: this._event,
      to: this._to,
      message: this._message,
    });
  }
} 
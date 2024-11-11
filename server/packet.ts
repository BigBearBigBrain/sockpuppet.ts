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

  public get event(): string {
    return this._event;
  }

  public get to(): string {
    return this._to;
  }

  public get message(): string {
    return this._message;
  }

  public get echo(): boolean {
    return this._echo;
  }

  public get from(): Client {
    return this._from;
  }
  
  public serialize(): string {
    return JSON.stringify({
      event: this._event,
      to: this._to,
      message: this._message,
      from: this._from.id
    });
  }
} 
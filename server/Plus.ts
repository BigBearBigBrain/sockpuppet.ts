import { Sockpuppet } from "./Sockpuppet.ts";
import type {Handler} from "@std/http"

class SockpuppetResponse {
  private _body?: string | null;
  private _status?: number;
  private _headers: Headers;
  private _statusText?: string;

  constructor(body?: string | null, init?: ResponseInit) {
    const { status, headers, statusText } = init ?? {};
    this._body = body;
    this._status = status;
    this._headers = new Headers(headers || {});
    this._statusText = statusText;
  }

  body(body: string) {
    this._body = body;
    return this;
  }

  status(status: number) {
    this._status = status;
    return this;
  }

  send(body?: string | null) {
    this._body = body;
    this.setHeader("Content-Type", "text/plain");
    return this.finish();
  }

  sendJson(body?: string | null) {
    this._body = body;
    this.setHeader("Content-Type", "application/json");
    return this.finish();
  }

  setHeader(name: string, value: string) {
    this._headers.set(name, value);
  }

  finish() {
    return new Response(this._body, {
      headers: this._headers,
      status: this._status ?? 200,
      statusText: this._statusText,
    });
  }
}

export class SockpuppetPlus extends Sockpuppet {
  private handlers: Handler[] = [];

  public addHandler(handler: Handler) {
    this.handlers.push(handler);
  }

  protected override handler(req: Request): Response | Promise<Response> {
    if (req.headers.get("upgrade") === "websocket") {
      return super.handler(req);
    }
    for (const handler of this.handlers) {
      const res = handler(req);
      if (res) return res;
    }
    return new Response("End of handlers", {status: 400})
  }
}

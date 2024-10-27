import { Sockpuppet } from "./Sockpuppet.ts";

type Handler = (
  req: Request,
) => Response | Promise<Response | undefined | void> | undefined;

export class SockpuppetPlus extends Sockpuppet {
  private handlers: Handler[] = [];

  public addHandler(handler: Handler) {
    this.handlers.push(handler);
  }

  protected override async handler(req: Request): Promise<Response> {
    for (const handler of this.handlers) {
      const res = handler(req);
      if (res) {
        let done = await res;
        if (done instanceof Response) {
          done.headers.set("access-control-allow-origin", "*");
          return done;
        }
      }
    }
    if (req.headers.get("upgrade") === "websocket") {
      return super.handler(req);
    }
    return new Response("End of handlers", { status: 400 });
  }
}

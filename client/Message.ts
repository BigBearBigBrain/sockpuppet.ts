export class Message<T = string> {
  from: string | number;
  to: string;
  message: T;
  // We could actually make the server emit specific event names instead of using the message as the event
  event?: string;
  constructor(m: Message<T>) {
    this.to = m.to;
    this.from = m.from;
    this.message = m.message;
    this.event = m.event;
  }
}
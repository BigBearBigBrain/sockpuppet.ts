declare global {
  interface ClientPacket {
    event: string;
    to: string;
    from: string;
    message: string;
  }
}

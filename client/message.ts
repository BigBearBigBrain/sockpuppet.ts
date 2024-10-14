export class Message {
  static create(message: string, opts?: { echo: boolean }): ClientPacket {
    return {
      event: "message",
      message,
      echo: opts?.echo ?? false,
      to: "all",
      from: "",
    };
  }

  /**
   * @description Creates a custom event. If you are sending an event to a channel, you should not supply a channel name and instead use the channel's `sendMessage` method.
   * @param event The name of the event
   * @param message The message to send
   * @param channel The channel to send the message to
   */
  static event(
    event: string,
    message?: string,
    channel?: string,
  ): ClientPacket {
    return {
      event,
      message: message ?? "",
      echo: false,
      to: channel ?? "all",
      from: "",
    };
  }
}

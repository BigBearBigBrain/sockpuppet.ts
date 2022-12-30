export default class Client {
  public id: string;
  public socket: WebSocket;

  public listeningTo: string[] = [];

  public pongReceived = false;

  public heartbeat?: number;

  public channelListSubscriber = false;

  constructor(clientId: string, clientSocket: WebSocket) {
    this.id = clientId;
    this.socket = clientSocket;
  }
}
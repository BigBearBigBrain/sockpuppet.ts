import { WebSocket } from 'std/ws/mod.ts';

export default class Client {
  public id: number;
  public socket: WebSocket;

  public listeningTo: string[] = [];

  public pongReceived = false;

  public heartbeat?: number;

  constructor(clientId: number, clientSocket: WebSocket) {
    this.id = clientId;
    this.socket = clientSocket;
  }
}
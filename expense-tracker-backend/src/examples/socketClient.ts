// This is a client-side example to demonstrate how to connect to the WebSocket server
// You would typically include this in your frontend application

import { Manager } from 'socket.io-client';

interface OnlineUser {
  userId: string;
  username: string;
  lastActive: Date;
}

interface SocketError {
  message: string;
  code?: string;
}

const SERVER_URL = 'http://localhost:3000';

export class SocketClient {
  private socket: any | null = null;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    const manager = new Manager(SERVER_URL, {
      auth: {
        token: this.token
      }
    });
    this.socket = manager.socket('/');

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('onlineUsers', (data: OnlineUser[]) => {
      console.log('Online users:', data);
    });

    this.socket.on('error', (error: SocketError) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Example usage:
// const client = new SocketClient('your-jwt-token');
// client.connect();

export default SocketClient; 
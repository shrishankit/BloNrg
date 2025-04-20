"use strict";
// This is a client-side example to demonstrate how to connect to the WebSocket server
// You would typically include this in your frontend application
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = void 0;
const socket_io_client_1 = require("socket.io-client");
const SERVER_URL = 'http://localhost:3000';
class SocketClient {
    constructor(token) {
        this.socket = null;
        this.token = token;
    }
    connect() {
        const manager = new socket_io_client_1.Manager(SERVER_URL, {
            auth: {
                token: this.token
            }
        });
        this.socket = manager.socket('/');
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        if (!this.socket)
            return;
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });
        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
        this.socket.on('onlineUsers', (data) => {
            console.log('Online users:', data);
        });
        this.socket.on('error', (error) => {
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
exports.SocketClient = SocketClient;
// Example usage:
// const client = new SocketClient('your-jwt-token');
// client.connect();
exports.default = SocketClient;

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationserverService {
  private ws!: WebSocket;

  constructor() {}

  connectWebSocket(): WebSocket {
    this.ws = new WebSocket('ws://localhost:8080');
    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
      this.ws.send(JSON.stringify({ type: 'subscribe', userId: 143 }));
    };

    this.ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return this.ws;
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

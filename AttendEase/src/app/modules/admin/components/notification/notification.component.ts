import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationserverService } from '../../../../core/server/notificationserver.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private ws!: WebSocket;

  constructor(private notificationService: NotificationserverService) {}

  ngOnInit(): void {
    this.ws = this.notificationService.connectWebSocket();
    this.ws.onmessage = (event) => {
      const newNotifications = JSON.parse(event.data);
      this.notifications.push(...newNotifications);
    };
  }

  ngOnDestroy(): void {
    this.notificationService.disconnectWebSocket();
  }
}

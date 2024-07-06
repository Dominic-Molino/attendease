import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Message } from 'primeng/api';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { RefreshsubService } from '../../../core/service/shared/refreshsub.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent implements OnInit {
  conversation: any;
  messages: any;
  messageRequests: any;
  messageForm = this.builder.group({
    conversation_id: this.builder.control('', Validators.required),
    sender_id: this.builder.control('', Validators.required),
    message: this.builder.control('', Validators.required),
  });

  private pollingSubscription?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private builder: FormBuilder,
    private dialog: MatDialogRef<Message>,
    private service: AuthserviceService,
    private refreshService: RefreshsubService
  ) {}

  ngOnInit(): void {
    this.service
      .getMessageRequests(this.data.currentUser)
      .subscribe((res: any) => {
        this.messageRequests = res.payload;
        this.loadConversation(this.data.currentUser, this.data.otherUser);
        this.startPolling(); // Start polling messages after initial load
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  startPolling(): void {
    // Polling interval, adjust as needed
    const pollInterval = 5000; // 5 seconds

    // Polling mechanism
    this.pollingSubscription = interval(pollInterval).subscribe(() => {
      if (this.conversation) {
        this.loadMessages();
      }
    });
  }

  loadConversation(currentUser: number, otherUser: number) {
    this.service
      .getConversation(currentUser, otherUser)
      .subscribe((res: any) => {
        this.conversation = res.payload[0];
        this.loadMessages(); // Load messages initially
      });
  }

  loadMessages() {
    if (this.conversation) {
      this.service
        .getConversationMessages(this.conversation.id)
        .subscribe((res: any) => {
          this.messages = res.payload;
        });
    }
  }

  goToOtherConvo(otherUser: number) {
    this.loadConversation(this.data.currentUser, otherUser);
  }

  sendMessage() {
    this.messageForm.patchValue({
      conversation_id: this.conversation.id,
      sender_id: this.data.currentUser,
    });

    if (this.messageForm.valid) {
      this.service.sendMessage(this.messageForm.value).subscribe((res: any) => {
        Swal.fire({
          title: 'Message Sent!',
          icon: 'success',
        });

        // Clear message form and trigger immediate message load
        this.messageForm.patchValue({
          message: '',
        });
        this.loadMessages();
      });
    } else {
      Swal.fire({
        title: 'At least write something first!',
        icon: 'error',
      });
    }
  }
}

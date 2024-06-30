import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-route',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './register-route.component.html',
  styleUrl: './register-route.component.css',
})
export class RegisterRouteComponent {
  @Output() closePopup = new EventEmitter<void>();

  onClose() {
    this.closePopup.emit();
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ViewComponent } from './component/view/view.component';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css',
})
export class EditEventComponent {
  constructor(private dialog: MatDialog) {}

  editEvent() {
    this.dialog.open(ViewComponent);
  }
}

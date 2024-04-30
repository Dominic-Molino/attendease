import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule } from '@angular/common';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { EditEventComponent } from '../../components/edit-event/edit-event.component';
import { ReadEventComponent } from '../../components/read-event/read-event.component';

@Component({
  selector: 'app-org-event',
  standalone: true,
  templateUrl: './org-event.component.html',
  styleUrl: './org-event.component.css',
  imports: [
    MatDialogModule,
    CommonModule,
    DeleteEventComponent,
    EditEventComponent,
  ],
})
export class OrgEventComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(AddEventComponent, {
      width: '50%',
    });
  }

  viewEvent() {
    this.dialog.open(ReadEventComponent);
  }
}

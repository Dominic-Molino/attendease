import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEventComponent } from '../../components/add-event/add-event.component';
import { CommonModule } from '@angular/common';
import { DeleteEventComponent } from '../../components/delete-event/delete-event.component';
import { EditEventComponent } from '../../components/edit-event/edit-event.component';
import { ReadEventComponent } from '../../components/read-event/read-event.component';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';

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
export class OrgEventComponent implements OnInit {
  eventData: any;
  latestEvent: any;
  otherEvents: any[] = [];
  upcomingEvents: any[] = [];
  ongoingEvents: any[] = [];
  pastEvents: any[] = [];

  constructor(
    private routes: Router,
    private service: EventService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      this.eventData = result.payload;
      const today = new Date();
      this.eventData.forEach((event: any) => {
        const startDate = new Date(event.event_start_date);
        const endDate = new Date(event.event_end_date);
        if (endDate < today) {
          this.pastEvents.push(event);
        } else if (startDate <= today && endDate >= today) {
          this.ongoingEvents.push(event);
        } else {
          this.upcomingEvents.push(event);
        }
      });
    });
  }

  openDialog() {
    this.dialog.open(AddEventComponent, {
      width: '50%',
    });
  }

  viewEvent(event: any) {
    this.dialog.open(ReadEventComponent, {
      data: { event },
      width: '50%',
    });
  }
}

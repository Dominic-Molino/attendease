import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { PreviewComponent } from '../../components/preview/preview.component';
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  constructor(private dialog: MatDialog, private service: AuthserviceService) {}

  eventData: any;
  latestEvent: any;
  otherEvents: any[] = [];
  maxChar: number = 100;

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      this.eventData = result;
      if (this.eventData && this.eventData.payload) {
        const eventsArray = this.eventData.payload;
        eventsArray.sort(
          (a: any, b: any) =>
            new Date(b.event_start_date).getTime() -
            new Date(a.event_start_date).getTime()
        );
        this.latestEvent = eventsArray[0];
        this.otherEvents = eventsArray.slice(1);
      }
    });
  }

  viewEvent(event: any) {
    this.dialog.open(PreviewComponent, {
      data: { event },
    });
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReadEventComponent } from '../../../organizer/components/read-event/read-event.component';
import { AuthserviceService } from '../../../../core/service/authservice.service';
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

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      this.eventData = result;
      console.log(this.eventData);
      if (this.eventData && this.eventData.payload) {
        const eventsArray = this.eventData.payload;
        console.log(eventsArray);
      }
    });
  }

  viewEvent() {
    this.dialog.open(ReadEventComponent);
  }

  maxChar: number = 100;

  events: Events = {
    eventName: 'Broken Covenant Riven Release!',
    eventDate: 'March 9, 2023',
    eventDesc:
      'New skinline, Broken Covenant is no available for purchase in league of legends store! This batch of skins features a Legendary skin for Riven, a Prestige skin for Miss Fortune as well as a full set of Epic skins! All non-prestige skins are sold separately or as a bundle with border & Icon! All chomas can also be bought together or separate!',
  };

  truncateDescription(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }
}

export interface Events {
  eventName: string;
  eventDate: string;
  eventDesc: string;
}

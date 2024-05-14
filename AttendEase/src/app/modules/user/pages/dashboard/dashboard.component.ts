import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { Router, RouterLink } from '@angular/router';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { EventService } from '../../../../core/service/event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CalendarComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  events: any[] = [];

  constructor(private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        if (res) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const regEndDate = new Date(event.event_registration_end);
            const eventStartDate = new Date(event.event_start_date);
            event.eventState = '';

            if (regEndDate < currentDate) {
              event.eventState = 'done';
            } else if (eventStartDate <= currentDate) {
              event.eventState = 'ongoing';
            } else {
              event.eventState = 'upcoming';
            }

            return event;
          });
        } else {
          console.error(
            'Failed to retrieve user events:',
            res ? res.message : 'Unknown error'
          );
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  onClickButton() {
    this.router.navigate(['student/events']);
  }
}

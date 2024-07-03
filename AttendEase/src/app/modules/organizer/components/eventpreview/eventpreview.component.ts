import { Component, OnInit, Sanitizer } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../../../interfaces/EventInterface';
import { Observable, map, of, switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditEventComponent } from '../edit-event/edit-event.component';

@Component({
  selector: 'app-eventpreview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventpreview.component.html',
  styleUrl: './eventpreview.component.css',
})
export class EventpreviewComponent implements OnInit {
  events: Event[] = [];
  eventId: any;

  constructor(
    private service: EventService,
    private router: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.eventId = +params['eventId'];
      this.fetchEventDetails(this.eventId);
    });
  }

  fetchEventDetails(eventId: any) {
    this.service.getEventById(eventId).subscribe({
      next: (result: any) => {
        if (result && Array.isArray(result)) {
          this.events = result.map((event) => ({
            ...event,
            event_start_date: new Date(event.event_start_date),
            event_end_date: new Date(event.event_end_date),
            event_registration_start: new Date(event.event_registration_start),
            event_registration_end: new Date(event.event_registration_end),
            categories: JSON.parse(event.categories),
            target_participants: JSON.parse(event.target_participants),
            event_image$: this.getEventImage(event.event_id),
          }));
        }
        console.log(this.events);
      },
    });
  }

  getFormattedTargetParticipants(participants: any[]): string {
    if (!Array.isArray(participants)) {
      console.error('Invalid participants data:', participants);
      return '';
    }

    const groupedParticipants: { [key: string]: string[] } = {};

    participants.forEach((participant) => {
      if (!groupedParticipants[participant.department]) {
        groupedParticipants[participant.department] = [];
      }
      groupedParticipants[participant.department].push(participant.year_levels);
    });

    return Object.keys(groupedParticipants)
      .map((department) => {
        const years = groupedParticipants[department].join(', ');
        return `${department} - ${years}`;
      })
      .join(' | ');
  }

  getEventImage(eventId: number): Observable<SafeResourceUrl> {
    return this.service.getEventImage(eventId).pipe(
      map((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
      })
    );
  }

  closePage() {
    this.location.back();
  }

  openDialog(eventId: any) {
    this.service.getEventById(eventId).subscribe(
      (eventDetails: any) => {
        const modal = this.dialog.open(EditEventComponent, {
          data: eventDetails,
          disableClose: true,
          width: '60%',
          height: '90%',
        });

        modal.afterClosed().subscribe((response) => {
          this.fetchEventDetails(eventId);
        });
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approval',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './approval.component.html',
  styleUrl: './approval.component.css',
})
export class ApprovalComponent implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  loading: boolean = false;

  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  sortDirection: 'asc' | 'desc' = 'asc'; // Track sorting direction

  constructor(private evService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.evService.getEvents().subscribe((res: any) => {
      this.events = res.payload;
      console.log(this.events);
      this.filteredEvents = [...this.events]; // Initialize filteredEvents with all events
    });
  }

  openPage(eventId: any) {
    this.router.navigate([`/admin/admin-approval/${eventId}`]);
  }

  searchEvents(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    if (!searchTerm) {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(
        (event) =>
          event.event_name.toLowerCase().includes(searchTerm) ||
          event.organizer_name.toLowerCase().includes(searchTerm) ||
          event.organizer_organization.toLowerCase().includes(searchTerm)
      );
    }
  }

  sortEventsByStatus() {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredEvents.sort((a, b) => {
      if (a.approval_status > b.approval_status) {
        return direction;
      }
      if (a.approval_status < b.approval_status) {
        return -direction;
      }
      return 0;
    });
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
}

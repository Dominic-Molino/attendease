import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

interface Organizer {
  id: number;
  role_id: number;
  fname: string;
  lname: string;
  organization: string;
  events?: any[];
  dropdownOpen?: boolean;
}

@Component({
  selector: 'app-event-report-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './event-report-page.component.html',
  styleUrl: './event-report-page.component.css',
})
export class EventReportPageComponent implements OnInit {
  organizers: Organizer[] = [];
  events: any[] = [];
  showReportMessage = false;

  constructor(
    private service: EventService,
    private user: AuthserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrganizer();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showReportMessage = this.shouldShowMessage(this.router.url);
      });
    this.showReportMessage = this.shouldShowMessage(this.router.url);
  }

  loadOrganizer() {
    this.user.getUsers().subscribe((res: any) => {
      if (res && Array.isArray(res.payload)) {
        const filteredUsers = res.payload.filter(
          (user: any) => user.role_id === 2
        );

        this.organizers = filteredUsers.map((user: any) => ({
          id: user.user_id,
          role_id: user.role_id,
          fname: user.first_name,
          lname: user.last_name,
          organization: user.organization,
          dropdownOpen: false,
        }));

        this.organizers.forEach((organizer, index) => {
          this.loadOrganizerEvents(organizer, index);
        });
      }
    });
  }

  loadOrganizerEvents(organizer: Organizer, index: number) {
    this.service.getDoneEventsOfOrg(organizer.id).subscribe((res: any) => {
      this.organizers[index].events = res.payload;
    });
  }

  toggleDropdown(organizer: Organizer) {
    this.organizers.forEach((org) => {
      if (org !== organizer) {
        org.dropdownOpen = false;
      }
    });
    organizer.dropdownOpen = !organizer.dropdownOpen;
  }

  openEventReport(event_id: any) {
    this.router.navigate([`admin/admin-event-report/report/${event_id}`]);
    console.log(event_id);
  }

  private shouldShowMessage(url: string): boolean {
    return url === '/admin/admin-event-report';
  }
}

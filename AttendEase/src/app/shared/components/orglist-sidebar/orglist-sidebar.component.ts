import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';

interface Organizer {
  id: number;
  role_id: number;
  fname: string;
  lname: string;
  organization: string;
}

@Component({
  selector: 'app-orglist-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orglist-sidebar.component.html',
  styleUrl: './orglist-sidebar.component.css',
})
export class OrglistSidebarComponent implements OnInit {
  currId: any;
  organizers: Organizer[] = [];

  constructor(private service: AuthserviceService) {}

  ngOnInit(): void {
    this.loadOrganizer();
  }

  loadOrganizer() {
    this.service.getUsers().subscribe((res: any) => {
      if (res && Array.isArray(res.payload)) {
        console.log(res.payload);
        const filterUser = res.payload.filter((user: any) => {
          return user.role_id === 2;
        });

        this.organizers = filterUser.map(
          (user: any): Organizer => ({
            id: user.user_id,
            role_id: user.role_id,
            fname: user.first_name,
            lname: user.last_name,
            organization: user.organization,
          })
        );
        console.log(this.organizers);
      }
    });
  }

  getReport(organizer_id: any) {}
}

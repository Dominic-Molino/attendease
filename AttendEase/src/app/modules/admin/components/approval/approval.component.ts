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
  events?: any[] = [];
  loading: boolean = false;

  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  constructor(private evService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.evService.getEvents().subscribe((res: any) => {
      this.events = res.payload;
    });
  }

  openPage(eventId: any) {
    this.router.navigate([`/admin/admin-approval/${eventId}`]);
  }
}

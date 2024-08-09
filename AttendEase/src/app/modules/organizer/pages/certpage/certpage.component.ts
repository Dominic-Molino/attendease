import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certpage',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './certpage.component.html',
  styleUrl: './certpage.component.css',
})
export class CertpageComponent implements OnInit {
  events: any[] = [];
  currId: any;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadEvents(this.currId);
  }

  loadEvents(id: any) {
    this.service.getDoneEventsOfOrg(id).subscribe((res) => {
      this.events = res.payload;
    });
  }

  goToReport(eventId: any) {
    this.router.navigate([
      `organizer/event-certificate/certification/${eventId}`,
    ]);
  }
}

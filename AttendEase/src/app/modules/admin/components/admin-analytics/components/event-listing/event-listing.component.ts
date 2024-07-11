import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataAnalyticsService } from '../../../../../../core/service/data-analytics.service';

@Component({
  selector: 'app-event-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-listing.component.html',
  styleUrl: './event-listing.component.css',
})
export class EventListingComponent implements OnInit {
  events: any[] = [];

  constructor(private data: DataAnalyticsService) {}

  ngOnInit(): void {
    this.data.getAllEvents().subscribe((res) => {
      this.events = res.payload;
      console.log(this.events);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthserviceService } from '../../../../../core/service/authservice.service';
import { DataAnalyticsService } from '../../../../../core/service/data-analytics.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css',
})
export class CardsComponent implements OnInit {
  totalUser: any[] = [];
  userCount: number = 0;
  totalEvents: any[] = [];
  eventCount: number = 0;
  totalRegisteredUser: number = 0;

  constructor(
    private service: AuthserviceService,
    private data: DataAnalyticsService
  ) {}

  ngOnInit(): void {
    this.service.getUsers().subscribe((res: any) => {
      this.totalUser = res.payload;
      this.userCount = this.totalUser.length;
    });

    this.service.getAllEvents().subscribe((res: any) => {
      this.totalEvents = res.payload;
      this.eventCount = this.totalEvents.length;
    });

    this.data.getAllRegisteredUser().subscribe((res) => {
      this.totalRegisteredUser = res.payload;
    });
  }
}

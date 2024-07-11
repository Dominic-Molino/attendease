import { Component } from '@angular/core';
import { AuthserviceService } from '../../../../../../core/service/authservice.service';
import { EventService } from '../../../../../../core/service/event.service';
import { DataAnalyticsService } from '../../../../../../core/service/data-analytics.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css',
})
export class CardsComponent {
  data: any;
  chartOption: any;

  constructor(
    private event: DataAnalyticsService,
    private auth: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.event.getDashboardData().subscribe((res) => {
      this.data = res.payload;
      console.log(this.data);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CardsComponent } from './components/cards/cards.component';
import { CarouselModule } from 'primeng/carousel';
import { ComparingEventsComponent } from './components/comparing-events/comparing-events.component';
import { UserFeedbackRateComponent } from '../user-feedback-rate/user-feedback-rate.component';
import { ReportComponent } from './components/report/report.component';
import { BlockComponent } from '../../../modules/admin/components/admin-analytics/components/block/block.component';

@Component({
  selector: 'app-analytic',
  standalone: true,
  templateUrl: './analytic.component.html',
  styleUrl: './analytic.component.css',
  imports: [
    CardsComponent,
    CarouselModule,
    UserFeedbackRateComponent,
    ReportComponent,
  ],
})
export class AnalyticComponent implements OnInit {
  slides: string[] = [];
  slides2: string[] = [];
  ngOnInit(): void {
    this.slides = ['course', 'year-level', 'block'];
    this.slides2 = ['feedback', 'attendees'];
  }
}

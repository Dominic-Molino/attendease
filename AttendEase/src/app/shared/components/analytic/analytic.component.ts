import { Component, OnInit } from '@angular/core';
import { CardsComponent } from './components/cards/cards.component';
import { CourseComponent } from './components/course/course.component';
import { YearLevelComponent } from './components/year-level/year-level.component';
import { BlockComponent } from './components/block/block.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { CarouselModule } from 'primeng/carousel';
import { ComparingEventsComponent } from './components/comparing-events/comparing-events.component';
import { FeedbackChartComponent } from './components/feedback-chart/feedback-chart.component';
import { UserFeedbackRateComponent } from '../user-feedback-rate/user-feedback-rate.component';

@Component({
  selector: 'app-analytic',
  standalone: true,
  templateUrl: './analytic.component.html',
  styleUrl: './analytic.component.css',
  imports: [
    CourseComponent,
    CardsComponent,
    YearLevelComponent,
    BlockComponent,
    AttendanceComponent,
    CarouselModule,
    ComparingEventsComponent,
    FeedbackChartComponent,
    UserFeedbackRateComponent,
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

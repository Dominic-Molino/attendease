import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivitylogsComponent } from '../../../../shared/components/activitylogs/activitylogs.component';
import { EventListingComponent } from './components/event-listing/event-listing.component';
import { CarouselModule } from 'primeng/carousel';
import { CourseComponent } from './components/course/course.component';
import { YearLevelComponent } from './components/year-level/year-level.component';
import { BlockComponent } from './components/block/block.component';
import { ComparingEventsComponent } from '../../../../shared/components/analytic/components/comparing-events/comparing-events.component';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ActivitylogsComponent,
    EventListingComponent,
    CarouselModule,
    CourseComponent,
    YearLevelComponent,
    BlockComponent,
    ComparingEventsComponent,
  ],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css',
})
export class AdminAnalyticsComponent implements OnInit {
  slides: string[] = [];
  events: any[] = [];

  ngOnInit(): void {
    this.slides = ['course', 'year-level', 'block'];
  }
}

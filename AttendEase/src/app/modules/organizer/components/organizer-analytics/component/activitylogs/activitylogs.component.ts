import { Component, OnInit } from '@angular/core';
import { DataAnalyticsService } from '../../../../../../core/service/data-analytics.service';
import { EventService } from '../../../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-activitylogs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activitylogs.component.html',
  styleUrl: './activitylogs.component.css',
})
export class ActivitylogsComponent implements OnInit {
  currId: any;
  logs: any[] = [];

  constructor(
    private data: DataAnalyticsService,
    private service: EventService
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadLogs(this.currId);
  }

  loadLogs(id: any) {
    this.data.getActivityLogs(id).subscribe((res) => {
      this.logs = res.payload;
      console.log(this.logs);
    });
  }

  formatRegistrationDate(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  replaceEventName(word: string, name: string) {
    return word.replace('event', name);
  }
}

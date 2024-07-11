import { Component, OnInit } from '@angular/core';
import { DataAnalyticsService } from '../../../core/service/data-analytics.service';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { AuthserviceService } from '../../../core/service/authservice.service';

@Component({
  selector: 'app-activitylogs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activitylogs.component.html',
  styleUrl: './activitylogs.component.css',
})
export class ActivitylogsComponent implements OnInit {
  currId: any;
  currRole: any;
  actLogsOrg: any[] = [];
  actLogsAdmin: any[] = [];

  constructor(
    private data: DataAnalyticsService,
    private user: AuthserviceService,
    private service: EventService
  ) {
    this.currRole = this.user.getCurrentUserRole();
    this.currId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    if (this.currRole === 2) {
      this.loadActivityLogsForOrganizer(this.currId);
    } else {
      this.loadActivityLogsForAdmin();
    }
  }

  loadActivityLogsForOrganizer(id: any) {
    this.data.getActivityLogs(id).subscribe((res) => {
      this.actLogsOrg = res.payload;
      console.log(this.actLogsOrg);
    });
  }

  loadActivityLogsForAdmin() {
    this.data.getActivityLogs().subscribe((res) => {
      this.actLogsAdmin = res.payload;
      console.log(this.actLogsAdmin);
    });
  }

  formatRegistrationDate(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  replaceEventName(word: string, name: string) {
    return word.replace('event', name);
  }
}

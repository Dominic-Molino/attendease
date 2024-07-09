import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CardsComponent } from '../../components/organizer-analytics/component/cards/cards.component';
import { OrganizerAnalyticsComponent } from '../../components/organizer-analytics/organizer-analytics.component';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  templateUrl: './org-dashboard.component.html',
  styleUrl: './org-dashboard.component.css',
  imports: [CommonModule, CardsComponent, OrganizerAnalyticsComponent],
  encapsulation: ViewEncapsulation.None,
})
export class OrgDashboardComponent implements OnInit {
  ngOnInit(): void {}
}

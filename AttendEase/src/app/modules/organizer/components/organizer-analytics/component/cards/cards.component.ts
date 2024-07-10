import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../../../core/service/event.service';
import { AuthserviceService } from '../../../../../../core/service/authservice.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css',
})
export class CardsComponent implements OnInit {
  data: any;
  currId: any;
  chartOption: any;

  constructor(private event: EventService, private auth: AuthserviceService) {}

  ngOnInit(): void {
    this.currId = this.auth.getCurrentUserId();
    this.getData(this.currId);
  }

  getData(id: any) {
    this.event.getDataForDashboard(id).subscribe((res) => {
      this.data = res.payload;
      console.log(this.data);
    });
  }
}

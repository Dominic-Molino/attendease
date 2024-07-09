import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../../../core/service/event.service';
import { AuthserviceService } from '../../../../../../core/service/authservice.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css',
})
export class CardsComponent implements OnInit {
  data: any;
  currId: any;

  constructor(private event: EventService, private auth: AuthserviceService) {}

  ngOnInit(): void {
    this.currId = this.auth.getCurrentUserId();
    this.getData(this.currId);
  }

  getData(id: any) {
    this.event.getDataForDashboard(id).subscribe((res) => {
      this.data = res.payload;
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CardsComponent } from '../../components/organizer-analytics/component/cards/cards.component';
import { OrganizerAnalyticsComponent } from '../../components/organizer-analytics/organizer-analytics.component';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfilecompletionComponent } from '../../components/profilecompletion/profilecompletion.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  templateUrl: './org-dashboard.component.html',
  styleUrl: './org-dashboard.component.css',
  imports: [CommonModule, CardsComponent, OrganizerAnalyticsComponent],
  encapsulation: ViewEncapsulation.None,
})
export class OrgDashboardComponent implements OnInit {
  currId: any;
  profile: any;

  constructor(private service: AuthserviceService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    if (this.currId) {
      this.service.checkOrganizer(this.currId).subscribe((profile: any) => {
        this.profile = profile.payload;
        console.log(profile);
        if (this.profile.is_complete === 0) {
          this.openDialog(this.currId);
        }
      });
    }
  }

  openDialog(id: any) {
    const dialogRef = this.dialog.open(ProfilecompletionComponent, {
      width: '40%',
      data: { id: id },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        Swal.fire(
          'Profile Updated',
          'Your profile has been updated successfully.',
          'success'
        );
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import Swal from 'sweetalert2';
import { NotificationComponent } from '../../../modules/user/components/notification/notification.component';
import { Subscription } from 'rxjs';
import { MessageComponent } from '../message/message.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    RouterOutlet,
    RouterLinkActive,
    NotificationComponent,
    MessageComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  userId: any;
  studentProfile: any;
  notification: any[] = [];
  animationStopped = false;
  private subscription?: Subscription;

  constructor(
    private service: AuthserviceService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.loadInfo();
    this.loadNotification();
    this.setupPeriodicRefresh();
  }

  loadInfo() {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe((res) => {
        this.studentProfile = res.payload[0];
      });
    }
  }

  loadNotification() {
    this.service.getRegisteredEvents(this.userId).subscribe((res: any) => {
      this.notification = res.payload;
      this.animationStopped = this.notification.length === 0;
    });
  }

  setupPeriodicRefresh() {
    this.subscription = this.service
      .fetchRegisteredEventsPeriodically(this.userId)
      .subscribe((res: any) => {
        this.notification = res.payload;
        this.animationStopped = this.notification.length === 0;
      });
  }

  toggleNotification() {
    this.animationStopped = true;
  }

  //for chat not implmented
  openChat() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      bottom: '75px',
      right: '95px',
    };

    dialogConfig.width = '30%';

    const openDia = this.dialog.open(MessageComponent, {
      data: {
        currentUser: this.userId,
        otherUser: 12,
      },
    });
  }

  logout(): void {
    Swal.fire({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Logout successfully',
        });
        sessionStorage.removeItem('token');
        this.router.navigate(['login']);
      }
    });
  }
}

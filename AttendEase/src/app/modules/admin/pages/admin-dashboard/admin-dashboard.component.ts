import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UpdateroleComponent } from '../../components/updaterole/updaterole.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  title = 'AttendEase';

  constructor(
    private routes: Router,
    private service: AuthserviceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  datalist: any;

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getUsers().subscribe((res: any) => {
      this.datalist = res.payload;
    });
  }

  updateUser(id: number) {
    const popup = this.dialog.open(UpdateroleComponent, {
      data: {
        user_id: id,
      },
    });
    popup.afterClosed().subscribe((res: any) => {
      this.loadData();
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
        Swal.fire({
          title: 'Logout Successfully',
          icon: 'success',
        });
        sessionStorage.removeItem('token');
        this.router.navigate(['login']);
      }
    });
  }
}

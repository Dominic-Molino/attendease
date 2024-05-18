import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RouterLink,
  RouterOutlet,
  RouterLinkActive,
  Router,
} from '@angular/router';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../core/service/authservice.service';

@Component({
  selector: 'app-org-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, RouterLinkActive],
  templateUrl: './org-sidebar.component.html',
  styleUrl: './org-sidebar.component.css',
})
export class OrgSidebarComponent {
  userId = this.service.getCurrentUserId();
  studentProfile: any[] = [];

  constructor(private service: AuthserviceService, private router: Router) {
    this.userId = this.service.getCurrentUserId();
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

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-org-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, RouterLinkActive],
  templateUrl: './org-sidebar.component.html',
  styleUrl: './org-sidebar.component.css',
})
export class OrgSidebarComponent {}

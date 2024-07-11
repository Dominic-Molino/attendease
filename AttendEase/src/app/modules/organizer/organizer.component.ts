import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { OrgSidebarComponent } from './components/org-sidebar/org-sidebar.component';

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [RouterOutlet, OrgSidebarComponent],
  templateUrl: './organizer.component.html',
  styleUrl: './organizer.component.css',
})
export class OrganizerComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}

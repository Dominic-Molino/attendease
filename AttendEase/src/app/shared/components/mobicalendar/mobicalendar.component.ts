import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MbscModule,
  MbscOptionsService,
  MbscCalendarEvent,
  MbscEventcalendarOptions,
  setOptions,
  MbscEventcalendarView,
} from '@mobiscroll/angular';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/service/event.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PopupComponent } from '../popup/popup.component';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';
import { AddEventComponent } from '../../../modules/organizer/components/add-event/add-event.component';
import { AuthserviceService } from '../../../core/service/authservice.service';

interface CustomCalendarEvent extends MbscCalendarEvent {
  status: 'done' | 'ongoing' | 'upcoming';
  categories: { display: string; value: string }[]; // Adjusted categories type
}

@Component({
  selector: 'app-mobicalendar',
  standalone: true,
  imports: [FormsModule, MbscModule, CommonModule],
  providers: [MbscOptionsService],
  templateUrl: './mobicalendar.component.html',
  styleUrl: './mobicalendar.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MobicalendarComponent {
  // variable?
  // userId: any;
  // events: CustomCalendarEvent[] = [];
  // today = new Date(new Date().setDate(new Date().getDate() - 1));
  // private subscription?: Subscription;
  // filteredEvents: CustomCalendarEvent[] = [];
  // selectedStatus: string = 'all';
  // view = 'month';
  // calView: MbscEventcalendarView = {
  //   calendar: { labels: 1 },
  // };
  // eventSettings: MbscEventcalendarOptions = {
  //   theme: 'material',
  //   themeVariant: 'light',
  //   eventOverlap: true,
  //   invalid: [
  //     {
  //       recurring: {
  //         repeat: 'daily',
  //         until: this.today,
  //       },
  //     },
  //   ],
  //   colors: [
  //     {
  //       date: this.events.map((event: any) => {
  //         start: event.start;
  //       }),
  //       background: '#f3c3d480',
  //     },
  //   ],
  //   onEventClick: (args) => {
  //     this.openPreviewDialog(args.event);
  //   },
  //   onCellDoubleClick: (args) => {
  //     if (this.userId === 2) {
  //       this.handleDateClick(args);
  //     }
  //   },
  // };
  // constructor(
  //   protected options: MbscOptionsService,
  //   private eventService: EventService,
  //   private auth: AuthserviceService,
  //   private dialog: MatDialog
  // ) {}
  // ngOnInit(): void {
  //   this.fetchEvents();
  //   this.userId = this.auth.getCurrentUserRole();
  //   this.setPolling();
  // }
  // ngOnDestroy(): void {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe();
  //   }
  // }
  // setPolling(): void {
  //   const pollingInterval = 60000;
  //   this.subscription = timer(0, pollingInterval)
  //     .pipe(
  //       switchMap(() => this.eventService.getAllEvents()),
  //       catchError((error) => {
  //         console.log('Error fetching events:', error);
  //         return of([]);
  //       })
  //     )
  //     .subscribe((data) => {
  //       this.events = data.payload.map((event: any) => {
  //         // Parse categories string into array of objects
  //         const categories: { display: string; value: string }[] = JSON.parse(
  //           event.categories
  //         );
  //         return {
  //           id: event.event_id,
  //           title: event.event_name,
  //           description: event.event_description,
  //           start: new Date(event.event_start_date),
  //           end: new Date(event.event_end_date),
  //           reg_start: new Date(event.event_registration_start),
  //           reg_end: new Date(event.event_registration_end),
  //           session: event.session,
  //           organizer_name: event.organizer_name,
  //           max_attendees: event.max_attendees,
  //           categories: categories, // Correctly parsed categories
  //           location: event.event_location,
  //           status: this.getEventStatus(
  //             new Date(event.event_start_date),
  //             new Date(event.event_end_date)
  //           ),
  //         };
  //       });
  //       this.filterEvents();
  //     });
  // }
  // fetchEvents(): void {
  //   this.eventService
  //     .getAllEvents()
  //     .pipe(
  //       catchError((error) => {
  //         console.error('Error fetching events:', error);
  //         return of([]);
  //       })
  //     )
  //     .subscribe((data) => {
  //       const events = data.payload || [];
  //       this.events = events.map((event: any) => {
  //         // Parse categories string into array of objects
  //         const categories: { display: string; value: string }[] = JSON.parse(
  //           event.categories
  //         );
  //         return {
  //           id: event.event_id,
  //           title: event.event_name,
  //           description: event.event_description,
  //           start: new Date(event.event_start_date),
  //           end: new Date(event.event_end_date),
  //           reg_start: new Date(event.event_registration_start),
  //           reg_end: new Date(event.event_registration_end),
  //           session: event.session,
  //           organizer_name: event.organizer_name,
  //           max_attendees: event.max_attendees,
  //           categories: categories, // Correctly parsed categories
  //           location: event.event_location,
  //           status: this.getEventStatus(
  //             new Date(event.event_start_date),
  //             new Date(event.event_end_date)
  //           ),
  //         };
  //       });
  //       this.filterEvents();
  //     });
  // }
  // getEventStatus(start: Date, end: Date): string {
  //   const now = new Date();
  //   if (end < now) {
  //     return 'done';
  //   } else if (start > now) {
  //     return 'upcoming';
  //   } else {
  //     return 'ongoing';
  //   }
  // }
  // filterEvents(): void {
  //   if (this.selectedStatus === 'all') {
  //     this.filteredEvents = this.events;
  //   } else {
  //     this.filteredEvents = this.events.filter(
  //       (event) => event.status === this.selectedStatus
  //     );
  //   }
  // }
  // changeView(): void {
  //   setTimeout(() => {
  //     switch (this.view) {
  //       case 'month':
  //         this.calView = {
  //           calendar: { type: 'month' },
  //           agenda: { type: 'month' },
  //         };
  //         break;
  //       case 'week':
  //         this.calView = {
  //           calendar: { type: 'week' },
  //           agenda: { type: 'week' },
  //         };
  //         break;
  //       case 'day':
  //         this.calView = {
  //           agenda: { type: 'day' },
  //         };
  //         break;
  //     }
  //   });
  // }
  // openPreviewDialog(event: any): void {
  //   if (!event) {
  //     console.error('Event data is null or undefined.');
  //     return;
  //   }
  //   this.dialog.open(PopupComponent, {
  //     width: '50%',
  //     data: event,
  //     disableClose: true,
  //   });
  // }
  // handleDateClick(arg: any): void {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.data = { start_date: arg.date };
  //   dialogConfig.width = '70%';
  //   dialogConfig.height = '90%';
  //   dialogConfig.disableClose = true;
  //   const dialogRef = this.dialog.open(AddEventComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.fetchEvents();
  //     }
  //   });
  // }
  // onStatusChange(status: string): void {
  //   this.selectedStatus = status;
  //   this.filterEvents();
  // }
}

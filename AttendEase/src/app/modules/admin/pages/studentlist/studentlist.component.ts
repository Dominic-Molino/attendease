import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { UpdateroleComponent } from '../../components/updaterole/updaterole.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { EventService } from '../../../../core/service/event.service';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  block: string;
  course: string;
  year_level: string;
  role_id: number;
  eventCount?: number;
}

@Component({
  selector: 'app-studentlist',
  standalone: true,
  templateUrl: './studentlist.component.html',
  styleUrls: ['./studentlist.component.css'],
  imports: [
    CommonModule,
    TitleCasePipe,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
})
export class StudentlistComponent implements OnInit {
  datalist: User[] = [];
  filteredList: User[] = [];
  searchValue = '';
  p: number = 1;
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  maxSize = 5;

  constructor(
    private service: AuthserviceService,
    private eventService: EventService,
    private dialog: MatDialog,
    private form: FormBuilder
  ) {}

  searchForm = this.form.nonNullable.group({
    searchValue: [''],
  });

  ngOnInit(): void {
    this.loadData();
    this.searchForm.get('searchValue')!.valueChanges.subscribe((value) => {
      this.filterData(value);
    });
  }

  loadData() {
    this.service.getUsers().subscribe((res: any) => {
      this.datalist = res.payload.map((user: any): User => {
        return {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          block: user.block,
          course: user.course,
          year_level: user.year_level,
          role_id: user.role_id,
        };
      });

      const userObservables = this.datalist.map((user) =>
        this.eventService.getUsersEvent(user.user_id).pipe(
          map((eventRes: any) => {
            user.eventCount = eventRes.payload ? eventRes.payload.length : 0;
          }),
          catchError((error) => {
            if (error.status === 404) {
              user.eventCount = 0;
              return of(null);
            }
            return throwError(error);
          })
        )
      );

      forkJoin(userObservables).subscribe(() => {
        this.filterData(this.searchForm.get('searchValue')!.value);
      });
    });
  }

  filterData(searchValue: string) {
    if (!searchValue) {
      this.filteredList = this.datalist;
    } else {
      searchValue = searchValue.toLowerCase();
      this.filteredList = this.datalist.filter((data) => {
        return (
          (data.first_name &&
            data.first_name.toLowerCase().includes(searchValue)) ||
          (data.course && data.course.toLowerCase().includes(searchValue)) ||
          (data.year_level &&
            data.year_level.toLowerCase().includes(searchValue)) ||
          (data.block && data.block.toLowerCase().includes(searchValue))
        );
      });
    }
    this.totalRecords = this.filteredList.length;
    this.p = 1;
  }

  updateUser(id: number) {
    const popup = this.dialog.open(UpdateroleComponent, {
      data: {
        user_id: id,
      },
    });
    popup.afterClosed().subscribe(() => {
      this.loadData();
    });
  }
}

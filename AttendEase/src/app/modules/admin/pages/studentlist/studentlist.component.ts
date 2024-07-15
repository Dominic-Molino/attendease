import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { UpdateroleComponent } from '../../components/updaterole/updaterole.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

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
  is_active: number;
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
  selectedView: 'students' | 'organizers' = 'students';

  constructor(
    private service: AuthserviceService,
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
      this.datalist = res.payload.map(
        (user: any): User => ({
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          block: user.block,
          course: user.course,
          year_level: user.year_level,
          role_id: user.role_id,
          is_active: user.is_active,
        })
      );

      console.log('Loaded datalist:', this.datalist);
      this.filterData(this.searchForm.get('searchValue')!.value);
    });
  }

  filterData(searchValue: string) {
    this.filteredList = this.datalist;

    if (searchValue) {
      searchValue = searchValue.toLowerCase();
      this.filteredList = this.filteredList.filter((data) => {
        return (
          (data.first_name &&
            data.first_name.toLowerCase().includes(searchValue)) ||
          (data.last_name &&
            data.last_name.toLowerCase().includes(searchValue)) ||
          (data.course && data.course.toLowerCase().includes(searchValue)) ||
          (data.year_level &&
            data.year_level.toLowerCase().includes(searchValue)) ||
          (data.block && data.block.toLowerCase().includes(searchValue))
        );
      });
    }

    if (this.selectedView === 'organizers') {
      this.filteredList = this.filteredList.filter(
        (user) => user.role_id === 2
      );
    } else if (this.selectedView === 'students') {
      this.filteredList = this.filteredList.filter(
        (user) => user.role_id === 3
      );
    }

    console.log('Filtered list:', this.filteredList);

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

  activateAccount(id: number) {
    Swal.fire({
      title: 'Activate this account?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.activateAccount(id).subscribe((res) => {});
        Swal.fire({
          title: 'Activated!',
          text: 'Organizer account has been activated.',
          icon: 'success',
        });
        this.loadData();
      }
    });
  }

  selectView(view: 'students' | 'organizers') {
    this.selectedView = view;
    this.filterData(this.searchForm.get('searchValue')!.value);
  }
}

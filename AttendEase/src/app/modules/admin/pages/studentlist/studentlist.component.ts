import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { UpdateroleComponent } from '../../components/updaterole/updaterole.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

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
  datalist: any[] = [];
  filteredList: any[] = [];
  searchValue = '';
  p: number = 1;
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  maxSize = 5;

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
      this.datalist = res.payload;
      this.filterData(this.searchForm.get('searchValue')!.value);
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

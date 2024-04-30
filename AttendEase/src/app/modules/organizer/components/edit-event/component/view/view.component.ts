import { CommonModule, JsonPipe } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ViewComponent {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
}

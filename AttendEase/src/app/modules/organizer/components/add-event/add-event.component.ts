import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
  FormGroup,
  FormArray,
  FormControl,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-event',
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
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddEventComponent implements OnInit {
  minDate: Date;
  eventForm: FormGroup;
  categoryControls: FormArray | undefined;
  visibleCategories: string[] = [];
  categories: string[] = [
    'Python',
    'Java',
    'JavaScript',
    'C/C++',
    'Ruby',
    'Swift',
    'Kotlin',
    'PHP',
    'React.js',
    'Angular',
    'Vue.js',
    'Node.js',
    'Django',
    'Flask',
    'Spring Framework',
    'Express.js',
    'HTML/CSS',
    'Responsive Design',
    'UI/UX Design',
    'Bootstrap',
    'Sass/Less',
    'Web Accessibility',
    'iOS Development',
    'Android Development',
    'Flutter',
    'React Native',
    'Mobile UX/UI Design',
    'SQL',
    'NoSQL',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Firebase',
    'AWS',
    'Microsoft Azure',
    'Google Cloud Platform',
    'DevOps',
    'Serverless Computing',
    'Containers',
    'AI Fundamentals',
    'Machine Learning Algorithms',
    'Deep Learning',
    'NLP',
    'Computer Vision',
    'AI Ethics',
    'Cyber Threats',
    'Network Security',
    'Encryption Techniques',
    'Penetration Testing',
    'Cybersecurity Best Practices',
    'Agile Methodologies',
    'Software Design Patterns',
    'CI/CD',
    'Git',
    'Software Testing',
    'Quality Assurance',
    'IoT',
    'Blockchain',
    'Virtual Reality',
    'Augmented Reality',
    'Quantum Computing',
    'Edge Computing',
  ];
  showAllCategories: boolean = false;

  constructor(
    private builder: FormBuilder,
    private eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddEventComponent>
  ) {
    this.minDate = new Date();
    this.eventForm = this.builder.group({
      event_name: ['', Validators.required],
      event_description: ['', Validators.required],
      event_location: ['', Validators.required],
      event_start_date: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      event_end_date: [null, [Validators.required, this.futureDateValidator()]],
      event_registration_start: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      event_registration_end: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      session: ['', Validators.required],
      max_attendees: ['', Validators.required],
      categories: this.buildCategoryCheckboxes(),
      organizer_name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.startDate) {
      this.eventForm.patchValue({ event_start_date: this.data.startDate });
    }
    this.updateVisibleCategories();
  }

  buildCategoryCheckboxes() {
    const formArray = this.categories.map(() => new FormControl(false));
    this.categoryControls = new FormArray(formArray);
    return this.categoryControls;
  }

  setCategories(selectedCategories: string[]): void {
    const categoryControls = this.eventForm.get('categories') as FormArray;
    this.categories.forEach((category, index) => {
      if (selectedCategories.includes(category)) {
        categoryControls.at(index).setValue(true);
      }
    });
  }

  getSelectedCategories() {
    const selectedCategories = this.eventForm.value.categories
      .map((checked: any, index: number) =>
        checked ? this.categories[index] : null
      )
      .filter((value: null) => value !== null);
    return selectedCategories;
  }

  addEvent() {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      formData.categories = this.getSelectedCategories();

      this.eventService.addEvent(this.eventForm.value).subscribe(
        (res) => {
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
            title: 'Event Added',
          });
          this.dialogRef.close(res);
        },
        (error) => {
          Swal.fire(
            'Error',
            error.error.status.message || 'Something went wrong',
            'error'
          );
        }
      );
    } else {
      Swal.fire('Incomplete Form', 'Please fill in all fields', 'warning');
    }
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);

      if (control.value && selectedDate < currentDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Date',
          text: "You've enter a past date!",
        }).then(() => {
          control.reset();
        });
        return { pastDate: true };
      }
      return null;
    };
  }

  toggleShowAllCategories() {
    this.showAllCategories = !this.showAllCategories;
    this.updateVisibleCategories();
  }

  updateVisibleCategories() {
    if (this.showAllCategories) {
      this.visibleCategories = this.categories;
    } else {
      this.visibleCategories = this.categories.slice(0, 15);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

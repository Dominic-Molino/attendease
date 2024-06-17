import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-event',
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
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class EditEventComponent implements OnInit {
  eventId: number;
  eventVal: any;
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
    private service: EventService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<EditEventComponent>
  ) {
    this.eventId = this.data.event_id.event_id;
    this.eventVal = this.data.event_id;

    this.eventForm = this.builder.group({
      event_name: [this.eventVal.event_name, Validators.required],
      event_description: [this.eventVal.event_description, Validators.required],
      event_location: [this.eventVal.event_location, Validators.required],
      event_start_date: [
        this.eventVal.event_start_date,
        [Validators.required, this.futureDateValidator()],
      ],
      event_end_date: [
        this.eventVal.event_end_date,
        [Validators.required, this.futureDateValidator()],
      ],
      event_registration_start: [
        this.eventVal.event_registration_start,
        Validators.required,
      ],
      event_registration_end: [
        this.eventVal.event_registration_end,
        Validators.required,
      ],
      session: [this.eventVal.session, Validators.required],
      max_attendees: [this.eventVal.max_attendees, Validators.required],
      categories: this.buildCategoryCheckboxes(),
      organizer_name: [
        this.eventVal.organizer_name.replace(/^"|"$/g, ''),
        Validators.required,
      ],
    });

    if (this.eventVal.categories) {
      this.setCategories(JSON.parse(this.eventVal.categories));
    }
  }

  ngOnInit(): void {
    if (this.eventId) {
      this.eventForm.patchValue({
        event_name: this.eventVal.event_name,
        event_description: this.eventVal.event_description,
        event_location: this.eventVal.event_location,
        event_start_date: this.eventVal.event_start_date,
        event_end_date: this.eventVal.event_end_date,
        event_registration_start: this.eventVal.event_registration_start,
        event_registration_end: this.eventVal.event_registration_end,
        session: this.eventVal.session,
        max_attendees: this.eventVal.max_attendees,
        categories: this.eventVal.categories
          ? JSON.parse(this.eventVal.categories)
          : null,
        organizer_name: this.eventVal.organizer_name,
      });
    }
    this.updateVisibleCategories();
  }

  updateEvent() {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      formData.categories = this.getSelectedCategories();

      this.service
        .editEvent(this.eventId, this.eventForm.value)
        .subscribe((res) => {
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
            title: 'Event updated.',
          });
          this.dialog.close();
        });
    } else {
      Swal.fire('Failed', 'Failed to update event!', 'error');
    }
  }

  buildCategoryCheckboxes() {
    const formArray = this.categories.map(() => new FormControl(false));
    this.categoryControls = new FormArray(formArray);
    return this.categoryControls;
  }

  setCategories(selectedCategories: string[]): void {
    const categoryControls = this.eventForm.get('categories') as FormArray;
    if (selectedCategories) {
      this.categories.forEach((category, index) => {
        if (selectedCategories.includes(category)) {
          categoryControls.at(index).setValue(true);
        }
      });
    }
  }

  getSelectedCategories() {
    const selectedCategories = this.eventForm.value.categories
      .map((checked: any, index: number) =>
        checked ? this.categories[index] : null
      )
      .filter((value: null) => value !== null);
    return selectedCategories;
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
    this.dialog.close();
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
        });
        return { pastDate: true };
      }
      return null;
    };
  }
}

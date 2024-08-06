import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
  FormGroup,
  FormControl,
  FormArray,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { TagInputModule } from 'ngx-chips';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

export function positiveNumberValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (value !== null && (isNaN(value) || value <= 0)) {
    return { positiveNumber: true };
  }
  return null;
}

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    TagInputModule,
  ],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddEventComponent implements OnInit {
  minDate: Date;
  eventForm!: FormGroup;
  file: any;
  imagePreview?: string | ArrayBuffer | null = null;
  matcher = new MyErrorStateMatcher();
  departments: string[] = ['BSEMC', 'BSIT', 'BSCS', 'ACT'];
  year_levels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  profile: any;
  currId: any;

  constructor(
    private builder: FormBuilder,
    private eventService: EventService,
    private dialogRef: MatDialogRef<AddEventComponent>,
    private service: AuthserviceService,
    private http: HttpClient
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
      event_type: ['', Validators.required],
      max_attendees: ['', [Validators.required, positiveNumberValidator]],
      categories: [''],
      event_link: [''],
      organizer_user_id: [''],
      organizer_name: ['', Validators.required],
      organizer_organization: ['', Validators.required],
      participation_type: ['open', Validators.required],
      target_participants: this.builder.group({
        BSEMC: this.builder.array([]),
        BSIT: this.builder.array([]),
        BSCS: this.builder.array([]),
        ACT: this.builder.array([]),
      }),
    });
  }

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.service.getStudentProfile(this.currId).subscribe((res) => {
      this.profile = res.payload[0];
      console.log(this.profile);

      this.eventForm.patchValue({
        organizer_name: `${this.profile.first_name} ${this.profile.last_name}`,
        organizer_organization: this.profile.organization,
      });
    });
    this.eventForm.get('event_type')?.valueChanges.subscribe((value) => {
      this.updateValidation(value);
    });
  }

  onParticipationTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'open') {
      this.eventForm.get('target_participants')?.disable();
    } else {
      this.eventForm.get('target_participants')?.enable();
    }
  }

  getTargetParticipantsArray(department: string): FormArray {
    return this.eventForm.get(`target_participants.${department}`) as FormArray;
  }

  onCheckboxChange(event: Event, department: string) {
    const checkbox = event.target as HTMLInputElement;
    const formArray = this.getTargetParticipantsArray(department);
    if (checkbox.checked) {
      formArray.push(new FormControl(checkbox.value));
    } else {
      const index = formArray.controls.findIndex(
        (x) => x.value === checkbox.value
      );
      if (index >= 0) {
        formArray.removeAt(index);
      }
    }
  }

  onSelectChange(event: Event, formArray: FormArray) {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    const values = Array.from(selectedOptions).map(
      (option) => (option as HTMLOptionElement).value
    );
    values.forEach((value) => formArray.push(new FormControl(value)));
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewImage(); // Call method to preview image
    }
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result;
    };
    reader.readAsDataURL(this.file);
  }

  addEvent() {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;

      formData.organizer_user_id = this.currId;
      formData.organizer_name = `${this.profile.first_name} ${this.profile.last_name}`;
      formData.organizer_organization = this.profile.organization;

      const targetParticipants: any = {};
      for (const dept of this.departments) {
        const selectedYearLevels = this.getTargetParticipantsArray(dept).value;
        if (selectedYearLevels.length > 0) {
          targetParticipants[dept] = selectedYearLevels;
        }
      }

      formData.target_participants = targetParticipants;
      console.log(formData);

      console.log(formData.value);
      if (this.file) {
        formData.file = this.file;
      }

      this.eventService.addEvent(formData).subscribe(
        (res) => {
          const eventId = res.payload.event_id;
          if (this.file) {
            this.eventService.uploadEvent(eventId, this.file).subscribe(
              (uploadRes) => {
                this.handleSuccessResponse();
              },
              (error) => {
                Swal.fire(
                  'Warning',
                  `${error.error.status.message}`,
                  'warning'
                );
              }
            );
          } else {
            this.handleSuccessResponse();
          }
        },
        (error) => {
          Swal.fire('Warning', `${error.error.status.message}`, 'warning');
        }
      );
    } else {
      Swal.fire('Incomplete Form', 'Please fill in all fields', 'warning');
    }
  }

  private handleSuccessResponse() {
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
      title: 'Event added successfully',
    });
    this.dialogRef.close();
  }

  private handleError(errorMessage: string) {
    Swal.fire('Error', errorMessage, 'error');
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

  get eventType() {
    return this.eventForm.get('event_type');
  }

  get eventLink() {
    return this.eventForm.get('event_link');
  }

  private updateValidation(eventType: string) {
    const eventLinkControl = this.eventForm.get('event_link');

    if (eventType === 'online' || eventType === 'hybrid') {
      eventLinkControl?.setValidators([Validators.required]);
    } else {
      eventLinkControl?.clearValidators();
    }

    eventLinkControl?.updateValueAndValidity();
  }

  isUrlReachable(url: string): Observable<boolean> {
    return this.http.head(url, { observe: 'response' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  // isValidUrl(url: string): boolean {
  //   const urlPattern = new RegExp(
  //     '^(https?:\\/\\/)' + // protocol
  //       '((([a-z0-9]\\w{0,61}[a-z0-9]?)\\.?)+[a-z]{2,6}|' + // domain name
  //       '((\\d{1,3}\\.){3}\\d{1,3})|' + // OR ipv4
  //       '\\[?[a-fA-F0-9]*:[a-fA-F0-9:]+\\]?)' + // OR ipv6
  //       '(\\:\\d+)?' + // port
  //       '(\\/[-a-z0-9%_\\+.~#]*)*' + // path
  //       '(\\?[;&a-z0-9%_\\+=~#-]*)?' + // query string
  //       '(\\#[-a-z0-9_]*)?$',
  //     'i'
  //   ); // fragment locator

  //   return urlPattern.test(url);
  // }

  // addEvent() {
  //   if (this.eventForm.valid) {
  //     const formData = this.eventForm.value;

  //     // Validate URL if the event type is 'online' or 'hybrid'
  //     const eventLink = formData.event_link;
  //     if (
  //       (formData.event_type === 'online' ||
  //         formData.event_type === 'hybrid') &&
  //       eventLink
  //     ) {
  //       if (!this.isValidUrl(eventLink)) {
  //         Swal.fire('Invalid URL', 'The URL format is not valid.', 'warning');
  //         return;
  //       }

  //       this.isUrlReachable(eventLink).subscribe((isReachable) => {
  //         if (!isReachable) {
  //           Swal.fire('Invalid URL', 'The URL is not reachable.', 'warning');
  //           return;
  //         }

  //         this.submitEvent(formData);
  //       });
  //     } else {
  //       this.submitEvent(formData);
  //     }
  //   } else {
  //     Swal.fire('Incomplete Form', 'Please fill in all fields', 'warning');
  //   }
  // }

  // private submitEvent(formData: any) {
  //   formData.organizer_user_id = this.currId;
  //   formData.organizer_name = `${this.profile.first_name} ${this.profile.last_name}`;
  //   formData.organizer_organization = this.profile.organization;

  //   const targetParticipants: any = {};
  //   for (const dept of this.departments) {
  //     const selectedYearLevels = this.getTargetParticipantsArray(dept).value;
  //     if (selectedYearLevels.length > 0) {
  //       targetParticipants[dept] = selectedYearLevels;
  //     }
  //   }

  //   formData.target_participants = targetParticipants;
  //   console.log(formData);

  //   if (this.file) {
  //     formData.file = this.file;
  //   }

  //   this.eventService.addEvent(formData).subscribe(
  //     (res) => {
  //       const eventId = res.payload.event_id;
  //       if (this.file) {
  //         this.eventService.uploadEvent(eventId, this.file).subscribe(
  //           (uploadRes) => {
  //             this.handleSuccessResponse();
  //           },
  //           (error) => {
  //             Swal.fire('Warning', `${error.error.status.message}`, 'warning');
  //           }
  //         );
  //       } else {
  //         this.handleSuccessResponse();
  //       }
  //     },
  //     (error) => {
  //       Swal.fire('Warning', `${error.error.status.message}`, 'warning');
  //     }
  //   );
  // }
}

import { SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

export interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_location: string;
  event_start_date: Date | string;
  event_end_date: Date | string;
  event_registration_start: Date | string;
  event_registration_end: Date | string;
  event_type: string;
  max_attendees: number;
  categories: { display: string; value: string }[];
  organizer_name: string;
  event_image$: Observable<SafeResourceUrl | undefined>;
  status: string;
  event_state: 'upcoming' | 'ongoing' | 'done';
  feedbackSubmitted: boolean;
}

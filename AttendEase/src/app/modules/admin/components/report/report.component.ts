import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions, TooltipItem } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { EventService } from '../../../../core/service/event.service';
import { TooltipComponent } from '../../../organizer/components/report/tooltip/tooltip.component';
import { AccordionModule } from 'primeng/accordion';

interface Feedback {
  event_id: number;
  user_id: number;
  overall_satisfaction: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    MatTooltipModule,
    TooltipComponent,
    AccordionModule,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  eventId: any;
  reportDetail: any[] = [];
  feedbackData: Feedback[] = [];
  chartOptions: any;
  chartDataCache: Map<string, any> = new Map();
  tooltipVisible: { [key: string]: boolean } = {};
  barChartData: any;
  baChartOption: ChartOptions | undefined;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private feedback: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.initializeChartOptions();
    this.barChartOption();
    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      this.eventId = parseInt(paramId);
      console.log(this.eventId);
      this.loadEvent(this.eventId);
      this.loadFeedback(this.eventId);
    });
  }

  loadEvent(id: any) {
    this.service.getReport(id).subscribe((res) => {
      this.reportDetail = res.payload;
      console.log(this.reportDetail);
    });
  }

  loadFeedback(id: any) {
    this.feedback.getEventFeedback(id).subscribe((res) => {
      this.feedbackData = res.payload;
      console.log(this.feedbackData);
      const satisfactionDistribution = this.calculateSatisfactionDistribution(
        this.feedbackData
      );
      this.barChartData = {
        labels: [
          'Very Dissatisfied',
          'Dissatisfied',
          'Neutral',
          'Satisfied',
          'Very Satisfied',
        ],
        datasets: [
          {
            label: 'Overall Satisfaction',
            backgroundColor: '#ff8a00',
            barThickness: 20,
            borderRadius: 15,
            data: [
              satisfactionDistribution.veryDissatisfied,
              satisfactionDistribution.dissatisfied,
              satisfactionDistribution.neutral,
              satisfactionDistribution.satisfied,
              satisfactionDistribution.verySatisfied,
            ],
          },
        ],
      };
    });
  }

  initializeChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      radius: 50,
      plugins: {
        legend: {
          position: 'right',
          display: true,
          labels: {
            color: '#333',
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'bar'>) => {
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `${label} : ${value} `;
            },
          },
        },
      },
      elements: {
        arc: {
          borderWidth: 0,
        },
      },
    };
  }

  getChartData(event: any, type: string): any {
    const cacheKey = `${event.event_id}_${type}`;
    if (this.chartDataCache.has(cacheKey)) {
      return this.chartDataCache.get(cacheKey);
    }

    let labels: string[] = [];
    let data: number[] = [];
    let backgroundColor: string[] = [];
    let message = '';

    switch (type) {
      //pie chart
      case 'registrationToMaxAttendees':
        labels = ['Active Users', 'Max Attendees'];
        data = [event.registered_users, event.max_attendees];
        backgroundColor = ['#73300a', '#c75519'];
        const registeredUsersText =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersText} registered.`;
        break;

      case 'feedbackAttendance':
        labels = ['Feedback', 'Attendance'];
        data = [event.feedback_count, event.attendance_count];
        backgroundColor = ['#73300a', '#c75519'];
        let feedback =
          event.feedback_count === 1 ? 'student had' : 'students had';
        let attendance =
          event.attendance_count === 1 ? 'student had' : 'students had';
        message = `Out of the total attendees, ${event.feedback_count} ${feedback} given feedback and ${event.attendance_count} ${attendance} submitted attendance.`;
        break;

      case 'presentStudents':
        const attendanceCount = event.student_details.reduce(
          (acc: any, student: any) => {
            if (student.attendance_status === 'present') {
              acc.present += 1;
            } else {
              acc.absent += 1;
            }
            return acc;
          },
          { present: 0, absent: 0 }
        );

        const { present, absent } = attendanceCount;

        labels = ['Present', 'Absent'];
        data = [present, absent];
        backgroundColor = ['#73300a', '#c75519'];
        let presentStatus = present === 1 ? 'student is' : 'students are';
        let absentStatus = absent === 1 ? 'student is' : 'students are';
        message = `Out of the total attendees, ${present} ${presentStatus} present and ${absent}  ${absentStatus} absent.`;
        break;

      case 'courseRegistration':
        const coursesData = event.registered_by_course.map(
          (item: { count: number }) => item.count
        );
        const coursesDataLabel = event.registered_by_course.map(
          (item: { course: string }) => `Course: ${item.course}`
        );
        labels = [...coursesDataLabel];
        data = [...coursesData];
        backgroundColor = [
          '#73300a',
          '#c75519',
          '#ff8a00',
          '#f6aa54',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#8d6e63',
        ];
        const courses = event.registered_by_course
          .map(
            (item: { course: string; count: number }) =>
              `<li>${item.course}: ${item.count} ${
                item.count === 1 ? 'student' : 'students'
              }</li>`
          )
          .join('');
        const registeredUsersTextCourse =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextCourse} registered.<br><br> Registered by courses:<ul>${courses}</ul>`;
        break;

      case 'yearLevelRegistration':
        const yearLevelsData = event.registered_by_year_level.map(
          (item: { count: number }) => item.count
        );
        const yearLevelsDataLabel = event.registered_by_year_level.map(
          (item: { year_level: string }) => `${item.year_level}`
        );
        labels = [...yearLevelsDataLabel];
        data = [...yearLevelsData];
        backgroundColor = [
          '#73300a',
          '#c75519',
          '#ff8a00',
          '#f6aa54',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#8d6e63',
        ];
        const yearLevels = event.registered_by_year_level
          .map(
            (item: { year_level: string; count: number }) =>
              `<li>${item.year_level}: ${item.count} ${
                item.count === 1 ? 'student' : 'students'
              }</li>`
          )
          .join('');
        const registeredUsersTextYear =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextYear} registered.<br><br> Registered by year levels:<ul>${yearLevels}</ul>`;
        break;

      case 'blockRegistration':
        const blocksData = event.registered_by_block.map(
          (item: { count: number }) => item.count
        );
        const blocksDataLabel = event.registered_by_block.map(
          (item: { block: string }) => `Block: ${item.block}`
        );
        labels = [...blocksDataLabel];
        data = [...blocksData];
        backgroundColor = [
          '#73300a',
          '#c75519',
          '#ff8a00',
          '#f6aa54',
          '#3e2723',
          '#5d4037',
          '#795548',
          '#8d6e63',
        ];
        const blocks = event.registered_by_block
          .map(
            (item: { block: string; count: number }) =>
              `<li>${item.block}: ${item.count} ${
                item.count === 1 ? 'student' : 'students'
              }</li>`
          )
          .join('');
        const registeredUsersTextBlock =
          event.registered_users === 1 ? 'student has' : 'students have';
        message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextBlock} registered.<br><br> Registered by year levels:<ul>${blocks}</ul>`;
        break;
    }

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColor,
        },
      ],
      message: message,
    };

    this.chartDataCache.set(cacheKey, chartData);
    return chartData;
  }

  hasAttendanceData(event: any): boolean {
    const attendanceCount = event.student_details.reduce(
      (acc: any, student: any) => {
        if (student.attendance_status === 'present') {
          acc.present += 1;
        } else {
          acc.absent += 1;
        }
        return acc;
      },
      { present: 0, absent: 0 }
    );

    return attendanceCount.present > 0 || attendanceCount.absent > 0;
  }

  barChartOption() {
    this.baChartOption = {
      maintainAspectRatio: false,
      indexAxis: 'x',
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#ff8a00',
            usePointStyle: true,
            font: {
              size: 14,
              family: 'Inter',
            },
          },
        },
        tooltip: {
          callbacks: {
            title: () => '',
            label: (context: TooltipItem<'bar'>) => {
              const label = context.label || '';
              const value = (context.raw as number) || 0;
              return `${label} : ${value} `;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Satisfaction Level ',
            font: {
              family: 'Inter',
              size: 14,
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            stepSize: 1,
            callback(value: any) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      },
    };
  }

  private calculateSatisfactionDistribution(feedback: Feedback[]): any {
    const distribution = {
      veryDissatisfied: 0,
      dissatisfied: 0,
      neutral: 0,
      satisfied: 0,
      verySatisfied: 0,
    };

    feedback.forEach((fb: { overall_satisfaction: number }) => {
      if (fb.overall_satisfaction >= 4.5) {
        distribution.verySatisfied += 1;
      } else if (fb.overall_satisfaction >= 3.5) {
        distribution.satisfied += 1;
      } else if (fb.overall_satisfaction >= 2.5) {
        distribution.neutral += 1;
      } else if (fb.overall_satisfaction >= 1.5) {
        distribution.dissatisfied += 1;
      } else {
        distribution.veryDissatisfied += 1;
      }
    });

    return distribution;
  }

  replaceString(event: string) {
    return event.replace(' Year', ' ');
  }

  getRegistrationMessage(event: any): string {
    return `Out of ${event.max_attendees} potential attendees, ${event.registered_users}  have registered.`;
  }

  toggleTooltip(eventId: string) {
    this.tooltipVisible[eventId] = !this.tooltipVisible[eventId];
    for (const key in this.tooltipVisible) {
      if (key !== eventId) {
        this.tooltipVisible[key] = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedOutside =
      !target.closest('.tooltip-content') && !target.closest('svg');

    if (clickedOutside) {
      for (const key in this.tooltipVisible) {
        this.tooltipVisible[key] = false;
      }
    }
  }
}

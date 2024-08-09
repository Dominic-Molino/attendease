import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartOptions, TooltipItem } from 'chart.js';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipComponent } from './tooltip/tooltip.component';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Feedback {
  event_id: number;
  user_id: number;
  overall_satisfaction: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ChartModule, MatTooltipModule, TooltipComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  eventId: any;
  // reportDetail: any[] = [];
  // feedbackData: Feedback[] = [];
  chartOptions: any;
  chartDataCache: Map<string, any> = new Map();
  tooltipVisible: { [key: string]: boolean } = {};
  barChartData: any;
  baChartOption: ChartOptions | undefined;

  reportDetail: any = {};
  feedbackData: any[] = [];
  presentStudents: any[] = [];
  absentStudents: any[] = [];
  registeredByCourse: any[] = [];
  registeredByBlock: any[] = [];
  registeredByYearLevel: any[] = [];
  feedbackSummary: string = '';

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private feedback: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      this.eventId = parseInt(paramId);
      this.loadEvent(this.eventId);
      this.loadFeedback(this.eventId);
    });
  }

  loadEvent(id: any) {
    this.service.getReport(id).subscribe((res) => {
      this.reportDetail = res.payload;
      this.presentStudents = this.reportDetail[0].student_details.filter(
        (student: any) => student.attendance_status === 'present'
      );
      this.absentStudents = this.reportDetail[0].student_details.filter(
        (student: any) => student.attendance_status === 'absent'
      );
      this.registeredByCourse = this.reportDetail[0].registered_by_course;
      this.registeredByBlock = this.reportDetail[0].registered_by_block;
      this.registeredByYearLevel =
        this.reportDetail[0].registered_by_year_level;
    });
  }

  loadFeedback(id: any) {
    this.feedback.getEventFeedback(id).subscribe((res) => {
      this.feedbackData = res.payload;
      console.log(res.payload);

      this.feedbackSummary = this.generateFeedbackSummary();
    });
  }

  generateFeedbackSummary(): string {
    const totalFeedback = this.feedbackData.length;
    console.log(`heheheh ${totalFeedback}`);
    const averageFeedback = this.feedbackData[0].overall_satisfaction || 'N/A';
    return `${totalFeedback} feedback${
      totalFeedback > 1 ? 's' : ''
    } were received with an average overall satisfaction score of ${averageFeedback}.`;
  }

  generatePDF(event_id: any) {
    const element = document.querySelector('.report') as HTMLElement;
    const buttonElement = document.querySelector('.pdf-wrapper') as HTMLElement;
    let event_name = this.reportDetail[0].event_name;
    console.log(buttonElement);

    if (element && buttonElement) {
      // Temporarily hide the button using CSS visibility
      buttonElement.style.position = 'absolute';

      // Use setTimeout to ensure the style change is applied
      setTimeout(() => {
        // Clone the element to avoid modifying the original content
        const reportClone = element.cloneNode(true) as HTMLElement;

        // Append the clone to the document body
        document.body.appendChild(reportClone);

        html2canvas(reportClone, { scale: 2 })
          .then((canvas) => {
            const pdf = new jsPDF();
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const heightLeft = imgHeight;
            let position = 0;

            const imgData = canvas.toDataURL('image/png');

            // Add the first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            let remainingHeight = heightLeft - pageHeight;
            let positionOffset = 0;

            // Add additional pages if necessary
            while (remainingHeight > 0) {
              positionOffset -= pageHeight;
              pdf.addPage();
              pdf.addImage(
                imgData,
                'PNG',
                0,
                positionOffset,
                imgWidth,
                imgHeight
              );
              remainingHeight -= pageHeight;
            }

            // Save the PDF
            pdf.save(`${event_name}.pdf`);

            // Clean up
            document.body.removeChild(reportClone);

            // Restore the button visibility
            buttonElement.style.visibility = '';
          })
          .catch((error) => {
            console.error('Error generating PDF:', error);
            // Restore the button visibility if an error occurs
            buttonElement.style.visibility = '';
          });
      }, 100); // Delay to ensure hiding takes effect
    } else {
      console.error('Element or button not found');
    }
  }
}

//

// // pdf
// generatePDFs(event_id: any) {
//   const pdfDoc = new jsPDF('p', 'pt', 'a4');
//   // (Header images and other PDF setup code)
//   // Retrieve the event data
//   const event = this.reportDetail.find(
//     (e: { event_id: any }) => e.event_id === event_id
//   );
//   // Generate the dynamic summary
//   const eventSummary = this.generateDynamicSummary(event);
//   // Create content for the PDF
//   const eventDetails = `
//     Event Details
//     The event titled "${event.event_name}" took place on ${
//     event.event_start_date
//   } and concluded on ${
//     event.event_end_date
//   }. The event, organized to serve a maximum of ${
//     event.max_attendees
//   } attendees, was successfully completed with the status marked as "${
//     event.event_status
//   }".
//     ${eventSummary}
//     Registered Users by Course
//     ${event.registered_by_course
//       .map((item: any) => `${item.course}: ${item.count}`)
//       .join('\n')}
//     Registered Users by Block
//     ${event.registered_by_block
//       .map((item: any) => `${item.block}: ${item.count}`)
//       .join('\n')}
//     Registered Users by Year Level
//     ${event.registered_by_year_level
//       .map((item: any) => `${item.year_level}: ${item.count}`)
//       .join('\n')}
//     Feedback and Insights
//     ${
//       event.feedback_count
//     } feedback(s) were received with an average overall satisfaction score of ${
//     event.average_feedback || 'N/A'
//   }.
//     `;
//   const margins = { left: 40, right: 40 };
//   const contentWidth =
//     pdfDoc.internal.pageSize.getWidth() - margins.left - margins.right;
//   const lines = pdfDoc.splitTextToSize(eventDetails, contentWidth);
//   let y = 140; // Starting Y position for content
//   lines.forEach((line: any) => {
//     pdfDoc.text(line, margins.left, y);
//     y += 15;
//   });
//   pdfDoc.save('event-summary.pdf');
// }

// generateDynamicSummary(event: any): string {
//   const registeredUsers = event.registered_users;
//   const maxAttendees = event.max_attendees;
//   const feedbackCount = event.feedback_count;
//   const attendanceCount = event.attendance_count;
//   const presentCount = event.present_count;
//   const studentDetails = event.student_details;

//   let summary = `Event Summary for "${event.event_name}":\n\n`;

//   if (registeredUsers === 0) {
//     summary += `No students registered for this event.\n`;
//   } else {
//     summary += `Total registered participants: ${registeredUsers}\n`;
//     summary += `Max attendees allowed: ${maxAttendees}\n`;

//     if (registeredUsers === 1) {
//       summary += `1 student registered.\n`;
//     } else {
//       summary += `${registeredUsers} students registered.\n`;
//     }

//     if (presentCount === 0) {
//       summary += `No participants attended the event.\n`;
//     } else {
//       summary += `${presentCount} participant${
//         presentCount > 1 ? 's' : ''
//       } attended the event.\n`;
//     }

//     if (feedbackCount === 0) {
//       summary += `No feedback was collected.\n`;
//     } else {
//       summary += `${feedbackCount} feedback${
//         feedbackCount > 1 ? 's' : ''
//       } collected.\n`;
//       summary += `Average overall satisfaction: ${event.average_feedback}\n`;
//     }
//   }

//   if (studentDetails.length > 0) {
//     const presentStudents = studentDetails.filter(
//       (student: any) => student.attendance_status === 'present'
//     );
//     const absentStudents = studentDetails.filter(
//       (student: any) => student.attendance_status === 'absent'
//     );

//     summary += `\nPresent Students:\n`;
//     summary +=
//       presentStudents.length > 0
//         ? presentStudents
//             .map(
//               (student: any) => `${student.first_name} ${student.last_name}`
//             )
//             .join('\n')
//         : 'None';

//     summary += `\n\nAbsent Students:\n`;
//     summary +=
//       absentStudents.length > 0
//         ? absentStudents
//             .map(
//               (student: any) => `${student.first_name} ${student.last_name}`
//             )
//             .join('\n')
//         : 'None';
//   } else {
//     summary += `\nNo student details available.\n`;
//   }

//   return summary;
// }

// loadEvent(id: any) {
// //   this.service.getReport(id).subscribe((res) => {
// //     this.reportDetail = res.payload;
// //     console.log(`hello world :${this.reportDetail[0].event_name}`);
// //     console.log(`hello world :${this.reportDetail}`);
// //   });
// // }

// // loadFeedback(id: any) {
// //   this.feedback.getEventFeedback(id).subscribe((res) => {
// //     this.feedbackData = res.payload;
// //     const satisfactionDistribution = this.calculateSatisfactionDistribution(
// //       this.feedbackData
// //     );
// //     this.barChartData = {
// //       labels: [
// //         'Very Dissatisfied',
// //         'Dissatisfied',
// //         'Neutral',
// //         'Satisfied',
// //         'Very Satisfied',
// //       ],
// //       datasets: [
// //         {
// //           label: 'Overall Satisfaction',
// //           backgroundColor: '#ff8a00',
// //           barThickness: 20,
// //           borderRadius: 15,
// //           data: [
// //             satisfactionDistribution.veryDissatisfied,
// //             satisfactionDistribution.dissatisfied,
// //             satisfactionDistribution.neutral,
// //             satisfactionDistribution.satisfied,
// //             satisfactionDistribution.verySatisfied,
// //           ],
// //         },
// //       ],
// //     };
// //   });
// // }

// initializeChartOptions() {
//   this.chartOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     cutout: '70%',
//     radius: 50,
//     plugins: {
//       legend: {
//         position: 'right',
//         display: true,
//         labels: {
//           color: '#333',
//           usePointStyle: true,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           title: () => '',
//           label: (context: TooltipItem<'bar'>) => {
//             const label = context.label || '';
//             const value = (context.raw as number) || 0;
//             return `${label} : ${value} `;
//           },
//         },
//       },
//     },
//     elements: {
//       arc: {
//         borderWidth: 0,
//       },
//     },
//   };
// }

// getChartData(event: any, type: string): any {
//   const cacheKey = `${event.event_id}_${type}`;
//   if (this.chartDataCache.has(cacheKey)) {
//     return this.chartDataCache.get(cacheKey);
//   }

//   let labels: string[] = [];
//   let data: number[] = [];
//   let backgroundColor: string[] = [];
//   let message = '';

//   switch (type) {
//     //pie chart
//     case 'registrationToMaxAttendees':
//       labels = ['Active Users', 'Max Attendees'];
//       data = [event.registered_users, event.max_attendees];
//       backgroundColor = ['#73300a', '#c75519'];
//       const registeredUsersText =
//         event.registered_users === 1 ? 'student has' : 'students have';
//       message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersText} registered.`;
//       break;

//     case 'feedbackAttendance':
//       labels = ['Feedback', 'Attendance'];
//       data = [event.feedback_count, event.attendance_count];
//       backgroundColor = ['#73300a', '#c75519'];
//       let feedback =
//         event.feedback_count === 1 ? 'student had' : 'students had';
//       let attendance =
//         event.attendance_count === 1 ? 'student had' : 'students had';
//       message = `Out of the total attendees, ${event.feedback_count} ${feedback} given feedback and ${event.attendance_count} ${attendance} submitted attendance.`;
//       break;

//     case 'presentStudents':
//       const attendanceCount = event.student_details.reduce(
//         (acc: any, student: any) => {
//           if (student.attendance_status === 'present') {
//             acc.present += 1;
//           } else {
//             acc.absent += 1;
//           }
//           return acc;
//         },
//         { present: 0, absent: 0 }
//       );

//       const { present, absent } = attendanceCount;

//       labels = ['Present', 'Absent'];
//       data = [present, absent];
//       backgroundColor = ['#73300a', '#c75519'];
//       let presentStatus = present === 1 ? 'student is' : 'students are';
//       let absentStatus = absent === 1 ? 'student is' : 'students are';
//       message = `Out of the total attendees, ${present} ${presentStatus} present and ${absent}  ${absentStatus} absent.`;
//       break;

//     case 'courseRegistration':
//       const coursesData = event.registered_by_course.map(
//         (item: { count: number }) => item.count
//       );
//       const coursesDataLabel = event.registered_by_course.map(
//         (item: { course: string }) => `Course: ${item.course}`
//       );
//       labels = [...coursesDataLabel];
//       data = [...coursesData];
//       backgroundColor = [
//         '#73300a',
//         '#c75519',
//         '#ff8a00',
//         '#f6aa54',
//         '#3e2723',
//         '#5d4037',
//         '#795548',
//         '#8d6e63',
//       ];
//       const courses = event.registered_by_course
//         .map(
//           (item: { course: string; count: number }) =>
//             `<li>${item.course}: ${item.count} ${
//               item.count === 1 ? 'student' : 'students'
//             }</li>`
//         )
//         .join('');
//       const registeredUsersTextCourse =
//         event.registered_users === 1 ? 'student has' : 'students have';
//       message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextCourse} registered.<br><br> Registered by courses:<ul>${courses}</ul>`;
//       break;

//     case 'yearLevelRegistration':
//       const yearLevelsData = event.registered_by_year_level.map(
//         (item: { count: number }) => item.count
//       );
//       const yearLevelsDataLabel = event.registered_by_year_level.map(
//         (item: { year_level: string }) => `${item.year_level}`
//       );
//       labels = [...yearLevelsDataLabel];
//       data = [...yearLevelsData];
//       backgroundColor = [
//         '#73300a',
//         '#c75519',
//         '#ff8a00',
//         '#f6aa54',
//         '#3e2723',
//         '#5d4037',
//         '#795548',
//         '#8d6e63',
//       ];
//       const yearLevels = event.registered_by_year_level
//         .map(
//           (item: { year_level: string; count: number }) =>
//             `<li>${item.year_level}: ${item.count} ${
//               item.count === 1 ? 'student' : 'students'
//             }</li>`
//         )
//         .join('');
//       const registeredUsersTextYear =
//         event.registered_users === 1 ? 'student has' : 'students have';
//       message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextYear} registered.<br><br> Registered by year levels:<ul>${yearLevels}</ul>`;
//       break;

//     case 'blockRegistration':
//       const blocksData = event.registered_by_block.map(
//         (item: { count: number }) => item.count
//       );
//       const blocksDataLabel = event.registered_by_block.map(
//         (item: { block: string }) => `Block: ${item.block}`
//       );
//       labels = [...blocksDataLabel];
//       data = [...blocksData];
//       const blocks = event.registered_by_block
//         .map(
//           (item: { block: string; count: number }) =>
//             `<li>${item.block}: ${item.count} ${
//               item.count === 1 ? 'student' : 'students'
//             }</li>`
//         )
//         .join('');
//       const registeredUsersTextBlock =
//         event.registered_users === 1 ? 'student has' : 'students have';
//       message = `Out of ${event.max_attendees} potential attendees, ${event.registered_users} ${registeredUsersTextBlock} registered.<br><br> Registered by year levels:<ul>${blocks}</ul>`;
//       break;
//   }

//   const chartData = {
//     labels: labels,
//     datasets: [
//       {
//         data: data,
//         backgroundColor: backgroundColor,
//       },
//     ],
//     message: message,
//   };

//   this.chartDataCache.set(cacheKey, chartData);
//   return chartData;
// }

// barChartOption() {
//   this.baChartOption = {
//     maintainAspectRatio: false,
//     indexAxis: 'x',
//     responsive: true,
//     plugins: {
//       legend: {
//         labels: {
//           color: '#ff8a00',
//           usePointStyle: true,
//           font: {
//             size: 14,
//             family: 'Inter',
//           },
//         },
//       },
//       tooltip: {
//         callbacks: {
//           title: () => '',
//           label: (context: TooltipItem<'bar'>) => {
//             const label = context.label || '';
//             const value = (context.raw as number) || 0;
//             return `${label} : ${value} `;
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         display: true,
//         title: {
//           display: true,
//           text: 'Satisfaction Level ',
//           font: {
//             family: 'Inter',
//             size: 14,
//           },
//         },
//       },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           precision: 0,
//           stepSize: 1,
//           callback(value: any) {
//             if (Number.isInteger(value)) {
//               return value;
//             }
//           },
//         },
//       },
//     },
//   };
// }

// private calculateSatisfactionDistribution(feedback: Feedback[]): any {
//   const distribution = {
//     veryDissatisfied: 0,
//     dissatisfied: 0,
//     neutral: 0,
//     satisfied: 0,
//     verySatisfied: 0,
//   };

//   feedback.forEach((fb: { overall_satisfaction: number }) => {
//     if (fb.overall_satisfaction >= 4.5) {
//       distribution.verySatisfied += 1;
//     } else if (fb.overall_satisfaction >= 3.5) {
//       distribution.satisfied += 1;
//     } else if (fb.overall_satisfaction >= 2.5) {
//       distribution.neutral += 1;
//     } else if (fb.overall_satisfaction >= 1.5) {
//       distribution.dissatisfied += 1;
//     } else {
//       distribution.veryDissatisfied += 1;
//     }
//   });

//   return distribution;
// }

// replaceString(event: string) {
//   return event.replace(' Year', ' ');
// }

// getRegistrationMessage(event: any): string {
//   return `Out of ${event.max_attendees} potential attendees, ${event.registered_users}  have registered.`;
// }

// toggleTooltip(eventId: string) {
//   this.tooltipVisible[eventId] = !this.tooltipVisible[eventId];
//   for (const key in this.tooltipVisible) {
//     if (key !== eventId) {
//       this.tooltipVisible[key] = false;
//     }
//   }
// }

// @HostListener('document:click', ['$event'])
// onDocumentClick(event: MouseEvent) {
//   const target = event.target as HTMLElement;

//   const clickedOutside =
//     !target.closest('.tooltip-content') && !target.closest('svg');

//   if (clickedOutside) {
//     for (const key in this.tooltipVisible) {
//       this.tooltipVisible[key] = false;
//     }
//   }
// }

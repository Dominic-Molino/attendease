import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/service/event.service';
import { ActivatedRoute } from '@angular/router';
import { PDFDocument, rgb } from 'pdf-lib';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css',
})
export class CertificateComponent implements OnInit {
  user: any[] = [];
  eventId: any;

  @ViewChild('certificateTemplate') certificateTemplate: ElementRef | undefined;

  constructor(private service: EventService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      this.eventId = parseInt(paramId);
      this.getCertificate(this.eventId);
    });
  }

  getCertificate(id: any) {
    this.service.certificate(id).subscribe((res) => {
      this.user = res.payload;
      console.log(this.user);
      if (this.user.length > 0) {
        this.generatePdf();
      }
    });
  }

  async generatePdf() {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4 paper

    for (const student of this.user) {
      // Capture HTML content
      const canvas = await html2canvas(
        this.certificateTemplate?.nativeElement,
        {
          scale: 2, // Increase scale for better quality
        }
      );
      const imgData = canvas.toDataURL('image/png');

      // A4 landscape dimensions in mm
      const a4Width = 297; // Width of A4 in mm
      const a4Height = 210; // Height of A4 in mm

      // Get the dimensions of the image in pixels
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // Calculate the aspect ratio of the image
      const imgAspectRatio = imgWidthPx / imgHeightPx;
      const a4AspectRatio = a4Width / a4Height;

      // Calculate the width and height for the image to fill A4 page
      let imgWidth, imgHeight;

      if (imgAspectRatio > a4AspectRatio) {
        // Image is wider relative to A4 page; fit height and crop width
        imgHeight = a4Height;
        imgWidth = imgHeight * imgAspectRatio;
      } else {
        // Image is taller relative to A4 page; fit width and crop height
        imgWidth = a4Width;
        imgHeight = imgWidth / imgAspectRatio;
      }

      // Calculate offsets to center the image
      const xOffset = (a4Width - imgWidth) / 2; // Center horizontally
      const yOffset = (a4Height - imgHeight) / 2; // Center vertically

      // Add image to PDF and center it
      doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      // Add a new page for each certificate, if needed
      if (this.user.indexOf(student) < this.user.length - 1) {
        doc.addPage('a4', 'l');
      }
    }

    doc.save('certificates.pdf');
  }
}

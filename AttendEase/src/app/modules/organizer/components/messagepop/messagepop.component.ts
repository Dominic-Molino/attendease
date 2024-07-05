import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { dateTimeLocale } from '@mobiscroll/angular/dist/js/core/util/datetime';

@Component({
  selector: 'app-messagepop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messagepop.component.html',
  styleUrl: './messagepop.component.css',
})
export class MessagepopComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MessagepopComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { message: string; date: Date | null; name: string }
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

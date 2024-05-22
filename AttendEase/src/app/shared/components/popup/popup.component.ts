import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css',
})
export class PopupComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<PopupComponent>
  ) {}

  ngOnInit(): void {}
}

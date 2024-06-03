import { Component } from '@angular/core';
import { CardsComponent } from './components/cards/cards.component';
import { CourseComponent } from './components/course/course.component';
import { YearLevelComponent } from "./components/year-level/year-level.component";
import { BlockComponent } from "./components/block/block.component";
import { AttendanceComponent } from "./components/attendance/attendance.component";

@Component({
    selector: 'app-analytic',
    standalone: true,
    templateUrl: './analytic.component.html',
    styleUrl: './analytic.component.css',
    imports: [CourseComponent, CardsComponent, YearLevelComponent, BlockComponent, AttendanceComponent]
})
export class AnalyticComponent {}

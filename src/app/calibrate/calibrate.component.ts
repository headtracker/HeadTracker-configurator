import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-calibrate',
  standalone: true,
  imports: [MatStepperModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './calibrate.component.html',
})
export class CalibrateComponent {

  // GUI: {"Cmd":"D--"}��
  // HT: i (1112.656) main: Clearing Data List
  // GUI: {"Cmd":"RD","accx":true,"accy":true,"accz":true,"magx":true,"magy":true,"magz":true}N�
  // HT: i (1112.867) main: Data Added/Remove

}

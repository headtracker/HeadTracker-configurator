import { Component } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-analogaux',
  standalone: true,
  imports: [MatFormField, MatInput, MatLabel, MatOption, MatSelect, NgForOf],
  templateUrl: './analogaux.component.html',
})
export class AnalogauxComponent {}

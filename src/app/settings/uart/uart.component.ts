import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-uart',
  standalone: true,
  imports: [MatCheckbox, MatFormField, MatInput, MatOption, MatSelect],
  templateUrl: './uart.component.html',
})
export class UartComponent {}

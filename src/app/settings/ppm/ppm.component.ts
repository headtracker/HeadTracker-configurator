import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-ppm',
  standalone: true,
  imports: [MatCheckbox, MatFormField, MatInput, MatLabel, MatOption, MatSelect],
  templateUrl: './ppm.component.html',
})
export class PpmComponent {}

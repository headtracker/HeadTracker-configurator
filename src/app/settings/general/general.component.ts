import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatOption, MatSelect, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './general.component.html',
})
export class GeneralComponent {}

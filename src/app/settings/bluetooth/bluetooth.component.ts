import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-bluetooth',
  standalone: true,
  imports: [MatFormField, MatOption, MatSelect],
  templateUrl: './bluetooth.component.html',
})
export class BluetoothComponent {}

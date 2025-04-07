import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Constants } from '@libs/headtracker/Settings';

@Component({
  selector: 'channel',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-md h-5 bg-gray-700 text-white w-full text-center flex flex-row justify-center font-mono relative">
      <div [style.width]="width + '%'" class="absolute h-5 top-0 left-0 rounded-md"
           [class]="'bg-channel-'+channel"></div>
      <span class="z-50">Ch {{ channel }} {{ _value }}</span>
    </div>
  `,
})
export class ChannelComponent {
  @Input('channel') channel: string = '1';
  @Input('value')
  set value(val: number){
    if(!val) {
      this._value = Constants.PPM_CENTER;
    } else {
      this._value = val;
    }
  }

  _value: number = Constants.PPM_CENTER;

  get width() {
      return ((this._value - Constants.MIN_PWM) / (Constants.MAX_PWM - Constants.MIN_PWM)) * 100;
  }
}

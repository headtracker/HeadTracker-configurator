import { Component, Input } from '@angular/core';

@Component({
  selector: 'channel',
  standalone: true,
  imports: [],
  template: `
    <div class="rounded-md h-5  bg-gray-200 w-full text-center flex flex-row justify-center font-mono relative">
      <div class="w-3/4 absolute h-5 top-0 left-0 rounded-md" [style.background-color]="color"></div>
      <span class="z-50">Ch {{channel}} {{ value }}</span>
    </div>
  `,
})
export class ChannelComponent {
  @Input('color') color: string = 'gray';
  @Input('channel') channel: string = '1';
  @Input('value') value: number = 1500;
}

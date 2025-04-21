import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { filter, Subscription } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';
import { differenceInMilliseconds } from 'date-fns';
import { ChartOptions } from 'chart.js';
import { Constants } from '@libs/headtracker/Settings';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './output.component.html',
})
export class OutputComponent implements OnInit, OnDestroy {
  @ViewChild('axisChart', { read: BaseChartDirective }) axisChart?: BaseChartDirective;
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private sub?: Subscription;
  private interval?: number;
  private drawStart?: Date;

  panData: { x: number; y: number }[] = [];
  tiltData: { x: number; y: number }[] = [];
  rollData: { x: number; y: number }[] = [];

  ngOnInit() {
    this.drawStart = new Date();

    this.sub = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        const timeDiff = differenceInMilliseconds(Date.now(), this.drawStart!);

        this.panData.push({ x: timeDiff, y: message.panoff });
        this.tiltData.push({ x: timeDiff, y: message.tiltoff });
        this.rollData.push({ x: timeDiff, y: message.rolloff });
      });

    this.interval = setInterval(() => {
      const timeDiff = differenceInMilliseconds(Date.now(), this.drawStart!);

      if (!this.axisChart) return;

      this.barChartOptions = {
        ...this.axisChart!.options,
        scales: {
          ...this.axisChart!.options!.scales,
          x: {
            ...this.axisChart!.options!.scales!['x'],
            min: Math.max(0, timeDiff - 20000),
            max: Math.max(20000, timeDiff),
          },
        },
      } as ChartOptions<'line'>;

      this.axisChart?.update();
    }, 120) as unknown as number;
  }

  barChartData = {
    datasets: [
      {
        label: 'Pan',
        borderColor: '#f6c213',
        backgroundColor: '#f6c213',
        borderWidth: 3,
        fill: false,
        radius: 0,
        pointRadius: 0,
        hover: false,
        data: this.panData,
      },
      {
        label: 'Tilt',
        borderColor: '#f61313',
        backgroundColor: '#f61313',
        borderWidth: 3,
        fill: false,
        radius: 0,
        pointRadius: 0,
        hover: false,
        data: this.tiltData,
      },
      {
        label: 'Roll',
        borderColor: '#03c355',
        backgroundColor: '#03c355',
        borderWidth: 3,
        fill: false,
        radius: 0,
        pointRadius: 0,
        hover: false,
        data: this.rollData,
      },
    ],
  };

  barChartOptions: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    events: [],
    animation: false,
    scales: {
      x: {
        type: 'linear',
        display: false,
        min: 0,
        max: 20000,
      },
      y: {
        type: 'linear',
        min: -180,
        max: 180,
        ticks: {
          stepSize: 60,
          callback: (value: number | string) => {
            // if (typeof value === 'number') {
            //   return ((value - Constants.MIN_PWM) / 900) * 360 - 180;
            // } else {
              return value;
            // }
          },
        },
      },
    },
  };

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    clearInterval(this.interval);
  }
}

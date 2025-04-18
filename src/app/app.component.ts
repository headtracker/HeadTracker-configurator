import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FooterComponent } from '@app/footer/footer.component';
import { ConnectionService } from '@app/_services/connection.service';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { getUsbVendorById } from 'usb-vendor-ids';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    NgIf,
    RouterOutlet,
    RouterLink,
    FooterComponent,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Head Tracker Configurator';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;

  readonly connectionService: ConnectionService = inject(ConnectionService);
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  readonly observer: BreakpointObserver = inject(BreakpointObserver);

  async ngOnInit() {
    // try to load from existing approved ports.
    await this.connectionService.preloadPort();

    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });

    // For debugging purposes, we can listen to the connect and disconnect events
    navigator.serial.addEventListener('disconnect', (event) => {
      const port = event.target as SerialPort;
      console.info('Disconnected from port:', port.getInfo());
    });

    navigator.serial.addEventListener('connect', (event) => {
      const port = event.target as SerialPort;
      console.info('Connected to port:', port.getInfo());
    });
  }

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.sidenav.toggle(); // On desktop/tablet, the menu can never be fully closed
    }
  }

  async selectPort() {
    await this.connectionService.selectSerialPort();
  }

  async resetCenter() {
    await this.HTService.resetCenter();
  }

  async resetHeadTracker() {
    await this.HTService.reset();
  }

  getVendorName(id: number | undefined) {
    return id ? getUsbVendorById(id) : undefined;
  }
}

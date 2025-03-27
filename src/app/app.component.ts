import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from '@app/footer/footer.component';
import { ConnectionService } from '@app/connect/connection.service';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'headtracker-webui';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;

  readonly connectionService: ConnectionService = inject(ConnectionService);
  readonly observer: BreakpointObserver = inject(BreakpointObserver);

  async ngOnInit() {
    await this.connectionService.preloadPort();

    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  toggleMenu() {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
    }
  }
}

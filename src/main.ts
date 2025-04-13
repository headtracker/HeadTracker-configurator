import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@app/app.config';
import { AppComponent } from '@app/app.component';

if ('serial' in navigator) {
  bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
} else {
  document.querySelector<HTMLDivElement>('#no-serial-box')!.style.display = 'grid';
}

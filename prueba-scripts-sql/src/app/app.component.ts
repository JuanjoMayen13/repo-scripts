import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TablaScriptsComponent } from './tabla-scripts/tabla-scripts.component';
import * as FilePond from 'filepond';
import 'filepond/dist/filepond.css';
import 'filepond-plugin-file-validate-size';
import 'filepond-plugin-file-validate-type';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TablaScriptsComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prueba-scripts-sql';
}

import { Component, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-tabla-scripts',
  standalone: true,
  templateUrl: './tabla-scripts.component.html',
  styleUrls: ['./tabla-scripts.component.css']
})
export class TablaScriptsComponent {
  selectedFiles: FileList | undefined;

  constructor() { }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onSubmit() {
    if (this.selectedFiles) {
      const file: File = this.selectedFiles[0];
      console.log('Archivo seleccionado:', file);
      // Aquí puedes enviar el archivo al servidor o realizar cualquier otra acción necesaria.
    } else {
      console.log('Ningún archivo seleccionado.');
    }
  }

}

import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ApiQueriesService } from '../services/api-queries.service';
import { CommonModule } from '@angular/common';
import { Archivos, estadoArchivos  } from '../models/verificar-archivo.model';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-tabla-scripts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-scripts.component.html',
  styleUrls: ['./tabla-scripts.component.css']
})
export class TablaScriptsComponent implements OnInit {

  selectedFolder: any;
  folderFiles: File[] = [];
  
  archivosEstado: estadoArchivos = { archivosGuardados: [], archivosFaltantes: [] };
  archivos: Archivos[] = [];
  selectedFiles: FileList | null = null;
  @ViewChild('fileButton') fileButton!: ElementRef<HTMLInputElement>;

  constructor(private apiQueriesService: ApiQueriesService) {

  }

  ngOnInit(): void {

  }

    @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F1') {
      event.preventDefault();
      this.openFileExplorer();
    }
  }

  enviarNombresArchivos(nombresArchivos: string[]) {
    if (nombresArchivos.length === 0) {
      console.error('No se han seleccionado archivos para enviar.');
      return;
    }
    //Suponiendo que el servicio de API devuelve el objeto EstadoArchivos
    this.apiQueriesService.verificarArchivos(nombresArchivos).subscribe(
      (data: estadoArchivos) => {
        this.archivosEstado = data; // Asignar los datos recibidos a la variable archivosEstado
      },
      error => {
        console.error('Error al obtener los archivos:', error);
      }
    );
  }
  
  openFileExplorer() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.webkitdirectory = true;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', this.onFileChange.bind(this));
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }


  selectFolder(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFolder = event.target.files[0];
      console.log('Carpeta seleccionada:', this.selectedFolder);

      if ('webkitRelativePath' in this.selectedFolder) {
        const filesArray = Array.from(event.target.files) as File[];
        this.folderFiles = filesArray.filter(file =>
          file.webkitRelativePath.startsWith(this.selectedFolder.webkitRelativePath)
        );

        // Llama a enviarNombresArchivos con los nombres de archivos de la carpeta seleccionada
        const fileNames = this.folderFiles.map(file => file.name);
        this.enviarNombresArchivos(fileNames);
      } else {
        console.warn('La propiedad webkitRelativePath no está disponible en este navegador.');
      }
    }
  }

  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
    console.log('Archivos seleccionados:', this.selectedFiles);
    this.selectedFolder = event.target.files[0];
    console.log('Carpeta seleccionada:', this.selectedFolder);

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      let fileNames: string[] = [];
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        fileNames.push(file.name);
      }
      this.enviarNombresArchivos(fileNames);
    }
  }
}
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ApiQueriesService } from '../services/api-queries.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tabla-scripts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-scripts.component.html',
  styleUrls: ['./tabla-scripts.component.css']
})
export class TablaScriptsComponent implements OnInit {
  selectedFolder: any;
  folderFiles: File[] = [];
  selectedFiles: FileList | null = null;
  @ViewChild('fileButton') fileButton!: ElementRef<HTMLInputElement>;

  constructor(private apiQueriesService: ApiQueriesService) { }

  ngOnInit(): void { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F1') {
      event.preventDefault(); //Evita la accion por default de la tecla F1
      this.openFileExplorer();
    }
  }
  
  enviarNombresArchivos(nombresArchivos: string[]) {
    if (nombresArchivos.length === 0) {
      console.error('No se han seleccionado archivos para enviar.');
      return;
    }
    this.apiQueriesService.verificarArchivos(nombresArchivos).subscribe(
      respuesta => {
        // Manejar la respuesta del servidor si es necesario
        console.log(respuesta);
      },
      error => {
        // Manejar errores si la solicitud falla
        console.error(error);
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

      //Verifica si el objeto tiene la propiedad webkitRelativePath
      if ('webkitRelativePath' in this.selectedFolder) {
        const filesArray = Array.from(event.target.files) as File[];
        //Filtra los archivos que pertenecen a la carpeta seleccionada
        this.folderFiles = filesArray.filter(file =>
          file.webkitRelativePath.startsWith(this.selectedFolder.webkitRelativePath)
        );
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
    //Verifica si se seleccionaron archivos
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      //Itera sobre la lista de archivos seleccionados para obtener los nombres
      let fileNames: string[] = [];
      let fileSize: string[] = [];
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        fileNames.push(file.name);
        fileSize.push(file.size.toString())
      }

      // Envia los nombres de los archivos al servicio API
      this.enviarNombresArchivos(fileNames);
    }
  }
}
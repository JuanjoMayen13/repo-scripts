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
  //arreglos para las interfaces o models
  folderFiles: File[] = [];
  estadoArchivos: estadoArchivos[] = [];
  archivos: Archivos[] = [];
  mostrarActualizar: boolean = false;
  mostrarReemplazar: boolean = false;
  checkboxesArchivosGuardadosSeleccionados: boolean[] = [];
  checkboxesArchivosFaltantesSeleccionados: boolean[] = [];
  
  archivosEstado: estadoArchivos = { archivosGuardados: [], archivosFaltantes: [] };
 
  selectedFiles: FileList | null = null;
  @ViewChild('fileButton') fileButton!: ElementRef<HTMLInputElement>;

  constructor(private apiQueriesService: ApiQueriesService) {

  }

  ngOnInit(): void {

  }

    @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F1') {
      event.preventDefault(); //se evita la accion por default de la tecla F1
      this.openFileExplorer();
    } if (event.key === 'F2') {
      console.log("Se ejecuto F2 para actualizar un scipt")
    } if (event.key === 'F3'){
      event.preventDefault();
      console.log("Se ejecuto F3 para reemplazar un script") 
    }
  }

  enviarNombresArchivos(nombresArchivos: string[]) {
    if (nombresArchivos.length === 0) {
      console.error('No se han seleccionado archivos para enviar.');
      return;
    }
    //El servicio de API devuelve el objeto EstadoArchivos
    this.apiQueriesService.verificarArchivos(nombresArchivos).subscribe(
      (data: estadoArchivos) => {
        this.archivosEstado = data;
        console.log(data); //Asignar los datos recibidos a la variable archivosEstado
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
      //Selecciona el primer archivo
      const folder = event.target.files[0];
  
      //Guarda la carpeta seleccionada
      this.selectedFolder = folder;
  
      //Filtra los archivos de la carpeta
      const folderFiles: File[] = [];
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        // Verifica si el archivo está dentro de la carpeta seleccionada
        if (file.webkitRelativePath.startsWith(folder.webkitRelativePath)) {
          folderFiles.push(file);
        }
      }
  
      //Guarda los archivos de la carpeta
      this.folderFiles = folderFiles;
  
      //Llama a enviarNombresArchivos con los nombres de archivos de la carpeta seleccionada
      const fileNames = this.folderFiles.map(file => file.name);
      this.enviarNombresArchivos(fileNames);
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

  onCheckboxChange(tipo: string, index: number) {
    if (tipo === 'guardados') {
        // Deshabilitar los checkboxes de archivos faltantes
        this.checkboxesArchivosFaltantesSeleccionados.fill(false);

        // Verificar si al menos un archivo guardado está seleccionado
        if (this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked)) {
        
            this.mostrarReemplazar = true;
        } else {
       
            this.mostrarReemplazar = false;
        }
        
        this.mostrarActualizar = false;
    } else if (tipo === 'faltantes') {
        // Deshabilitar los checkboxes de archivos guardados
        this.checkboxesArchivosGuardadosSeleccionados.fill(false);

        // Verificar si al menos un archivo faltante está seleccionado
        if (this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked)) {
            
            this.mostrarActualizar = true;
        } else {
   
            this.mostrarActualizar = false;
        }
      
        this.mostrarReemplazar = false;
    }
}
}
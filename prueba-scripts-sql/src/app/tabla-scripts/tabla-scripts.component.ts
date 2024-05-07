import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ApiQueriesService } from '../services/api-queries.service';
import { CommonModule } from '@angular/common';
import { Archivos, estadoArchivos  } from '../models/verificar-archivo.model';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-tabla-scripts',
  standalone: true,
  imports: [CommonModule, FormsModule,LoadingComponent ],
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

  archivoSeleccionado: File | null = null;
  nombreArchivoSeleccionado: string | null = null;
  
  archivosEstado: estadoArchivos = { archivosGuardados: [], archivosFaltantes: [] };
 
  selectedFiles: FileList | null = null;
  @ViewChild('fileButton') fileButton!: ElementRef<HTMLInputElement>;

  constructor(private apiQueriesService: ApiQueriesService) {}

  ordenarArchivosPorNombre(archivos: any[]): any[] {
    return archivos.sort((a, b) => a.archivo.localeCompare(b.archivo));
  }


  ngOnInit(): void {
    this.archivosEstado.archivosGuardados = this.ordenarArchivosPorNombre(this.archivosEstado.archivosGuardados);
    // Ordenar archivos faltantes
    this.archivosEstado.archivosFaltantes = this.ordenarArchivosPorNombre(this.archivosEstado.archivosFaltantes);
  }

    @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F1') {
      this.openFileExplorer();
      event.preventDefault(); //se evita la accion por default de la tecla F1
    } if (event.key === 'F2') {
      this.onActualizarClick();
      event.preventDefault();
      console.log("Se ejecuto F2 para actualizar un scipt")
    } if (event.key === 'F3'){
      this.onReemplazarClick();
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

      const folder = event.target.files[0];
      this.selectedFolder = folder;
      // Filtra los archivos de la carpeta
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
      const archivo = this.archivosEstado.archivosGuardados[index];
      const fileName = archivo.archivo;
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === fileName);
      if (selectedFile) {
        this.archivoSeleccionado = selectedFile;
        console.log('Archivo guardado seleccionado:', this.archivoSeleccionado);
      } else {
        console.error('El archivo guardado no se encontró en la lista de archivos seleccionados.');
      }
      this.mostrarReemplazar = this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked);
      this.mostrarActualizar = false;
    } else if (tipo === 'faltantes') {
      const archivo = this.archivosEstado.archivosFaltantes[index];
      const fileName = archivo.archivo;
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === fileName);
      if (selectedFile) {
        this.archivoSeleccionado = selectedFile;
        console.log('Archivo faltante seleccionado:', this.archivoSeleccionado);
      } else {
        console.error('El archivo faltante no se encontró en la lista de archivos seleccionados.');
      }
      this.mostrarActualizar = this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked);
      this.mostrarReemplazar = false;
    }
  }
  
  
  
  onActualizarClick() {
    const formData = new FormData();
  
    // Agrega los archivos seleccionados y marcados como faltantes al FormData
    if (this.selectedFiles) {
      Array.from(this.selectedFiles).forEach((file: File, index: number) => {
        if (this.checkboxesArchivosFaltantesSeleccionados[index] && file instanceof File) {
          formData.append('sqlFiles', file); // Guarda el archivo en el FormData
          console.log('Archivo seleccionado para actualizar:', file);
        }
      });
    }
  
    console.log('FormData antes de enviar:', formData); // Imprime el FormData antes de enviar la solicitud
  
    // Llama al método para ejecutar los archivos SQL con el FormData como parámetro
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        console.log(response); // Manejar respuesta exitosa
      },
      (error) => {
        console.error(error); // Manejar error
      }
    );
  }

  onReemplazarClick() {
    const formData = new FormData();
  
    // Obtener los nombres de los archivos seleccionados para reemplazar
    const nombresArchivosSeleccionados = this.archivosEstado.archivosGuardados
      .filter((archivo, index) => this.checkboxesArchivosGuardadosSeleccionados[index])
      .map((archivo) => archivo.archivo);
  
    console.log('Nombres de archivos seleccionados:', nombresArchivosSeleccionados);
  
    // Buscar los archivos faltantes correspondientes a los archivos seleccionados
    const archivosFaltantesSeleccionados = this.archivosEstado.archivosFaltantes
      .filter((archivo) => nombresArchivosSeleccionados.includes(archivo.archivo));
  
    console.log('Archivos faltantes seleccionados:', archivosFaltantesSeleccionados);
  
    // Agregar los archivos faltantes seleccionados al FormData
    archivosFaltantesSeleccionados.forEach((archivo) => {
      formData.append('sqlFiles', archivo.archivo); // Agregar el nombre del archivo al FormData
    });
  
    console.log('FormData antes de enviar:', formData);
  
    // Llama al método para ejecutar los archivos SQL con el FormData como parámetro
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        console.log(response); // Manejar respuesta exitosa
      },
      (error) => {
        console.error(error); // Manejar error
      }
    );
  }
  
  
  

}
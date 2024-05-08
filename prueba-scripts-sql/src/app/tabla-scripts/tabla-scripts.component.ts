import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ApiQueriesService } from '../services/api-queries.service';
import { CommonModule } from '@angular/common';
import { Archivos, estadoArchivos  } from '../models/verificar-archivo.model';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-tabla-scripts',
  standalone: true,
  imports: [CommonModule, FormsModule,LoadingComponent ],
  templateUrl: './tabla-scripts.component.html',
  styleUrls: ['./tabla-scripts.component.css']
})
export class TablaScriptsComponent implements OnInit {
  selectedFolder: any;
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
  mensajeInterfaz: string = '';
  selectedFiles: FileList | null = null;
  filtroArchivos = new FormControl('Todos');
  mostrarGuardados: boolean = false;
  mostrarFaltantes: boolean = true;
;

  @ViewChild('fileButton') fileButton!: ElementRef<HTMLInputElement>;

  constructor(private apiQueriesService: ApiQueriesService) {}

  ngOnInit(): void {}

  ordenarArchivosPorNombre(archivos: any[]): any[] {
    return archivos;
  }
  

  primeroGuardados() {
      this.mostrarGuardados = true;
      this.mostrarFaltantes = false;
  }

  primeroFaltantes() {
      this.mostrarGuardados = false;
      this.mostrarFaltantes = true;
  }

    @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'F1') {
      this.openFileExplorer();
      event.preventDefault(); //se evita la accion por default de la tecla F1
    } if (event.key === 'F2') {
      this.onActualizarClick();
      event.preventDefault();
    } if (event.key === 'F3'){
      this.onReemplazarClick();
      event.preventDefault();
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
      this.enviarNombresArchivos(fileNames); // Enviar los nombres de archivos sin modificar el orden
    }
  }
  bloquearSeleccionFaltantes = true;
  
onCheckboxChange(tipo: string, index: number) {
    if (tipo === 'guardados') {
    // Verificar si se ha seleccionado un archivo faltante
      if (this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked)) {
      console.error('No puedes seleccionar un archivo guardado si ya se ha seleccionado un archivo faltante.');
      // Reiniciar los checkboxes de archivos faltantes
      this.checkboxesArchivosFaltantesSeleccionados.fill(false);
      // Actualizar la variable mostrarReemplazar
      this.mostrarActualizar = false;
      } 
      const archivo = this.archivosEstado.archivosGuardados[index];
      const fileName = archivo.archivo;
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === fileName);
      if (selectedFile) {
      this.archivoSeleccionado = selectedFile;
      console.log('Archivo guardado seleccionado:', this.archivoSeleccionado);
      } else {
      console.error('El archivo guardado no se encontró en la lista de archivos seleccionados.');
      }
    // Actualizar la variable mostrarActualizar
      this.mostrarReemplazar = this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked);
    } else if (tipo === 'faltantes') {
    // Verificar si se ha seleccionado un archivo guardado
      if (this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked)) {
      console.error('No puedes seleccionar un archivo faltante si ya se ha seleccionado un archivo guardado.');
      // Reiniciar los checkboxes de archivos guardados
      this.checkboxesArchivosGuardadosSeleccionados.fill(false);
      // Actualizar la variable mostrarActualizar
      this.mostrarReemplazar = false;
      }
      const archivo = this.archivosEstado.archivosFaltantes[index];
      const fileName = archivo.archivo;
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === fileName);
      if (selectedFile) {
      this.archivoSeleccionado = selectedFile;
      console.log('Archivo faltante seleccionado:', this.archivoSeleccionado);
      } else {
      console.error('El archivo faltante no se encontró en la lista de archivos seleccionados.');
      }
    // Actualizar la variable mostrarReemplazar
      this.mostrarActualizar = this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked);
    }
  }
  
  onActualizarClick() {
    const formData = new FormData();
    const nombresArchivosSeleccionados = this.archivosEstado.archivosFaltantes
      .filter((archivo, index) => this.checkboxesArchivosFaltantesSeleccionados[index])
      .map((archivo) => archivo.archivo);
    console.log('Nombres de archivos seleccionados:', nombresArchivosSeleccionados);
    // Buscar los archivos guardados correspondientes a los archivos seleccionados
    const archivosFaltantesSeleccionados = this.archivosEstado.archivosFaltantes
      .filter((archivo) => nombresArchivosSeleccionados.includes(archivo.archivo))
      .map((archivo) => archivo.archivo);
    console.log('Archivos guardados seleccionados:', archivosFaltantesSeleccionados);
    archivosFaltantesSeleccionados.forEach((nombreArchivo) => {
      // Buscar el archivo en la lista de archivos seleccionados
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === nombreArchivo);
      if (selectedFile) {
        formData.append('sqlFiles', selectedFile);
      }
    });
    console.log('FormData antes de enviar:', formData);
    // Llama al método para ejecutar los archivos SQL con el FormData como parámetro
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        this.mensajeInterfaz = response;
        console.log(response);
        // Establecer mensajeInterfaz en null después de 5 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 5000);
      },
      (error) => {
        if (error.error && error.error.text) {
          this.mensajeInterfaz = error.error.text;
        } else {
          this.mensajeInterfaz = 'Error inesperado al procesar la respuesta del servidor.';
        }
        console.error(error);
        // Establecer mensajeInterfaz en null después de 5 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 5000);
      }
    );
    
  }

  onReemplazarClick() {
    const formData = new FormData();
    const nombresArchivosSeleccionados = this.archivosEstado.archivosGuardados
      .filter((archivo, index) => this.checkboxesArchivosGuardadosSeleccionados[index])
      .map((archivo) => archivo.archivo);
    console.log('Nombres de archivos seleccionados:', nombresArchivosSeleccionados);
    // Buscar los archivos guardados correspondientes a los archivos seleccionados
    const archivosGuardadosSeleccionados = this.archivosEstado.archivosGuardados
      .filter((archivo) => nombresArchivosSeleccionados.includes(archivo.archivo))
      .map((archivo) => archivo.archivo);
    console.log('Archivos guardados seleccionados:', archivosGuardadosSeleccionados);
    archivosGuardadosSeleccionados.forEach((nombreArchivo) => {
      // Buscar el archivo en la lista de archivos seleccionados
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === nombreArchivo);
      if (selectedFile) {
        formData.append('sqlFiles', selectedFile);
      }
    });
    console.log('FormData antes de enviar:', formData);
    // Llama al método para ejecutar los archivos SQL con el FormData como parámetro
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        this.mensajeInterfaz = response;
        console.log(response);
        // Establecer mensajeInterfaz en null después de 5 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 5000);
      },
      (error) => {
        if (error.error && error.error.text) {
          this.mensajeInterfaz = error.error.text;
        } else {
          this.mensajeInterfaz = 'Error inesperado al procesar la respuesta del servidor.';
        }
        console.error(error);
        // Establecer mensajeInterfaz en null después de 5 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 5000);
      }
    );
  }
}
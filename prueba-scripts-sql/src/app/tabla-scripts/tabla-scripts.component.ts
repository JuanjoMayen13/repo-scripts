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
  selectedFolder:             any;
  mostrarReemplazar:          boolean = false;
  mostrarActualizar:          boolean = false;
  mostrarGuardados:           boolean = false;
  mostrarFaltantes:           boolean = true;
  mensajeInterfaz:            string = '';
  archivoSeleccionado:        File | null = null;
  selectedFiles:              FileList | null = null;
  nombreArchivoSeleccionado:  string | null = null;
  folderFiles:                File[] = [];
  archivos:                   Archivos[] = [];
  estadoArchivos:             estadoArchivos[] = [];
  checkboxesArchivosGuardadosSeleccionados: boolean[] = [];
  checkboxesArchivosFaltantesSeleccionados: boolean[] = [];
  archivosEstado: estadoArchivos = { archivosGuardados: [], archivosFaltantes: [] };
  filtroArchivos = new FormControl('Todos');

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
    if (event.key === 'F1'){
      this.abrirExplorador();
      event.preventDefault(); //Se evita la accion por default de la tecla F1 con la funcion preventDefault()
    } if (event.key === 'F2'){
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
    //El servicio del API devuelve el objeto EstadoArchivos
    this.apiQueriesService.verificarArchivos(nombresArchivos).subscribe(
      (data: estadoArchivos) => {
        this.archivosEstado = data;
        console.log(data); //Asigna los datos recibidos a la variable archivosEstado
      },
      error => {
        console.error('Error al obtener los archivos:', error);
      }
    );
  }
  
  abrirExplorador() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.webkitdirectory = true;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', this.cambioArchivo.bind(this));
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  seleccionarCarpeta(event: any) {
    if (event.target.files.length > 0) {
      const folder = event.target.files[0];
      this.selectedFolder = folder;
      //Va filtrar los archivos de la carpeta
      const folderFiles: File[] = [];
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        // Va a verificar si el archivo está dentro de la carpeta seleccionada
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

  cambioArchivo(event: any) {
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
      this.enviarNombresArchivos(fileNames); //Nos va enviar los nombres de archivos sin modificar en orden
    }
  }

  bloquearSeleccionFaltantes = true;
  
  onCheckboxChange(tipo: string, index: number) {
    if (tipo === 'guardados') {
        //Va verificar si se selecciono un archivo faltante
        if (this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked)) {
          console.error('No puedes seleccionar un archivo guardado si ya se ha seleccionado un archivo faltante.');
          //Va reiniciar los checkboxes de archivos faltantes
          this.checkboxesArchivosFaltantesSeleccionados.fill(false);
          //Va actualizar la variable mostrarReemplazar
          this.mostrarActualizar = false;
          return;
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
        //Actualiza la variable mostrarActualizar
        this.mostrarReemplazar = this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked);
    } else if (tipo === 'faltantes') {

      //Va verificar si se ha seleccionado un archivo guardado
      if (this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked)) {
        console.error('No puedes seleccionar un archivo faltante si ya se ha seleccionado un archivo guardado.');
        //Va reiniciar los checkboxes de los archivos guardados
        this.checkboxesArchivosGuardadosSeleccionados.fill(false);
        //Va actualizar la variable mostrarActualizar
        this.mostrarReemplazar = false;
        return;
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
      //Se va actualizar la variable mostrarReemplazar
      this.mostrarActualizar = this.checkboxesArchivosFaltantesSeleccionados.some(checked => checked);
        
      //Bloquea todos los checkboxes de archivos faltantes al principio y los habilita
      //conforme se seleccionen los archivos anteriores
      for (let i = 0; i < this.checkboxesArchivosFaltantesSeleccionados.length; i++) {
        if (i <= index) { this.checkboxesArchivosFaltantesSeleccionados[i] = true; } else { this.checkboxesArchivosFaltantesSeleccionados[i] = false; }
      }
    }
  }

  onActualizarClick() {
    const formData = new FormData();
    const nombresArchivosSeleccionados = this.archivosEstado.archivosFaltantes
      .filter((archivo, index) => this.checkboxesArchivosFaltantesSeleccionados[index])
      .map((archivo) => archivo.archivo);
    console.log('Nombres de archivos seleccionados:', nombresArchivosSeleccionados);

    //Busca los archivos guardados que corresponden a los archivos seleccionados
    const archivosFaltantesSeleccionados = this.archivosEstado.archivosFaltantes
      .filter((archivo) => nombresArchivosSeleccionados.includes(archivo.archivo))
      .map((archivo) => archivo.archivo);
    console.log('Archivos guardados seleccionados:', archivosFaltantesSeleccionados);
    
    archivosFaltantesSeleccionados.forEach((nombreArchivo) => {
      //Busca el archivo en la lista de archivos seleccionados
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === nombreArchivo);
      if (selectedFile) {
        formData.append('sqlFiles', selectedFile);
      }
    });
    console.log('FormData antes de enviar:', formData);

    //Llama al método para ejecutar los archivos con el FormData
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        this.mensajeInterfaz = response;
        console.log(response);
        
        //Establece mensaje en null después de 7 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 7000);
      },
      (error) => {
        if (error.error && error.error.text) {
          this.mensajeInterfaz = error.error.text;
        } else {
          this.mensajeInterfaz = 'Error al procesar la respuesta del servidor.';
        }
        console.error(error);
        
        //Establece mensaje en null después de 7 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 7000);
      }
    );
    
  }

  onReemplazarClick() {
    const formData = new FormData();
    const nombresArchivosSeleccionados = this.archivosEstado.archivosGuardados
      .filter((archivo, index) => this.checkboxesArchivosGuardadosSeleccionados[index])
      .map((archivo) => archivo.archivo);
    console.log('Nombres de archivos seleccionados:', nombresArchivosSeleccionados);

    //Busca los archivos guardados que corresponden a los archivos seleccionados
    const archivosGuardadosSeleccionados = this.archivosEstado.archivosGuardados
      .filter((archivo) => nombresArchivosSeleccionados.includes(archivo.archivo))
      .map((archivo) => archivo.archivo);
    console.log('Archivos guardados seleccionados:', archivosGuardadosSeleccionados);

    archivosGuardadosSeleccionados.forEach((nombreArchivo) => {
      //Buscar el archivo en la lista de archivos seleccionados
      const selectedFile = Array.from(this.selectedFiles || []).find(file => file.name === nombreArchivo);
      if (selectedFile) {
        formData.append('sqlFiles', selectedFile);
      }
    });
    console.log('FormData antes de enviar:', formData);

    //Llama al método para ejecutar los archivos con el FormData
    this.apiQueriesService.ejecutarArchivosSQL(formData).subscribe(
      (response) => {
        this.mensajeInterfaz = response;
        console.log(response);

        //Establece mensaje en null después de 7 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 7000);
      },
      (error) => {
        if (error.error && error.error.text) {
          this.mensajeInterfaz = error.error.text;
        } else {
          this.mensajeInterfaz = 'Error al procesar la respuesta del servidor.';
        }
        console.error(error);

        //Establece mensaje en null después de 7 segundos
        setTimeout(() => {
          this.mensajeInterfaz = '';
          window.location.reload();
        }, 7000);
      }
    );
  }
}
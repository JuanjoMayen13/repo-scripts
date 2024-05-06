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

  constructor(private apiQueriesService: ApiQueriesService) {}

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
    if (this.selectedFiles && tipo === 'guardados') {
        // Deshabilitar los checkboxes de archivos faltantes
        this.checkboxesArchivosFaltantesSeleccionados.fill(false);

        // Verificar si al menos un archivo guardado está seleccionado
        if (this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked)) {
            this.mostrarReemplazar = true;
        } else {
            this.mostrarReemplazar = false;
        } 
        this.mostrarActualizar = false;
    } else if (this.selectedFiles && tipo === 'faltantes') {
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

    if (this.selectedFiles && this.mostrarActualizar && this.checkboxesArchivosGuardadosSeleccionados.some(checked => checked)) {
        const formData = new FormData();
        // Agregar archivos seleccionados al FormData
        for (let i = 0; i < this.checkboxesArchivosGuardadosSeleccionados.length; i++) {
            if (this.checkboxesArchivosGuardadosSeleccionados[i]) {
                const archivo = this.archivosEstado.archivosGuardados[i];
                // Supongamos que archivo contiene los datos que deseas enviar como una cadena de texto
                formData.append('sqlFiles', archivo.archivo);
                formData.append('fechaHora', archivo.fecha_Hora);
                formData.append('usuario', archivo.userName);
                formData.append('descripcion', archivo.descripcion);
                // Asegúrate de ajustar las claves (como 'archivo', 'fechaHora', 'usuario', 'descripcion') según lo que espera tu controlador

                // Adjuntar el archivo al FormData
                formData.append('file', this.selectedFiles[i]); // Ajusta esto según cómo recibas los archivos en tu controlador
            }
        }
        // Llamar al servicio para ejecutar archivos
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

  onActualizarClick() {
    const formData = new FormData();
    
    // Agrega los archivos seleccionados al FormData
    for (let i = 0; i < this.checkboxesArchivosFaltantesSeleccionados.length; i++) {
      if (this.checkboxesArchivosFaltantesSeleccionados[i]) {
        const archivo = this.archivosEstado.archivosFaltantes[i];
        formData.append('sqlFiles', archivo.archivo);
        formData.append('fechaHora', archivo.fecha_Hora);
        formData.append('usuario', archivo.userName);
        formData.append('descripcion', archivo.descripcion);
      }
    }
    
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
  
  // Define el método que se ejecutará al presionar el botón de reemplazar
  onReemplazarClick() {
    const formData = new FormData();
    
    // Agrega los archivos seleccionados al FormData
    for (let i = 0; i < this.checkboxesArchivosGuardadosSeleccionados.length; i++) {
      if (this.checkboxesArchivosGuardadosSeleccionados[i]) {
        const archivo = this.archivosEstado.archivosGuardados[i];
        formData.append('sqlFiles', archivo.archivo);
        formData.append('fechaHora', archivo.fecha_Hora);
        formData.append('usuario', archivo.userName);
        formData.append('descripcion', archivo.descripcion);
      }
    }
    
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

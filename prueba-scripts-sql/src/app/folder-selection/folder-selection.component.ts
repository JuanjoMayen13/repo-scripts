import { Component } from '@angular/core';
import { FolderSelectionService } from './folder-selection.service';


@Component({
  selector: 'app-folder-selection',
  templateUrl: './folder-selection.component.html',
  styleUrls: ['./folder-selection.component.css']
})
export class FolderSelectionComponent {

  constructor(private folderSelectionService: FolderSelectionService) { }

  onFolderSelected(event: any) {
    const selectedFolder = event.target.files[0].webkitRelativePath;
    this.folderSelectionService.selectFolder(selectedFolder)
      .subscribe(
        response => {
          console.log('Ruta de la carpeta seleccionada enviada correctamente');
          // Aquí puedes manejar la respuesta de la API si es necesario
        },
        error => {
          console.error('Error al enviar la ruta de la carpeta seleccionada', error);
        }
      );
  }
}

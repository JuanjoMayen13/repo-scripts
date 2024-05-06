import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoadingComponent implements OnInit{
  isLoading: boolean = true;
  progress: number = 0;
  @Input() progressValue: number = 0;

  
  ngOnInit(): void {
    setTimeout(() => {
      // Supongamos que los datos se han cargado después de 3 segundos
      this.isLoading = false; // Ocultar el componente de carga
    }, 3000);
  }

}


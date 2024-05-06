import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent implements OnInit{
  isLoading: boolean = true;

  ngOnInit(): void {
    setTimeout(() => {
      // Supongamos que los datos se han cargado después de 3 segundos
      this.isLoading = false; // Ocultar el componente de carga
    }, 3000);
  }

}


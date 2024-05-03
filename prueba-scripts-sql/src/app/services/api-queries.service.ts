//
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Archivos, estadoArchivos } from '../models/verificar-archivo.model';

@Injectable({
  providedIn: 'root'
})
export class ApiQueriesService {

  constructor(private http: HttpClient) { }

  verificarArchivos(nombresArchivos: string[]): Observable<any> {
    const url = 'http://192.168.1.44:9093/api/Ctrl_VerificarArchivos';
    return this.http.post(url, nombresArchivos);
  }

  public getArchivos(): Observable<Archivos[]>{
    const url = 'http://192.168.1.44:9093/api/Ctrl_VerificarArchivos';
    return this.http.get<Archivos[]>(url)
  }

  
  // public getEstadoArchivos(): Observable<estadoArchivos[]>{
  //   const url = 'http://192.168.1.18:9093/api/Ctrl_VerificarArchivos';
  //   return this.http.get<estadoArchivos[]>(url)
  // }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Archivos, estadoArchivos } from '../models/verificar-archivo.model';

@Injectable({
  providedIn: 'root'
})
export class ApiQueriesService {

  constructor(private http: HttpClient) { }
  private urlApiVerificar:string = "http://192.168.1.20:9093/api/";

  verificarArchivos(nombresArchivos: string[]): Observable<any> {
    const url = `${this.urlApiVerificar}Ctrl_VerificarArchivos`;
    return this.http.post(url, nombresArchivos);
  }

  public getArchivos(): Observable<Archivos[]>{
    const url = `${this.urlApiVerificar}Ctrl_VerificarArchivos`;
    return this.http.get<Archivos[]>(url)
  }

  ejecutarArchivosSQL(sqlFiles: FormData): Observable<any> {
    const url = 'http://192.168.1.20:9093/api/Ctrl_EjecucionQueries';
    return this.http.post(url, sqlFiles);
  }
}
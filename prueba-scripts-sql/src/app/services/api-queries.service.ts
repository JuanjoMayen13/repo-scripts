import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiQueriesService {

  constructor(private http: HttpClient) { }

  verificarArchivos(nombresArchivos: string[]): Observable<any> {
    const url = 'http://192.168.1.16:9093/api/Ctrl_VerificarArchivos';
    return this.http.post(url, nombresArchivos);
  }
}
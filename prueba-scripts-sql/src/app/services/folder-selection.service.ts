import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolderSelectionService {

  constructor(private http: HttpClient) { }

  selectFolder(folderPath: string): Observable<any> {
    return this.http.post<any>('http://192.168.1.17/api/Ctrl_VerificarArchivos', { folderPath });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Asignatura {
  _id?: string; // Fundamental para poder editar y eliminar
  nombre: string;
  nota: number;
  creditos: number;
}

export interface Stats {
  promedio: number;
  clasificacion: string;
  notaAlta: Asignatura | null;
  notaBaja: Asignatura | null;
}

export interface ProfileResponse {
  user?: {
    _id: string;
    name: string;
    email: string;
    asignaturas: Asignatura[];
  };
  asignaturas?: Asignatura[]; // Cuando hacemos POST/PUT/DELETE el backend devuelve esto en vez de 'user'
  stats: Stats;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  // Ajustado al puerto 4000 para que coincida con tu backend
  //private apiUrl = 'http://localhost:4000/api/users';
  private apiUrl = 'backend-production-95295.up.railway.app';
  // IMPORTANTE: Recuerda cambiar esto por un ID que realmente exista en tu colección "users" de MongoDB
  private userId = 'USER_ID_HERE'; 

  constructor(private http: HttpClient) { }

  setUserId(id: string) {
    this.userId = id;
  }

  getUserProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/${this.userId}/profile`);
  }

  addAsignatura(asignatura: Asignatura): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`${this.apiUrl}/${this.userId}/asignaturas`, asignatura);
  }

  updateAsignatura(id: string, asignatura: Asignatura): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/${this.userId}/asignaturas/${id}`, asignatura);
  }

  deleteAsignatura(id: string): Observable<ProfileResponse> {
    return this.http.delete<ProfileResponse>(`${this.apiUrl}/${this.userId}/asignaturas/${id}`);
  }
}

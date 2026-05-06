import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const API_URL = 'http://localhost:3000/api';

export type LoginResponse = {
  token: string;
  usuario: {
    id_usu: number;
    nom_usu: string;
    apell_usu: string;
    email_usu: string;
    nom_rol: string;
    id_ref: number | null;
    permisos: string[];
  };
};

export type SessionUser = LoginResponse['usuario'];

export type RegisterPayload = {
  nom_usu: string;
  apell_usu: string;
  email_usu: string;
  pass_usu: string;
  numcel_usu: string;
  fecnac_usu: string;
};

export type BackendRefugio = {
  id_ref: number;
  nom_ref: string;
  direc_ref: string;
  telef_ref: string;
  email_ref: string;
  estado_ref: boolean;
};

export type BackendMascota = {
  id_ani: number;
  nom_mascot: string;
  fechanac_mascot: string;
  esteril_mascot: boolean;
  sexo_mascot: string;
  caract_mascot: string;
  fechaing_mascot: string;
  id_raza: number;
  raza?: {
    id_raza?: number;
    nom_raza: string;
    especie?: {
      id_esp?: number;
      nom_esp: string;
    };
  };
};

export type BackendRole = {
  id_rol: number;
  codigo: string;
  nom_rol: string;
  descrip_rol: string;
};

export type BackendPermiso = {
  id_per: number;
  codigo: string;
  nombre: string;
};

export type BackendUsuario = {
  id_usu: number;
  nom_usu: string;
  apell_usu: string;
  email_usu: string;
  numcel_usu: string;
  id_rol: number;
  rol?: BackendRole;
  refugio?: BackendRefugio | null;
};

export type BackendEspecie = {
  id_esp: number;
  nom_esp: string;
};

export type BackendRaza = {
  id_raza: number;
  nom_raza: string;
  id_esp: number;
  especie?: BackendEspecie;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, {
      email_usu: email,
      pass_usu: password
    });
  }

  register(payload: RegisterPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_URL}/auth/register`, payload);
  }

  registerWorker(payload: RegisterPayload & { id_ref: number }): Observable<{ message: string; worker: BackendUsuario }> {
    return this.http.post<{ message: string; worker: BackendUsuario }>(`${API_URL}/auth/register/worker`, payload, { headers: this.authHeaders() });
  }

  getRefugios(): Observable<BackendRefugio[]> {
    return this.http.get<BackendRefugio[]>(`${API_URL}/refugios`, { headers: this.authHeaders() });
  }

  getRefugioById(id: number): Observable<BackendRefugio> {
    return this.http.get<BackendRefugio>(`${API_URL}/refugios/${id}`, { headers: this.authHeaders() });
  }

  getMascotas(): Observable<BackendMascota[]> {
    return this.http.get<BackendMascota[]>(`${API_URL}/mascotas`, { headers: this.authHeaders() });
  }

  getRoles(): Observable<BackendRole[]> {
    return this.http.get<BackendRole[]>(`${API_URL}/roles`, { headers: this.authHeaders() });
  }

  getPermisos(): Observable<BackendPermiso[]> {
    return this.http.get<BackendPermiso[]>(`${API_URL}/permisos`, { headers: this.authHeaders() });
  }

  getUsuarios(): Observable<BackendUsuario[]> {
    return this.http.get<BackendUsuario[]>(`${API_URL}/usuarios`, { headers: this.authHeaders() });
  }

  getMisTrabajadores(): Observable<BackendUsuario[]> {
    return this.http.get<BackendUsuario[]>(`${API_URL}/usuarios/trabajadores/mis-trabajadores`, { headers: this.authHeaders() });
  }

  getEspecies(): Observable<BackendEspecie[]> {
    return this.http.get<BackendEspecie[]>(`${API_URL}/especies`, { headers: this.authHeaders() });
  }

  getRazas(): Observable<BackendRaza[]> {
    return this.http.get<BackendRaza[]>(`${API_URL}/razas`, { headers: this.authHeaders() });
  }

  createRole(payload: Omit<BackendRole, 'id_rol'>): Observable<BackendRole> {
    return this.http.post<BackendRole>(`${API_URL}/roles`, payload, { headers: this.authHeaders() });
  }

  updateRole(id: number, payload: Partial<Omit<BackendRole, 'id_rol'>>): Observable<BackendRole> {
    return this.http.put<BackendRole>(`${API_URL}/roles/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteRole(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/roles/${id}`, { headers: this.authHeaders() });
  }

  createPermiso(payload: Omit<BackendPermiso, 'id_per'>): Observable<BackendPermiso> {
    return this.http.post<BackendPermiso>(`${API_URL}/permisos`, payload, { headers: this.authHeaders() });
  }

  updatePermiso(id: number, payload: Partial<Omit<BackendPermiso, 'id_per'>>): Observable<BackendPermiso> {
    return this.http.put<BackendPermiso>(`${API_URL}/permisos/${id}`, payload, { headers: this.authHeaders() });
  }

  deletePermiso(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/permisos/${id}`, { headers: this.authHeaders() });
  }

  createUsuario(payload: Record<string, unknown>): Observable<BackendUsuario> {
    return this.http.post<BackendUsuario>(`${API_URL}/usuarios`, payload, { headers: this.authHeaders() });
  }

  updateUsuario(id: number, payload: Record<string, unknown>): Observable<BackendUsuario> {
    return this.http.put<BackendUsuario>(`${API_URL}/usuarios/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteUsuario(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/usuarios/${id}`, { headers: this.authHeaders() });
  }

  createMascota(payload: Record<string, unknown>): Observable<BackendMascota> {
    return this.http.post<BackendMascota>(`${API_URL}/mascotas`, payload, { headers: this.authHeaders() });
  }

  updateMascota(id: number, payload: Record<string, unknown>): Observable<BackendMascota> {
    return this.http.put<BackendMascota>(`${API_URL}/mascotas/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteMascota(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/mascotas/${id}`, { headers: this.authHeaders() });
  }

  createRefugio(payload: Omit<BackendRefugio, 'id_ref'>): Observable<BackendRefugio> {
    return this.http.post<BackendRefugio>(`${API_URL}/refugios`, payload, { headers: this.authHeaders() });
  }

  updateRefugio(id: number, payload: Partial<Omit<BackendRefugio, 'id_ref'>>): Observable<BackendRefugio> {
    return this.http.put<BackendRefugio>(`${API_URL}/refugios/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteRefugio(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/refugios/${id}`, { headers: this.authHeaders() });
  }

  createEspecie(payload: Omit<BackendEspecie, 'id_esp'>): Observable<BackendEspecie> {
    return this.http.post<BackendEspecie>(`${API_URL}/especies`, payload, { headers: this.authHeaders() });
  }

  updateEspecie(id: number, payload: Partial<Omit<BackendEspecie, 'id_esp'>>): Observable<BackendEspecie> {
    return this.http.put<BackendEspecie>(`${API_URL}/especies/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteEspecie(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/especies/${id}`, { headers: this.authHeaders() });
  }

  createRaza(payload: Omit<BackendRaza, 'id_raza' | 'especie'>): Observable<BackendRaza> {
    return this.http.post<BackendRaza>(`${API_URL}/razas`, payload, { headers: this.authHeaders() });
  }

  updateRaza(id: number, payload: Partial<Omit<BackendRaza, 'id_raza' | 'especie'>>): Observable<BackendRaza> {
    return this.http.put<BackendRaza>(`${API_URL}/razas/${id}`, payload, { headers: this.authHeaders() });
  }

  deleteRaza(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/razas/${id}`, { headers: this.authHeaders() });
  }

  getToken(): string {
    return localStorage.getItem('token') ?? '';
  }

  getSession(): SessionUser | null {
    try {
      return JSON.parse(localStorage.getItem('session') ?? 'null') as SessionUser | null;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('session');
    window.dispatchEvent(new Event('session-changed'));
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ApiService,
  BackendEspecie,
  BackendMascota,
  BackendPermiso,
  BackendRaza,
  BackendRefugio,
  BackendRole,
  BackendUsuario
} from '../../services/api.service';

type Pet = {
  nombre: string;
  tipo: string;
  edad: string;
  tamano: string;
  salud: string;
  refugio: string;
  imagen: string;
};

type Shelter = {
  nombre: string;
  zona: string;
  contacto: string;
  estado: string;
};

type AdoptionRequest = {
  id: string;
  mascota: string;
  refugio: string;
  solicitante: string;
  telefono: string;
  direccion: string;
  fecha: string;
  estado: 'En evaluacion' | 'Aprobada' | 'Rechazada';
};

type Donation = {
  id: string;
  donante: string;
  tipo: 'Economica' | 'Especie';
  detalle: string;
  refugio: string;
  fecha: string;
};

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent {
  protected section = '';
  protected filtroTipo = '';
  protected filtroTamano = '';
  protected loading = false;
  protected apiMessage = '';
  protected roles: BackendRole[] = [];
  protected permisos: BackendPermiso[] = [];
  protected usuarios: BackendUsuario[] = [];
  protected mascotas: BackendMascota[] = [];
  protected refugios: BackendRefugio[] = [];
  protected especies: BackendEspecie[] = [];
  protected razas: BackendRaza[] = [];
  protected readonly apiBaseUrl = 'http://localhost:3000/api';
  protected rawResponse = '';
  protected formMessage = '';

  protected roleEditId: number | null = null;
  protected roleForm = { codigo: '', nom_rol: '', descrip_rol: '' };

  protected permisoEditId: number | null = null;
  protected permisoForm = { codigo: '', nombre: '' };

  protected usuarioEditId: number | null = null;
  protected usuarioForm = {
    nom_usu: '',
    apell_usu: '',
    fecnac_usu: '',
    numcel_usu: '',
    email_usu: '',
    pass_usu: '',
    id_rol: 0,
    id_ref: null as number | null
  };

  protected mascotaEditId: number | null = null;
  protected mascotaForm = {
    nom_mascot: '',
    fechanac_mascot: '',
    esteril_mascot: false,
    sexo_mascot: 'Macho',
    caract_mascot: '',
    id_raza: 0
  };

  protected refugioEditId: number | null = null;
  protected refugioForm = { nom_ref: '', direc_ref: '', telef_ref: '', email_ref: '', estado_ref: true };

  protected especieEditId: number | null = null;
  protected especieForm = { nom_esp: '' };

  protected razaEditId: number | null = null;
  protected razaForm = { nom_raza: '', id_esp: 0 };

  // Modal / acciones en Animales
  protected selectedPet: Pet | null = null;
  protected showPetModal = false;
  protected showAdoptionModal = false;
  protected adoptionOk = '';

  // Formulario de adopcion
  protected solicitante = '';
  protected telefono = '';
  protected direccion = '';

  // Donaciones
  protected donationDonante = '';
  protected donationTipo: Donation['tipo'] = 'Economica';
  protected donationDetalle = '';
  protected donationRefugio = 'Refugio Huellitas';
  protected donationOk = '';

  protected shelters: Shelter[] = [
    { nombre: 'Huellitas', zona: 'Miraflores', contacto: '77711122', estado: 'Activo' },
    { nombre: 'Patitas', zona: 'Sopocachi', contacto: '76543210', estado: 'Activo' },
    { nombre: 'Esperanza Animal', zona: 'Obrajes', contacto: '70101010', estado: 'En revision' }
  ];

  protected pets: Pet[] = [
    {
      nombre: 'Luna',
      tipo: 'Perro',
      edad: '2 anios',
      tamano: 'Mediano',
      salud: 'Vacunada',
      refugio: 'Refugio Huellitas',
      imagen: '/images/dog-luna.svg'
    },
    {
      nombre: 'Milo',
      tipo: 'Gato',
      edad: '1 anio',
      tamano: 'Pequenio',
      salud: 'Esterilizado',
      refugio: 'Refugio Patitas',
      imagen: '/images/cat-milo.svg'
    },
    {
      nombre: 'Max',
      tipo: 'Perro',
      edad: '4 anios',
      tamano: 'Grande',
      salud: 'En tratamiento',
      refugio: 'Refugio Esperanza Animal',
      imagen: '/images/dog-max.svg'
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.route.data.subscribe((data) => {
      this.section = data['section'] as string;
      this.loadSectionData();
    });
  }

  protected get shelterNames(): string[] {
    return this.shelters.map((shelter) => shelter.nombre);
  }

  protected get filteredPets(): Pet[] {
    return this.pets.filter((pet) => {
      const byType = this.filtroTipo ? pet.tipo === this.filtroTipo : true;
      const bySize = this.filtroTamano ? pet.tamano === this.filtroTamano : true;
      return byType && bySize;
    });
  }

  private loadSectionData(): void {
    this.rawResponse = '';
    this.formMessage = '';

    if (this.section === 'refugios') {
      this.loadRefugios();
    }

    if (this.section === 'animales') {
      this.loadMascotas();
    }

    if (this.section === 'mascotas') {
      this.loadRazas(false);
      this.loadMascotas();
    }

    if (this.section === 'roles') {
      this.loadRoles();
    }

    if (this.section === 'permisos') {
      this.loadPermisos();
    }

    if (this.section === 'usuarios') {
      this.loadRoles(false);
      this.loadRefugios(false);
      this.loadUsuarios();
    }

    if (this.section === 'trabajadores') {
      this.loadRefugios(false);
      this.loadTrabajadores();
    }

    if (this.section === 'especies') {
      this.loadEspecies();
    }

    if (this.section === 'razas') {
      this.loadEspecies(false);
      this.loadRazas();
    }
  }

  private loadRefugios(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.apiMessage = '';

    const session = this.api.getSession();
    const canListAll = session?.permisos?.some((permiso) => permiso.toLowerCase() === 'refugios:obtener') ?? false;

    if (!canListAll && session?.id_ref) {
      this.api.getRefugioById(session.id_ref).subscribe({
        next: (refugio) => {
          this.refugios = [refugio];
          this.shelters = [{ nombre: refugio.nom_ref, zona: refugio.direc_ref, contacto: refugio.telef_ref, estado: refugio.estado_ref ? 'Activo' : 'Inactivo' }];
          this.donationRefugio = refugio.nom_ref;
          if (showLoading) this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: { error?: { message?: string } }) => {
          this.apiMessage = this.backendError(error, 'No se pudo cargar tu refugio.');
          if (showLoading) this.loading = false;
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.api.getRefugios().subscribe({
      next: (refugios) => {
        this.refugios = refugios;
        this.shelters = refugios.map((refugio) => ({
          nombre: refugio.nom_ref,
          zona: refugio.direc_ref,
          contacto: refugio.telef_ref,
          estado: refugio.estado_ref ? 'Activo' : 'Inactivo'
        }));
        this.donationRefugio = this.shelters[0]?.nombre ?? this.donationRefugio;
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar refugios desde el backend.');
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadMascotas(): void {
    this.loading = true;
    this.apiMessage = '';

    this.api.getMascotas().subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas;
        this.pets = mascotas.map((mascota) => this.mapMascota(mascota));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar mascotas desde el backend.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRoles(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.apiMessage = '';

    this.fetchProtected<BackendRole[]>('/roles')
      .then((roles) => {
        this.roles = roles;
      })
      .catch((error: Error) => {
        this.apiMessage = error.message;
      })
      .finally(() => {
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      });
  }

  private loadPermisos(): void {
    this.loading = true;
    this.apiMessage = '';

    this.fetchProtected<BackendPermiso[]>('/permisos')
      .then((permisos) => {
        this.permisos = permisos;
      })
      .catch((error: Error) => {
        this.apiMessage = error.message;
      })
      .finally(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  protected reloadCurrentSection(): void {
    this.loadSectionData();
  }

  private async fetchProtected<T>(path: string): Promise<T> {
    const token = this.api.getToken();
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const text = await response.text();
    this.rawResponse = text || '(respuesta vacia)';

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${this.extractBackendMessage(text)}`);
    }

    return JSON.parse(text) as T;
  }

  private extractBackendMessage(text: string): string {
    try {
      return (JSON.parse(text) as { message?: string }).message ?? text;
    } catch {
      return text || 'Error sin mensaje del backend';
    }
  }

  private loadUsuarios(): void {
    this.loading = true;
    this.apiMessage = '';

    this.api.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar usuarios desde el backend.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadTrabajadores(): void {
    this.loading = true;
    this.apiMessage = '';

    this.api.getMisTrabajadores().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar trabajadores desde el backend.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadEspecies(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.apiMessage = '';

    this.api.getEspecies().subscribe({
      next: (especies) => {
        this.especies = especies;
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar especies desde el backend.');
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRazas(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.apiMessage = '';

    this.api.getRazas().subscribe({
      next: (razas) => {
        this.razas = razas;
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = this.backendError(error, 'No se pudieron cargar razas desde el backend.');
        if (showLoading) this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected submitRole(): void {
    const request = this.roleEditId
      ? this.api.updateRole(this.roleEditId, this.roleForm)
      : this.api.createRole(this.roleForm);

    request.subscribe({
      next: () => this.afterCrud('Rol guardado correctamente.', () => this.cancelRole(), () => this.loadRoles(false)),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editRole(role: BackendRole): void {
    this.roleEditId = role.id_rol;
    this.roleForm = { codigo: role.codigo, nom_rol: role.nom_rol, descrip_rol: role.descrip_rol };
  }

  protected cancelRole(): void {
    this.roleEditId = null;
    this.roleForm = { codigo: '', nom_rol: '', descrip_rol: '' };
  }

  protected deleteRole(id: number): void {
    this.api.deleteRole(id).subscribe({
      next: () => this.afterCrud('Rol eliminado correctamente.', () => this.cancelRole(), () => this.loadRoles(false)),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitPermiso(): void {
    const request = this.permisoEditId
      ? this.api.updatePermiso(this.permisoEditId, this.permisoForm)
      : this.api.createPermiso(this.permisoForm);

    request.subscribe({
      next: () => this.afterCrud('Permiso guardado correctamente.', () => this.cancelPermiso(), () => this.loadPermisos()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editPermiso(permiso: BackendPermiso): void {
    this.permisoEditId = permiso.id_per;
    this.permisoForm = { codigo: permiso.codigo, nombre: permiso.nombre };
  }

  protected cancelPermiso(): void {
    this.permisoEditId = null;
    this.permisoForm = { codigo: '', nombre: '' };
  }

  protected deletePermiso(id: number): void {
    this.api.deletePermiso(id).subscribe({
      next: () => this.afterCrud('Permiso eliminado correctamente.', () => this.cancelPermiso(), () => this.loadPermisos()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitUsuario(): void {
    if (this.section === 'trabajadores') {
      this.submitTrabajador();
      return;
    }

    const payload: Record<string, unknown> = { ...this.usuarioForm };
    if (!payload['id_ref']) payload['id_ref'] = null;
    if (this.usuarioEditId && !payload['pass_usu']) delete payload['pass_usu'];

    const request = this.usuarioEditId
      ? this.api.updateUsuario(this.usuarioEditId, payload)
      : this.api.createUsuario(payload);

    request.subscribe({
      next: () => this.afterCrud('Usuario guardado correctamente.', () => this.cancelUsuario(), () => this.loadUsuarios()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editUsuario(usuario: BackendUsuario): void {
    this.usuarioEditId = usuario.id_usu;
    this.usuarioForm = {
      nom_usu: usuario.nom_usu,
      apell_usu: usuario.apell_usu,
      fecnac_usu: '',
      numcel_usu: usuario.numcel_usu,
      email_usu: usuario.email_usu,
      pass_usu: '',
      id_rol: usuario.id_rol,
      id_ref: usuario.refugio?.id_ref ?? null
    };
  }

  protected cancelUsuario(): void {
    this.usuarioEditId = null;
    this.usuarioForm = { nom_usu: '', apell_usu: '', fecnac_usu: '', numcel_usu: '', email_usu: '', pass_usu: '', id_rol: 0, id_ref: null };
  }

  protected deleteUsuario(id: number): void {
    this.api.deleteUsuario(id).subscribe({
      next: () => this.afterCrud('Usuario eliminado correctamente.', () => this.cancelUsuario(), () => this.loadUsuarios()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitTrabajador(): void {
    const session = this.api.getSession();
    const idRef = this.usuarioForm.id_ref ?? session?.id_ref;

    if (!idRef) {
      this.formMessage = 'No se pudo identificar el refugio del administrador.';
      return;
    }

    this.api.registerWorker({
      nom_usu: this.usuarioForm.nom_usu,
      apell_usu: this.usuarioForm.apell_usu,
      email_usu: this.usuarioForm.email_usu,
      pass_usu: this.usuarioForm.pass_usu,
      numcel_usu: this.usuarioForm.numcel_usu,
      fecnac_usu: this.usuarioForm.fecnac_usu,
      id_ref: idRef
    }).subscribe({
      next: () => this.afterCrud('Trabajador creado correctamente.', () => this.cancelUsuario(), () => this.loadTrabajadores()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitMascota(): void {
    const request = this.mascotaEditId
      ? this.api.updateMascota(this.mascotaEditId, this.mascotaForm)
      : this.api.createMascota(this.mascotaForm);

    request.subscribe({
      next: () => this.afterCrud('Mascota guardada correctamente.', () => this.cancelMascota(), () => this.loadMascotas()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editMascota(mascota: BackendMascota): void {
    this.mascotaEditId = mascota.id_ani;
    this.mascotaForm = {
      nom_mascot: mascota.nom_mascot,
      fechanac_mascot: String(mascota.fechanac_mascot).slice(0, 10),
      esteril_mascot: mascota.esteril_mascot,
      sexo_mascot: mascota.sexo_mascot,
      caract_mascot: mascota.caract_mascot,
      id_raza: mascota.id_raza
    };
  }

  protected cancelMascota(): void {
    this.mascotaEditId = null;
    this.mascotaForm = { nom_mascot: '', fechanac_mascot: '', esteril_mascot: false, sexo_mascot: 'Macho', caract_mascot: '', id_raza: 0 };
  }

  protected deleteMascota(id: number): void {
    this.api.deleteMascota(id).subscribe({
      next: () => this.afterCrud('Mascota eliminada correctamente.', () => this.cancelMascota(), () => this.loadMascotas()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitRefugio(): void {
    const request = this.refugioEditId
      ? this.api.updateRefugio(this.refugioEditId, this.refugioForm)
      : this.api.createRefugio(this.refugioForm);

    request.subscribe({
      next: () => this.afterCrud('Refugio guardado correctamente.', () => this.cancelRefugio(), () => this.loadRefugios()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editRefugio(refugio: BackendRefugio): void {
    this.refugioEditId = refugio.id_ref;
    this.refugioForm = { nom_ref: refugio.nom_ref, direc_ref: refugio.direc_ref, telef_ref: refugio.telef_ref, email_ref: refugio.email_ref, estado_ref: refugio.estado_ref };
  }

  protected cancelRefugio(): void {
    this.refugioEditId = null;
    this.refugioForm = { nom_ref: '', direc_ref: '', telef_ref: '', email_ref: '', estado_ref: true };
  }

  protected deleteRefugio(id: number): void {
    this.api.deleteRefugio(id).subscribe({
      next: () => this.afterCrud('Refugio eliminado correctamente.', () => this.cancelRefugio(), () => this.loadRefugios()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitEspecie(): void {
    const request = this.especieEditId
      ? this.api.updateEspecie(this.especieEditId, this.especieForm)
      : this.api.createEspecie(this.especieForm);

    request.subscribe({
      next: () => this.afterCrud('Especie guardada correctamente.', () => this.cancelEspecie(), () => this.loadEspecies()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editEspecie(especie: BackendEspecie): void {
    this.especieEditId = especie.id_esp;
    this.especieForm = { nom_esp: especie.nom_esp };
  }

  protected cancelEspecie(): void {
    this.especieEditId = null;
    this.especieForm = { nom_esp: '' };
  }

  protected deleteEspecie(id: number): void {
    this.api.deleteEspecie(id).subscribe({
      next: () => this.afterCrud('Especie eliminada correctamente.', () => this.cancelEspecie(), () => this.loadEspecies()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected submitRaza(): void {
    const request = this.razaEditId
      ? this.api.updateRaza(this.razaEditId, this.razaForm)
      : this.api.createRaza(this.razaForm);

    request.subscribe({
      next: () => this.afterCrud('Raza guardada correctamente.', () => this.cancelRaza(), () => this.loadRazas()),
      error: (error) => this.showCrudError(error)
    });
  }

  protected editRaza(raza: BackendRaza): void {
    this.razaEditId = raza.id_raza;
    this.razaForm = { nom_raza: raza.nom_raza, id_esp: raza.id_esp };
  }

  protected cancelRaza(): void {
    this.razaEditId = null;
    this.razaForm = { nom_raza: '', id_esp: 0 };
  }

  protected deleteRaza(id: number): void {
    this.api.deleteRaza(id).subscribe({
      next: () => this.afterCrud('Raza eliminada correctamente.', () => this.cancelRaza(), () => this.loadRazas()),
      error: (error) => this.showCrudError(error)
    });
  }

  private afterCrud(message: string, reset: () => void, reload: () => void): void {
    this.formMessage = message;
    reset();
    reload();
    this.cdr.detectChanges();
  }

  private showCrudError(error: { status?: number; error?: { message?: string }; message?: string }): void {
    this.formMessage = this.backendError(error, 'No se pudo completar la operacion.');
    this.cdr.detectChanges();
  }

  protected get tokenPreview(): string {
    const token = this.api.getToken();
    return token ? `${token.slice(0, 22)}...${token.slice(-10)}` : 'No hay token guardado';
  }

  private backendError(error: { status?: number; error?: { message?: string }; message?: string }, fallback: string): string {
    const status = error.status ?? 'sin status';
    const message = error.error?.message ?? error.message ?? fallback;
    return `HTTP ${status}: ${message}`;
  }

  private mapMascota(mascota: BackendMascota): Pet {
    const tipo = mascota.raza?.especie?.nom_esp ?? 'Sin especie';
    const imagen = tipo.toLowerCase().includes('gato') ? '/images/cat-milo.svg' : '/images/dog-luna.svg';

    return {
      nombre: mascota.nom_mascot,
      tipo,
      edad: this.formatAge(mascota.fechanac_mascot),
      tamano: 'Sin dato',
      salud: mascota.esteril_mascot ? 'Esterilizado' : 'No esterilizado',
      refugio: 'Sin refugio asignado',
      imagen
    };
  }

  private formatAge(dateValue: string): string {
    const birthDate = new Date(dateValue);
    if (Number.isNaN(birthDate.getTime())) return 'Edad no registrada';

    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    return years > 0 ? `${years} anios` : 'Menos de 1 anio';
  }

  protected openPetDetail(pet: Pet): void {
    this.selectedPet = pet;
    this.showPetModal = true;
    this.adoptionOk = '';
  }

  protected startAdoption(pet: Pet): void {
    this.selectedPet = pet;
    this.showAdoptionModal = true;
    this.showPetModal = false;
    this.adoptionOk = '';
  }

  protected closeModals(): void {
    this.showPetModal = false;
    this.showAdoptionModal = false;
  }

  protected submitAdoption(): void {
    if (!this.selectedPet) return;

    const now = new Date();
    const req: AdoptionRequest = {
      id: crypto.randomUUID(),
      mascota: this.selectedPet.nombre,
      refugio: this.selectedPet.refugio,
      solicitante: this.solicitante.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      fecha: now.toISOString().slice(0, 10),
      estado: 'En evaluacion'
    };

    const list = this.getAdoptions();
    list.unshift(req);
    localStorage.setItem('adoptions', JSON.stringify(list));

    this.adoptionOk = 'Solicitud enviada. Puedes verla en la seccion Adopciones.';
    this.solicitante = '';
    this.telefono = '';
    this.direccion = '';
    this.showAdoptionModal = false;
  }

  protected getAdoptions(): AdoptionRequest[] {
    try {
      return (JSON.parse(localStorage.getItem('adoptions') ?? '[]') as AdoptionRequest[]) ?? [];
    } catch {
      return [];
    }
  }

  protected setAdoptionStatus(id: string, estado: AdoptionRequest['estado']): void {
    const list = this.getAdoptions().map((a) => (a.id === id ? { ...a, estado } : a));
    localStorage.setItem('adoptions', JSON.stringify(list));
  }

  protected getDonations(): Donation[] {
    try {
      return (JSON.parse(localStorage.getItem('donations') ?? '[]') as Donation[]) ?? [];
    } catch {
      return [];
    }
  }

  protected submitDonation(): void {
    const now = new Date();
    const d: Donation = {
      id: crypto.randomUUID(),
      donante: this.donationDonante.trim() || 'Anonimo',
      tipo: this.donationTipo,
      detalle: this.donationDetalle.trim() || (this.donationTipo === 'Economica' ? 'Bs 0' : 'Sin detalle'),
      refugio: this.donationRefugio,
      fecha: now.toISOString().slice(0, 10)
    };

    const list = this.getDonations();
    list.unshift(d);
    localStorage.setItem('donations', JSON.stringify(list));

    this.donationOk = 'Gracias por tu apoyo. Donacion registrada.';
    this.donationDetalle = '';
    this.donationDonante = '';
  }
}

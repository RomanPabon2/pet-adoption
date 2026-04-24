import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

type Pet = {
  nombre: string;
  tipo: string;
  edad: string;
  tamano: string;
  salud: string;
  refugio: string;
  imagen: string;
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

  protected readonly pets: Pet[] = [
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

  constructor(private readonly route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      this.section = data['section'] as string;
    });
  }

  protected get filteredPets(): Pet[] {
    return this.pets.filter((pet) => {
      const byType = this.filtroTipo ? pet.tipo === this.filtroTipo : true;
      const bySize = this.filtroTamano ? pet.tamano === this.filtroTamano : true;
      return byType && bySize;
    });
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

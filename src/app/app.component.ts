import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AcademicService, Asignatura } from './app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  asignaturaForm: FormGroup;
  asignaturas: Asignatura[] = [];
  promedio: number = 0;
  clasificacion: string = 'N/A';
  notaAlta: Asignatura | null = null;
  notaBaja: Asignatura | null = null;
  
  editingId: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private academicService: AcademicService) {
    this.asignaturaForm = this.fb.group({
      nombre: ['', Validators.required],
      nota: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      creditos: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.academicService.getUserProfile().subscribe({
      next: (res) => {
        this.updateState(res);
        this.isLoading = false;
      },
      error: (err) => this.handleError('Error al conectar con MongoDB/Backend. Revisa que el servidor Node esté corriendo.', err)
    });
  }

  onSubmit(): void {
    if (this.asignaturaForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const asignaturaData: Asignatura = this.asignaturaForm.value;

    if (this.editingId) {
      this.academicService.updateAsignatura(this.editingId, asignaturaData).subscribe({
        next: (res) => {
          this.updateState(res);
          this.cancelEdit();
        },
        error: (err) => this.handleError('Error al actualizar la asignatura en la base de datos.', err)
      });
    } else {
      this.academicService.addAsignatura(asignaturaData).subscribe({
        next: (res) => {
          this.updateState(res);
          this.asignaturaForm.reset();
          this.isLoading = false;
        },
        error: (err) => this.handleError('Error al guardar. El registro no se persistió en MongoDB.', err)
      });
    }
  }

  editAsignatura(asig: Asignatura): void {
    if (!asig._id) return;
    this.editingId = asig._id;
    this.asignaturaForm.patchValue({
      nombre: asig.nombre,
      nota: asig.nota,
      creditos: asig.creditos
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.asignaturaForm.reset();
    this.isLoading = false;
  }

  deleteAsignatura(id?: string): void {
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignatura permanentemente?')) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.academicService.deleteAsignatura(id).subscribe({
      next: (res) => {
        this.updateState(res);
        this.isLoading = false;
      },
      error: (err) => this.handleError('Error al eliminar el registro en la base de datos.', err)
    });
  }

  private updateState(res: any): void {
    this.asignaturas = res.asignaturas || res.user?.asignaturas || [];
    this.promedio = res.stats.promedio;
    this.clasificacion = res.stats.clasificacion;
    this.notaAlta = res.stats.notaAlta;
    this.notaBaja = res.stats.notaBaja;
  }

  private handleError(msg: string, err: any): void {
    console.error(msg, err);
    this.errorMessage = msg;
    this.isLoading = false;
  }
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDesignModule } from '@material/material-design.module';
import { TranslateModule } from '@ngx-translate/core';
import { SgiAuthModule } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ProyectoRoutingModule } from './proyecto-routing.module';
import { ProyectoListadoComponent } from './proyecto-listado/proyecto-listado.component';
import { ProyectoCrearComponent } from './proyecto-crear/proyecto-crear.component';
import { ProyectoEditarComponent } from './proyecto-editar/proyecto-editar.component';
import { ProyectoFichaGeneralComponent } from './proyecto-formulario/proyecto-datos-generales/proyecto-ficha-general.component';
import { ProyectoResolver } from './proyecto.resolver';
import { ProyectoEntidadesFinanciadorasComponent } from './proyecto-formulario/proyecto-entidades-financiadoras/proyecto-entidades-financiadoras.component';
import { CspModalsModule } from '../modals/csp-modals.module';
import { ProyectoHitosComponent } from './proyecto-formulario/proyecto-hitos/proyecto-hitos.component';
import { ProyectoHitosModalComponent } from './modals/proyecto-hitos-modal/proyecto-hitos-modal.component';
import { ProyectoSociosComponent } from './proyecto-formulario/proyecto-socios/proyecto-socios.component';
import { ProyectoEntidadesConvocantesComponent } from './proyecto-formulario/proyecto-entidades-convocantes/proyecto-entidades-convocantes.component';
import { ProyectoEntidadConvocantePlanPipe } from './pipes/proyecto-entidad-convocante-plan.pipe';
import { ProyectoEntidadConvocanteModalComponent } from './modals/proyecto-entidad-convocante-modal/proyecto-entidad-convocante-modal.component';
import { ProyectoPaqueteTrabajoComponent } from './proyecto-formulario/proyecto-paquete-trabajo/proyecto-paquete-trabajo.component';
import { ProyectoPaquetesTrabajoModalComponent } from './modals/proyecto-paquetes-trabajo-modal/proyecto-paquetes-trabajo-modal.component';
import { ProyectoPlazosComponent } from './proyecto-formulario/proyecto-plazos/proyecto-plazos.component';
import { ProyectoPlazosModalComponent } from './modals/proyecto-plazos-modal/proyecto-plazos-modal.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ProyectoContextoComponent } from './proyecto-formulario/proyecto-contexto/proyecto-contexto.component';
import { ProyectoContextoModalComponent } from './modals/proyecto-contexto-modal/proyecto-contexto-modal.component';
import { ProyectoPeriodoSeguimientosComponent } from './proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.component';
import { ProyectoEntidadGestoraComponent } from './proyecto-formulario/proyecto-entidad-gestora/proyecto-entidad-gestora.component';
import { ProyectoEquipoComponent } from './proyecto-formulario/proyecto-equipo/proyecto-equipo.component';
import { ProyectoEquipoModalComponent } from './modals/proyecto-equipo-modal/proyecto-equipo-modal.component';
import { ProyectoProrrogasComponent } from './proyecto-formulario/proyecto-prorrogas/proyecto-prorrogas.component';
import { ProyectoHistoricoEstadosComponent } from './proyecto-formulario/proyecto-historico-estados/proyecto-historico-estados.component';
import { ProyectoDocumentosComponent } from './proyecto-formulario/proyecto-documentos/proyecto-documentos.component';

@NgModule({
  declarations: [
    ProyectoListadoComponent,
    ProyectoCrearComponent,
    ProyectoEditarComponent,
    ProyectoFichaGeneralComponent,
    ProyectoEntidadesFinanciadorasComponent,
    ProyectoHitosComponent,
    ProyectoHitosModalComponent,
    ProyectoSociosComponent,
    ProyectoEntidadesConvocantesComponent,
    ProyectoEntidadConvocantePlanPipe,
    ProyectoEntidadConvocanteModalComponent,
    ProyectoPaqueteTrabajoComponent,
    ProyectoPaquetesTrabajoModalComponent,
    ProyectoPlazosComponent,
    ProyectoPlazosModalComponent,
    ProyectoContextoComponent,
    ProyectoContextoModalComponent,
    ProyectoPeriodoSeguimientosComponent,
    ProyectoEntidadGestoraComponent,
    ProyectoEquipoComponent,
    ProyectoEquipoModalComponent,
    ProyectoProrrogasComponent,
    ProyectoHistoricoEstadosComponent,
    ProyectoDocumentosComponent],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    MaterialDesignModule,
    ProyectoRoutingModule,
    SgiAuthModule,
    FormsModule,
    ReactiveFormsModule,
    CspModalsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
  ],
  providers: [
    ProyectoResolver,
    ProyectoEntidadConvocantePlanPipe
  ]
})
export class ProyectoModule { }

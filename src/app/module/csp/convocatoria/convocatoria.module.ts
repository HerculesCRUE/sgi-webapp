import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvocatoriaListadoComponent } from './convocatoria-listado/convocatoria-listado.component';
import { ConvocatoriaRoutingModule } from './convocatoria-routing.module';
import { SharedModule } from '@shared/shared.module';
import { MaterialDesignModule } from '@material/material-design.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConvocatoriaCrearComponent } from './convocatoria-crear/convocatoria-crear.component';
import { ConvocatoriaResolver } from './convocatoria.resolver';
import { ModeloEjecucionIdResolver } from './modelo-ejecucion-id.resolver';
import { ConvocatoriaDatosGeneralesComponent } from './convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.component';
import { ConvocatoriaEditarComponent } from './convocatoria-editar/convocatoria-editar.component';
import { ConvocatoriaPlazosFasesComponent } from './convocatoria-formulario/convocatoria-plazos-fases/convocatoria-plazos-fases.component';
import { ConvocatoriaHitosComponent } from './convocatoria-formulario/convocatoria-hitos/convocatoria-hitos.component';
import { ConvocatoriaEntidadesConvocantesComponent } from './convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.component';
import { ConvocatoriaSeguimientoCientificoComponent } from './convocatoria-formulario/convocatoria-seguimiento-cientifico/convocatoria-seguimiento-cientifico.component';
import { ConvocatoriaEnlaceComponent } from './convocatoria-formulario/convocatoria-enlace/convocatoria-enlace.component';
import { ConvocatoriaEntidadesFinanciadorasComponent } from './convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.component';
import { ConvocatoriaPeriodosJustificacionComponent } from './convocatoria-formulario/convocatoria-periodos-justificacion/convocatoria-periodos-justificacion.component';
import { ConvocatoriaHitosModalComponent } from './modals/convocatoria-hitos-modal/convocatoria-hitos-modal.component';
import { ConvocatoriaPeriodosJustificacionModalComponent } from './modals/convocatoria-periodos-justificacion-modal/convocatoria-periodos-justificacion-modal.component';
import { ConvocatoriaEnlaceModalComponent } from './modals/convocatoria-enlace-modal/convocatoria-enlace-modal.component';
import { ConvocatoriaEntidadConvocanteModalComponent } from './modals/convocatoria-entidad-convocante-modal/convocatoria-entidad-convocante-modal.component';
import { ConvocatoriaPlazosFaseModalComponent } from './modals/convocatoria-plazos-fase-modal/convocatoria-plazos-fase-modal.component';
import { ConvocatoriaSeguimientoCientificoModalComponent } from './modals/convocatoria-seguimiento-cientifico-modal/convocatoria-seguimiento-cientifico-modal.component';
import { ConvocatoriaAreaTematicaModalComponent } from './modals/convocatoria-area-tematica-modal/convocatoria-area-tematica-modal.component';
import { ConvocatoriaRequisitosIPComponent } from './convocatoria-formulario/convocatoria-requisitos-ip/convocatoria-requisitos-ip.component';
import { ConvocatoriaConceptoGastoComponent } from './convocatoria-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.component';
import { ConvocatoriaRequisitosEquipoComponent } from './convocatoria-formulario/convocatoria-requisitos-equipo/convocatoria-requisitos-equipo.component';
import { ConvocatoriaDocumentosComponent } from './convocatoria-formulario/convocatoria-documentos/convocatoria-documentos.component';
import { ConvocatoriaConfiguracionSolicitudesComponent } from './convocatoria-formulario/convocatoria-configuracion-solicitudes/convocatoria-configuracion-solicitudes.component';
import { ConvocatoriaConfiguracionSolicitudesModalComponent } from './modals/convocatoria-configuracion-solicitudes-modal/convocatoria-configuracion-solicitudes-modal.component';
import { ConfiguracionSolicitudResolver } from './configuracion-solicitud.resolver';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { SgiAuthModule } from '@sgi/framework/auth';
import { CspModalsModule } from '../modals/csp-modals.module';

@NgModule({
  declarations: [
    ConvocatoriaListadoComponent,
    ConvocatoriaCrearComponent,
    ConvocatoriaDatosGeneralesComponent,
    ConvocatoriaPeriodosJustificacionComponent,
    ConvocatoriaEditarComponent,
    ConvocatoriaPlazosFasesComponent,
    ConvocatoriaHitosComponent,
    ConvocatoriaEntidadesConvocantesComponent,
    ConvocatoriaSeguimientoCientificoComponent,
    ConvocatoriaEntidadesFinanciadorasComponent,
    ConvocatoriaEnlaceComponent,
    ConvocatoriaHitosModalComponent,
    ConvocatoriaPeriodosJustificacionModalComponent,
    ConvocatoriaEnlaceModalComponent,
    ConvocatoriaEntidadConvocanteModalComponent,
    ConvocatoriaPlazosFaseModalComponent,
    ConvocatoriaSeguimientoCientificoModalComponent,
    ConvocatoriaAreaTematicaModalComponent,
    ConvocatoriaRequisitosIPComponent,
    ConvocatoriaConceptoGastoComponent,
    ConvocatoriaRequisitosEquipoComponent,
    ConvocatoriaDocumentosComponent,
    ConvocatoriaConfiguracionSolicitudesComponent,
    ConvocatoriaConfiguracionSolicitudesModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ConvocatoriaRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    SgiAuthModule,
    CspModalsModule
  ],
  providers: [
    ConvocatoriaResolver,
    ConfiguracionSolicitudResolver,
    ModeloEjecucionIdResolver
  ]
})
export class ConvocatoriaModule { }

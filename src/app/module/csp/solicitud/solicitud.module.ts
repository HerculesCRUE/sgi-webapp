import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudCrearComponent } from './solicitud-crear/solicitud-crear.component';
import { SolicitudEditarComponent } from './solicitud-editar/solicitud-editar.component';
import { SolicitudListadoComponent } from './solicitud-listado/solicitud-listado.component';
import { SolicitudDatosGeneralesComponent } from './solicitud-formulario/solicitud-datos-generales/solicitud-datos-generales.component';
import { SharedModule } from '@shared/shared.module';
import { SolicitudRoutingModule } from './solicitud-routing.module';
import { MaterialDesignModule } from '@material/material-design.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SolicitudResolver } from './solicitud.resolver';
import { SolicitudModalidadEntidadConvocanteModalComponent } from './modals/solicitud-modalidad-entidad-convocante-modal/solicitud-modalidad-entidad-convocante-modal.component';
import { SolicitudHitosComponent } from './solicitud-formulario/solicitud-hitos/solicitud-hitos.component';
import { SolicitiudHitosModalComponent } from './modals/solicitud-hitos-modal/solicitud-hitos-modal.component';
import { SolicitudHistoricoEstadosComponent } from './solicitud-formulario/solicitud-historico-estados/solicitud-historico-estados.component';
import { SolicitudDocumentosComponent } from './solicitud-formulario/solicitud-documentos/solicitud-documentos.component';
import { SolicitudProyectoFichaGeneralComponent } from './solicitud-formulario/solicitud-proyecto-ficha-general/solicitud-proyecto-ficha-general.component';
import { SolicitudAreaTematicaModalComponent } from './modals/solicitud-area-tematica-modal/solicitud-area-tematica-modal.component';
import { SolicitudEquipoProyectoComponent } from './solicitud-formulario/solicitud-equipo-proyecto/solicitud-equipo-proyecto.component';
import { SolicitudEquipoProyectoModalComponent } from './modals/solicitud-equipo-proyecto-modal/solicitud-equipo-proyecto-modal.component';
import { SolicitudSociosColaboradoresComponent } from './solicitud-formulario/solicitud-socios-colaboradores/solicitud-socios-colaboradores.component';
import { SolicitudProyectoEntidadesFinanciadorasComponent } from './solicitud-formulario/solicitud-proyecto-entidades-financiadoras/solicitud-proyecto-entidades-financiadoras.component';
import { SolicitudProyectoPresupuestoGlobalComponent } from './solicitud-formulario/solicitud-proyecto-presupuesto-global/solicitud-proyecto-presupuesto-global.component';
import { SolicitudProyectoPresupuestoEntidadesComponent } from './solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';
import { SolicitudCrearProyectoModalComponent } from './modals/solicitud-crear-proyecto-modal/solicitud-crear-proyecto-modal.component';
import { CambioEstadoModalComponent } from './modals/cambio-estado-modal/cambio-estado-modal.component';

@NgModule({
  declarations: [
    SolicitudCrearComponent,
    SolicitudEditarComponent,
    SolicitudListadoComponent,
    SolicitudDatosGeneralesComponent,
    SolicitudModalidadEntidadConvocanteModalComponent,
    SolicitudHistoricoEstadosComponent,
    SolicitudDocumentosComponent,
    SolicitiudHitosModalComponent,
    SolicitudHitosComponent,
    SolicitudProyectoFichaGeneralComponent,
    SolicitudAreaTematicaModalComponent,
    SolicitudEquipoProyectoComponent,
    SolicitudEquipoProyectoModalComponent,
    SolicitudSociosColaboradoresComponent,
    SolicitudProyectoEntidadesFinanciadorasComponent,
    SolicitudProyectoPresupuestoGlobalComponent,
    SolicitudProyectoPresupuestoEntidadesComponent,
    SolicitudCrearProyectoModalComponent,
    CambioEstadoModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SolicitudRoutingModule,
    MaterialDesignModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule
  ],
  providers: [
    SolicitudResolver
  ]
})
export class SolicitudModule { }

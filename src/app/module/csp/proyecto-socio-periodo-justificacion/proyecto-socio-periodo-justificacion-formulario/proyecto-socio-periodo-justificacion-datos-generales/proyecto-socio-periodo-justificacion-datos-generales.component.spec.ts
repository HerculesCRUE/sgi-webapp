import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioPeriodoJustificacionDatosGeneralesComponent } from './proyecto-socio-periodo-justificacion-datos-generales.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { ProyectoSocioPeriodoJustificacionActionService } from '../../proyecto-socio-periodo-justificacion.action.service';
import { IProyectoSocioPeriodoJustificacionState } from '../../../proyecto-socio/proyecto-socio-formulario/proyecto-socio-periodo-justificacion/proyecto-socio-periodo-justificacion.component';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';

// TODO: Uncoment when issue https://github.com/h2qutc/angular-material-components/issues/170 is fixed

// describe('ProyectoSocioPeriodoJustificacionDatosGeneralesComponent', () => {
//   let component: ProyectoSocioPeriodoJustificacionDatosGeneralesComponent;
//   let fixture: ComponentFixture<ProyectoSocioPeriodoJustificacionDatosGeneralesComponent>;

//   const proyectoSocio: IProyectoSocio = {
//     empresa: undefined,
//     fechaFin: undefined,
//     fechaInicio: undefined,
//     id: undefined,
//     importeConcedido: undefined,
//     numInvestigadores: undefined,
//     proyecto: undefined,
//     rolSocio: undefined
//   };

//   const periodoJustificacion: IProyectoSocioPeriodoJustificacion = {
//     documentacionRecibida: undefined,
//     fechaFin: undefined,
//     fechaFinPresentacion: undefined,
//     fechaInicio: undefined,
//     fechaInicioPresentacion: undefined,
//     fechaRecepcion: undefined,
//     id: undefined,
//     numPeriodo: undefined,
//     observaciones: undefined,
//     proyectoSocio
//   };

//   const state: IProyectoSocioPeriodoJustificacionState = {
//     periodoJustificacion,
//     selectedPeriodosJustificacion: [],
//     proyectoId: 1,
//     proyectoSocio,
//     urlProyecto: '',
//     urlProyectoSocio: ''
//   };

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [ProyectoSocioPeriodoJustificacionDatosGeneralesComponent],
//       imports: [
//         TestUtils.getIdiomas(),
//         MaterialDesignModule,
//         BrowserAnimationsModule,
//         HttpClientTestingModule,
//         LoggerTestingModule,
//         FlexModule,
//         FormsModule,
//         ReactiveFormsModule,
//         RouterTestingModule,
//         SharedModule,
//         NgxMatDatetimePickerModule,
//         NgxMatTimepickerModule,
//         NgxMatNativeDateModule
//       ],
//       providers: [
//         ProyectoSocioPeriodoJustificacionActionService,
//       ],
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     spyOnProperty(history, 'state', 'get').and.returnValue(state);
//     fixture = TestBed.createComponent(ProyectoSocioPeriodoJustificacionDatosGeneralesComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

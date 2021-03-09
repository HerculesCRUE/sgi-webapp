import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SgiAuthService } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { ProyectoPeriodoSeguimientoDatosGeneralesComponent } from './proyecto-periodo-seguimiento-datos-generales.component';
import { ProyectoPeriodoSeguimientoActionService } from '../../proyecto-periodo-seguimiento.action.service';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoPeriodoSeguimientoState } from '../../../proyecto/proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

// TODO: Uncoment when issue https://github.com/h2qutc/angular-material-components/issues/170 is fixed

// describe('ProyectoPeriodoSeguimientoDatosGeneralesComponent', () => {
//   let component: ProyectoPeriodoSeguimientoDatosGeneralesComponent;
//   let fixture: ComponentFixture<ProyectoPeriodoSeguimientoDatosGeneralesComponent>;

//   const proyecto: IProyecto = {
//     id: 1,
//     fechaInicio: new Date(),
//     fechaFin: new Date()
//   } as IProyecto;

//   const proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento = {
//     id: 1,
//     proyecto,
//     fechaInicio: new Date(),
//     fechaFin: new Date(),
//     numPeriodo: 1
//   } as IProyectoPeriodoSeguimiento;

//   const selectedProyectoPeriodoSeguimientos: IProyectoPeriodoSeguimiento[] = [
//     proyectoPeriodoSeguimiento as IProyectoPeriodoSeguimiento]

//   const state: IProyectoPeriodoSeguimientoState = {
//     proyecto,
//     proyectoPeriodoSeguimiento,
//     selectedProyectoPeriodoSeguimientos,
//     readonly: true
//   };

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         ProyectoPeriodoSeguimientoDatosGeneralesComponent
//       ],
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
//         ProyectoPeriodoSeguimientoActionService,
//         SgiAuthService
//       ],
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     spyOnProperty(history, 'state', 'get').and.returnValue(state);

//     fixture = TestBed.createComponent(ProyectoPeriodoSeguimientoDatosGeneralesComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

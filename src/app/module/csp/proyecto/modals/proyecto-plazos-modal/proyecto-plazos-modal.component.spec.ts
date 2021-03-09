import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogComponent } from '@block/dialog/dialog.component';
import { HeaderComponent } from '@block/header/header.component';
import { IProyectoPlazos } from '@core/models/csp/proyecto-plazo';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ProyectoPlazosModalComponent } from './proyecto-plazos-modal.component';

// TODO: Uncoment when issue https://github.com/h2qutc/angular-material-components/issues/170 is fixed

// describe('ProyectoPlazosModalComponent', () => {
//   let component: ProyectoPlazosModalComponent;
//   let fixture: ComponentFixture<ProyectoPlazosModalComponent>;

//   beforeEach(waitForAsync(() => {

//     const mockDialogRef = {
//       close: jasmine.createSpy('close'),
//     };

//     // Mock MAT_DIALOG
//     const matDialogData = {} as IProyectoPlazos;

//     TestBed.configureTestingModule({
//       declarations: [
//         ProyectoPlazosModalComponent,
//         DialogComponent,
//         HeaderComponent],
//       imports: [
//         BrowserAnimationsModule,
//         MaterialDesignModule,
//         HttpClientTestingModule,
//         LoggerTestingModule,
//         TestUtils.getIdiomas(),
//         RouterTestingModule,
//         ReactiveFormsModule,
//         NgxMatDatetimePickerModule,
//         NgxMatTimepickerModule,
//         NgxMatNativeDateModule,
//         SgiAuthModule
//       ],
//       providers: [
//         { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
//         { provide: MatDialogRef, useValue: mockDialogRef },
//         { provide: MAT_DIALOG_DATA, useValue: matDialogData },
//         SgiAuthService
//       ]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ProyectoPlazosModalComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
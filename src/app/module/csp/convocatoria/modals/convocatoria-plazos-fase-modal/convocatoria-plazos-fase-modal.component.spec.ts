import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { ConvocatoriaPlazosFaseModalComponent } from './convocatoria-plazos-fase-modal.component';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { ActivatedRoute } from '@angular/router';

// TODO: Uncoment when issue https://github.com/h2qutc/angular-material-components/issues/170 is fixed

//describe('ConvocatoriaPlazosFaseModalComponent', () => {
//  let component: ConvocatoriaPlazosFaseModalComponent;
//  let fixture: ComponentFixture<ConvocatoriaPlazosFaseModalComponent>;

// beforeEach(waitForAsync(() => {

//    const snapshotData = {
//      plazos: [],
//      plazo: {
//        id: 1
//      } as IConvocatoriaFase,
//      idConvocatoria: 1
//    };

//    TestBed.configureTestingModule({
//      declarations: [ConvocatoriaPlazosFaseModalComponent],
//      imports: [
//        BrowserAnimationsModule,
//        MaterialDesignModule,
//        HttpClientTestingModule,
//        LoggerTestingModule,
//        TestUtils.getIdiomas(),
//        RouterTestingModule,
//        FormsModule,
//        ReactiveFormsModule,
//        NgxMatDatetimePickerModule,
//        NgxMatMomentModule,
//        SgiAuthModule
//      ],
//      providers: [
//        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
//        { provide: MatDialogRef, useValue: snapshotData },
//        { provide: MAT_DIALOG_DATA, useValue: snapshotData },
//        { provide: ActivatedRoute, useValue: { snapshot: { data: snapshotData } } },
//        SgiAuthService
//      ],
//    })
//      .compileComponents();
//  }));

//beforeEach(() => {
//  fixture = TestBed.createComponent(ConvocatoriaPlazosFaseModalComponent);
//  component = fixture.componentInstance;
//  fixture.detectChanges();
//});

//it('should create', () => {
//  expect(component).toBeTruthy();
//});
//});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import TestUtils from '@core/utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { SnackBarService } from '@core/services/snack-bar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogComponent } from '@block/dialog/dialog.component';
import { HeaderComponent } from '@block/header/header.component';
import { PartidaGastoModalComponent, PartidaGastoDataModal } from './partida-gasto-modal.component';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { IPartidaGasto } from '@core/models/csp/partida-gasto';


describe('PartidaGastoModalComponent', () => {
  let component: PartidaGastoModalComponent;
  let fixture: ComponentFixture<PartidaGastoModalComponent>;

  beforeEach(waitForAsync(() => {
    const mockDialogRef = {
      close: jasmine.createSpy('close'),
    };
    // Mock MAT_DIALOG
    const matDialogData = {
      partidaGasto: {
        conceptoGasto: {} as IConceptoGasto
      } as IPartidaGasto
    } as PartidaGastoDataModal;

    TestBed.configureTestingModule({
      declarations: [
        PartidaGastoModalComponent,
        DialogComponent,
        HeaderComponent],
      imports: [
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        ReactiveFormsModule,
        SgiAuthModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: matDialogData },
        SgiAuthService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidaGastoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

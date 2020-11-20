import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IDocumentacionMemoria } from '@core/models/eti/documentacion-memoria';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { MemoriaDocumentacionSeguimientosModalComponent } from './memoria-documentacion-seguimientos-modal.component';

describe('MemoriaDocumentacionSeguimientosModalComponent', () => {
  let component: MemoriaDocumentacionSeguimientosModalComponent;
  let fixture: ComponentFixture<MemoriaDocumentacionSeguimientosModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MemoriaDocumentacionSeguimientosModalComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: {} as IDocumentacionMemoria },
        { provide: MAT_DIALOG_DATA, useValue: {} as IDocumentacionMemoria },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoriaDocumentacionSeguimientosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

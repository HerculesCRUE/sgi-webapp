import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IApartado } from '@core/models/eti/apartado';
import { IComentario } from '@core/models/eti/comentario';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ComentarioEditarModalComponent } from './comentario-editar-modal.component';
import { TipoEvaluacion } from '@core/models/eti/tipo-evaluacion';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IComite } from '@core/models/eti/comite';
import { ActivatedRoute } from '@angular/router';

describe('ComentarioEditarModalComponent', () => {
  let component: ComentarioEditarModalComponent;
  let fixture: ComponentFixture<ComentarioEditarModalComponent>;

  const snapshotData = {
    comentario: {
      apartado: {
        id: 1
      } as IApartado,
    } as IComentario,
    evaluacion: {
      id: 1,
      tipoEvaluacion: {
        id: 1
      } as TipoEvaluacion
    } as IEvaluacion,
    memoria: {
      id: 1,
      comite: {
        id: 1
      } as IComite,
    }
  };

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ComentarioEditarModalComponent],
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
        { provide: MatDialogRef, useValue: snapshotData },
        { provide: MAT_DIALOG_DATA, useValue: snapshotData },
        { provide: ActivatedRoute, useValue: { snapshot: { data: snapshotData } } },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComentarioEditarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

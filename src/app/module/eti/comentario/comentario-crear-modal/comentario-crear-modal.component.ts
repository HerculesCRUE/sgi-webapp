import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IApartado } from '@core/models/eti/apartado';
import { IBloque } from '@core/models/eti/bloque';
import { IComentario } from '@core/models/eti/comentario';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { BloqueService } from '@core/services/eti/bloque.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { EvaluacionFormularioActionService } from '../../evaluacion-formulario/evaluacion-formulario.action.service';
import { ActionService } from '@core/services/action-service';
import { resolveFormularioByTipoEvaluacionAndComite } from '@core/models/eti/formulario';
import { FormularioService } from '@core/services/eti/formulario.service';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IsEntityValidator } from '@core/validators/is-entity-validador';

const MSG_ERROR_BLOQUE = marker('eti.comentario.crear.bloque.error.cargar');
const MSG_ERROR_APARTADO = marker('eti.comentario.crear.apartado.error.cargar');
const MSG_ERROR_SUBAPARTADO = marker('eti.comentario.crear.subapartado.error.cargar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');


@Component({
  templateUrl: './comentario-crear-modal.component.html',
  styleUrls: ['./comentario-crear-modal.component.scss'],
  providers: [
    {
      provide: ActionService,
      useExisting: EvaluacionFormularioActionService
    }
  ]
})
export class ComentarioCrearModalComponent implements OnInit, OnDestroy {

  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  bloques: IBloque[];
  apartados: IApartado[];
  subapartados: IApartado[];
  suscripciones: Subscription[];

  constructor(
    private readonly logger: NGXLogger,
    private readonly formularioService: FormularioService,
    private readonly bloqueService: BloqueService,
    private readonly apartadoService: ApartadoService,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ComentarioCrearModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IEvaluacion,
  ) {
    this.logger.debug(ComentarioCrearModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
    this.fxLayoutProperties.layoutAlign = 'space-around start';
    this.bloques = [];
    this.apartados = [];
    this.suscripciones = [];
    this.logger.debug(ComentarioCrearModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'ngOnInit()', 'start');
    this.suscripciones = [];
    this.formGroup = new FormGroup({
      bloque: new FormControl('', [IsEntityValidator.isValid()]),
      apartado: new FormControl('', [IsEntityValidator.isValid()]),
      subapartado: new FormControl('', []),
      comentario: new FormControl('', [])
    });
    this.initDatosApartados();
    this.loadBloquesComite();
    this.logger.debug(ComentarioCrearModalComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Reinicia los datos de los apartados cuando se cambia de bloque
   */
  private initDatosApartados(): void {
    this.apartados = [];
    this.subapartados = [];
    FormGroupUtil.setValue(this.formGroup, 'apartado', '');
    FormGroupUtil.setValue(this.formGroup, 'subapartado', '');
  }

  ngOnDestroy(): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ComentarioCrearModalComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Carga todos los bloques de la aplicación
   */
  private loadBloquesComite(): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'cargarBloques()', 'start');

    this.suscripciones.push(
      this.formularioService.getBloques(resolveFormularioByTipoEvaluacionAndComite(this.data.tipoEvaluacion, this.data.memoria.comite)).subscribe(
        (res: SgiRestListResult<IBloque>) => {
          this.bloques = res.items;
          this.logger.debug(ComentarioCrearModalComponent.name, 'cargarBloques()', 'end');
        },
        () => {
          this.closeModalError(MSG_ERROR_BLOQUE);
          this.logger.error(ComentarioCrearModalComponent.name, 'cargarBloques()', 'error');
        }
      )
    );
  }


  /**
   * Carga todos los apartados del bloque seleccionado
   */
  loadApartados(): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'cargarApartadosBloque()', 'start');
    this.initDatosApartados();
    const id = Number(FormGroupUtil.getValue(this.formGroup, 'bloque')?.id);
    if (id && !isNaN(id)) {
      this.suscripciones.push(
        this.bloqueService.getApartados(id).subscribe(
          (res: SgiRestListResult<IApartado>) => {
            this.apartados = res.items;
            this.logger.debug(ComentarioCrearModalComponent.name, 'cargarApartadosBloque()', 'end');
          },
          () => {
            this.logger.error(ComentarioCrearModalComponent.name, 'cargarApartadosBloque()', 'error');
            this.closeModalError(MSG_ERROR_APARTADO);
          }
        )
      );
    }
  }

  /**
   * Carga todos los subapartados del apartado seleccionado en el formulario
   */
  loadHijos(): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'cargarSubapartados()', 'start');
    const id = Number(FormGroupUtil.getValue(this.formGroup, 'apartado')?.id);
    if (id && !isNaN(id)) {
      this.suscripciones.push(
        this.apartadoService.getHijos(id).subscribe(
          (res: SgiRestListResult<IApartado>) => {
            this.subapartados = res.items;
            this.logger.debug(ComentarioCrearModalComponent.name, 'cargarSubapartados()', 'end');
          },
          () => {
            this.logger.error(ComentarioCrearModalComponent.name, 'cargarSubapartados()', 'error');
            this.closeModalError(MSG_ERROR_SUBAPARTADO);
          }
        )
      );
    }
  }

  /**
   * Muestra un mensaje de error y cierra la ventana modal
   *
   * @param texto Texto de error a mostrar
   */
  private closeModalError(texto: string): void {
    this.logger.debug(ComentarioCrearModalComponent.name, `closeModalError(${texto})`, 'start');
    this.snackBarService.showError(texto);
    this.closeModal();
    this.logger.debug(ComentarioCrearModalComponent.name, `closeModalError(${texto})`, 'end');
  }

  /**
   * Cierra la ventana modal y devuelve el comentario si se ha creado
   *
   * @param comentario Comentario creado
   */
  closeModal(comentario?: IComentario): void {
    this.logger.debug(ComentarioCrearModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(comentario);
    this.logger.debug(ComentarioCrearModalComponent.name, 'closeModal()', 'end');
  }

  getNombreBloque(bloque: IBloque): string {
    return bloque?.nombre;
  }

  getNombreApartado(apartado: IApartado): string {
    return apartado?.nombre;
  }

  /**
   * Comprueba el formulario y envia el comentario resultante
   */
  saveComentario() {
    this.logger.debug(ComentarioCrearModalComponent.name, 'guardar()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ComentarioCrearModalComponent.name, 'guardar()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private getDatosForm(): IComentario {
    this.logger.debug(ComentarioCrearModalComponent.name, 'getDatosForm()', 'start');
    const comentario = {} as IComentario;
    const subapartado: IApartado = FormGroupUtil.getValue(this.formGroup, 'subapartado');
    if (subapartado) {
      comentario.apartado = subapartado;
    } else {
      comentario.apartado = FormGroupUtil.getValue(this.formGroup, 'apartado');
    }
    comentario.texto = FormGroupUtil.getValue(this.formGroup, 'comentario');
    comentario.memoria = this.data.memoria;
    this.logger.debug(ComentarioCrearModalComponent.name, 'getDatosForm()', 'end');
    return comentario;
  }
}

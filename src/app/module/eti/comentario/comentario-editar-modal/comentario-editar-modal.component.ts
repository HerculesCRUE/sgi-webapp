import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IApartado } from '@core/models/eti/apartado';
import { IBloque } from '@core/models/eti/bloque';
import { IComentario } from '@core/models/eti/comentario';
import { resolveFormularioByTipoEvaluacionAndComite } from '@core/models/eti/formulario';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { BloqueService } from '@core/services/eti/bloque.service';
import { FormularioService } from '@core/services/eti/formulario.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';

const MSG_ERROR_BLOQUE = marker('eti.comentario.editar.bloque.error.cargar');
const MSG_ERROR_APARTADO = marker('eti.comentario.editar.apartado.error.cargar');
const MSG_ERROR_SUBAPARTADO = marker('eti.comentario.editar.subapartado.error.cargar');
const MSG_ERROR_FORM_GROUP = marker('form-group.error');

@Component({
  templateUrl: './comentario-editar-modal.component.html',
  styleUrls: ['./comentario-editar-modal.component.scss']
})
export class ComentarioEditarModalComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  bloques: IBloque[];
  apartados: IApartado[];
  subapartados: IApartado[];
  suscripciones: Subscription[];

  cargaDatosInicial: boolean;

  constructor(
    private readonly logger: NGXLogger,
    private readonly formularioService: FormularioService,
    private readonly bloqueService: BloqueService,
    private readonly apartadoService: ApartadoService,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<ComentarioEditarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IComentario,
  ) {
    this.logger.debug(ComentarioEditarModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
    this.fxLayoutProperties.layoutAlign = 'space-around start';
    this.bloques = [];
    this.apartados = [];
    this.suscripciones = [];
    this.logger.debug(ComentarioEditarModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'ngOnInit()', 'start');
    this.cargaDatosInicial = true;
    this.suscripciones = [];
    this.subapartados = [];
    this.inicialFormGroup();
    this.loadBloquesComite();
    this.loadApartados();
    this.loadHijos();
    this.logger.debug(ComentarioEditarModalComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Inicializa el formGroup
   */
  private inicialFormGroup(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'inicialFormGroup()', 'start');
    let apartado: IApartado;
    let subapartado: IApartado;
    if (this.data.apartado?.padre) {
      apartado = this.data.apartado.padre;
      subapartado = this.data.apartado;
    }
    else {
      apartado = this.data.apartado;
      subapartado = null;
    }
    this.formGroup = new FormGroup({
      bloque: new FormControl(this.data.apartado?.bloque, [IsEntityValidator.isValid()]),
      apartado: new FormControl(apartado, [IsEntityValidator.isValid()]),
      subapartado: new FormControl(subapartado, []),
      comentario: new FormControl(this.data.texto, [])
    });
    this.logger.debug(ComentarioEditarModalComponent.name, 'inicialFormGroup()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'ngOnDestroy()', 'start');
    this.suscripciones?.forEach(x => x.unsubscribe());
    this.logger.debug(ComentarioEditarModalComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Carga todos los bloques de la aplicación
   */
  private loadBloquesComite(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'cargarBloques()', 'start');

    this.suscripciones.push(
      this.formularioService.getBloques(resolveFormularioByTipoEvaluacionAndComite(this.data.evaluacion.tipoEvaluacion, this.data.memoria.comite)).subscribe(
        (res: SgiRestListResult<IBloque>) => {
          this.bloques = res.items;
          this.logger.debug(ComentarioEditarModalComponent.name, 'cargarBloques()', 'end');
        },
        () => {
          this.closeModalError(MSG_ERROR_BLOQUE);
          this.logger.error(ComentarioEditarModalComponent.name, 'cargarBloques()', 'error');
        }
      )
    );
  }

  /**
   * Carga todos los apartados del bloque seleccionado
   */
  loadApartados(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'loadApartados()', 'start');
    this.initDatosApartados();
    const id = Number(FormGroupUtil.getValue(this.formGroup, 'bloque')?.id);
    if (id && !isNaN(id)) {
      this.suscripciones.push(
        this.bloqueService.getApartados(id).subscribe(
          (res: SgiRestListResult<IApartado>) => {
            this.apartados = res.items;
            this.logger.debug(ComentarioEditarModalComponent.name, 'loadApartados()', 'end');
          },
          () => {
            this.closeModalError(MSG_ERROR_APARTADO);
            this.logger.error(ComentarioEditarModalComponent.name, 'loadApartados()', 'error');
          }
        )
      );
    }
  }

  /**
   * Reinicia los datos de los apartados cuando se cambia de bloque
   */
  private initDatosApartados(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'initDatosApartados()', 'start');
    if (!this.cargaDatosInicial) {
      this.apartados = [];
      this.subapartados = [];
      FormGroupUtil.setValue(this.formGroup, 'apartado', '');
      FormGroupUtil.setValue(this.formGroup, 'subapartado', '');
    } else {
      this.cargaDatosInicial = false;
    }
    this.logger.debug(ComentarioEditarModalComponent.name, 'initDatosApartados()', 'end');
  }

  /**
   * Carga todos los subapartados del apartado seleccionado en el formulario
   */
  loadHijos(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'loadHijos()', 'start');
    const id = Number(FormGroupUtil.getValue(this.formGroup, 'apartado')?.id);
    if (id && !isNaN(id)) {
      this.suscripciones.push(
        this.apartadoService.getHijos(id).subscribe(
          (res: SgiRestListResult<IApartado>) => {
            this.subapartados = res.items;
            this.logger.debug(ComentarioEditarModalComponent.name, 'loadHijos()', 'end');
          },
          () => {
            this.closeModalError(MSG_ERROR_SUBAPARTADO);
            this.logger.error(ComentarioEditarModalComponent.name, 'loadHijos()', 'error');
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
    this.logger.debug(ComentarioEditarModalComponent.name, `closeModalError(${texto})`, 'start');
    this.snackBarService.showError(texto);
    this.closeModal();
    this.logger.debug(ComentarioEditarModalComponent.name, `closeModalError(${texto})`, 'end');
  }

  /**
   * Cierra la ventana modal y devuelve el comentario si se ha creado
   *
   * @param comentario Comentario creado
   */
  closeModal(comentario?: IComentario): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'closeModal()', 'start');
    this.matDialogRef.close(comentario);
    this.logger.debug(ComentarioEditarModalComponent.name, 'closeModal()', 'end');
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
  updateComentario(): void {
    this.logger.debug(ComentarioEditarModalComponent.name, 'updateComentario()', 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(ComentarioEditarModalComponent.name, 'updateComentario()', 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   *
   * @returns Comentario con los datos del formulario
   */
  private getDatosForm(): IComentario {
    this.logger.debug(ComentarioEditarModalComponent.name, 'getDatosForm()', 'start');
    const comentario = this.data;
    const subapartado = FormGroupUtil.getValue(this.formGroup, 'subapartado');
    if (subapartado) {
      comentario.apartado = subapartado;
    } else {
      comentario.apartado = FormGroupUtil.getValue(this.formGroup, 'apartado');
    }
    comentario.texto = FormGroupUtil.getValue(this.formGroup, 'comentario');
    this.logger.debug(ComentarioEditarModalComponent.name, 'getDatosForm()', 'end');
    return comentario;
  }
}

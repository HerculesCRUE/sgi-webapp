import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActionService } from '@core/services/action-service';
import { MemoriaDatosGeneralesFragment } from './memoria-formulario/memoria-datos-generales/memoria-datos-generales.fragment';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { IMemoria } from '@core/models/eti/memoria';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { map, switchMap } from 'rxjs/operators';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { PETICION_EVALUACION_ROUTE } from '../peticion-evaluacion/peticion-evaluacion-route-names';
import { MemoriaDocumentacionFragment } from './memoria-formulario/memoria-documentacion/memoria-documentacion.fragment';
import { NGXLogger } from 'ngx-logger';
import { MemoriaEvaluacionesFragment } from './memoria-formulario/memoria-evaluaciones/memoria-evaluaciones.fragment';
import { MemoriaFormularioFragment } from './memoria-formulario/memoria-formulario/memoria-formulario.fragment';
import { MemoriaInformesFragment } from './memoria-formulario/memoria-informes/memoria-informes.fragment';
import { FormularioService } from '@core/services/eti/formulario.service';
import { BloqueService } from '@core/services/eti/bloque.service';
import { RespuestaService } from '@core/services/eti/respuesta.service';
import { IComite } from '@core/models/eti/comite';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { IRetrospectiva } from '@core/models/eti/retrospectiva';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';

const MSG_PETICIONES_EVALUACION = marker('eti.memoria.link.peticionEvaluacion');

@Injectable()
export class MemoriaActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    FORMULARIO: 'formulario',
    DOCUMENTACION: 'documentacion',
    EVALUACIONES: 'evaluaciones',
    VERSIONES: 'versiones'
  };

  private memoria: IMemoria;
  public readonly: boolean;

  private datosGenerales: MemoriaDatosGeneralesFragment;
  private formularios: MemoriaFormularioFragment;
  private documentacion: MemoriaDocumentacionFragment;
  private evaluaciones: MemoriaEvaluacionesFragment;
  private versiones: MemoriaInformesFragment;

  constructor(
    private readonly logger: NGXLogger,
    fb: FormBuilder,
    route: ActivatedRoute,
    service: MemoriaService,
    private peticionEvaluacionService: PeticionEvaluacionService,
    personaFisicaService: PersonaFisicaService,
    documentoService: DocumentoService,
    formularioService: FormularioService,
    bloqueService: BloqueService,
    apartadoService: ApartadoService,
    respuestaService: RespuestaService,
    evaluacionService: EvaluacionService
  ) {
    super();
    this.memoria = {} as IMemoria;
    if (route.snapshot.data.memoria) {
      this.memoria = route.snapshot.data.memoria;
      this.enableEdit();
      this.addPeticionEvaluacionLink(this.memoria.peticionEvaluacion.id);
      this.readonly = route.snapshot.data.readonly;
    }
    else {
      this.loadPeticionEvaluacion(history.state.idPeticionEvaluacion);
    }
    this.datosGenerales = new MemoriaDatosGeneralesFragment(fb, this.readonly, this.memoria?.id, service, personaFisicaService,
      peticionEvaluacionService);
    this.formularios = new MemoriaFormularioFragment(logger, this.memoria?.id, this.memoria?.comite, formularioService,
      bloqueService, apartadoService, respuestaService, service, evaluacionService);
    this.documentacion = new MemoriaDocumentacionFragment(this.memoria?.id, service, documentoService);
    this.evaluaciones = new MemoriaEvaluacionesFragment(this.memoria?.id, service);
    this.versiones = new MemoriaInformesFragment(this.memoria?.id, service);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    if (this.isEdit()) {
      this.formularios.setPeticionEvaluacion(this.memoria.peticionEvaluacion);
      this.addFragment(this.FRAGMENT.FORMULARIO, this.formularios);
      this.addFragment(this.FRAGMENT.DOCUMENTACION, this.documentacion);
      this.addFragment(this.FRAGMENT.EVALUACIONES, this.evaluaciones);
      this.addFragment(this.FRAGMENT.VERSIONES, this.versiones);
    }

  }

  private addPeticionEvaluacionLink(idPeticionEvaluacion: number): void {
    this.addActionLink({
      title: MSG_PETICIONES_EVALUACION,
      routerLink: ['../..', PETICION_EVALUACION_ROUTE, idPeticionEvaluacion.toString()]
    });
  }

  private loadPeticionEvaluacion(id: number): void {
    if (id) {
      this.peticionEvaluacionService.findById(id).pipe(
        map((peticionEvaluacion) => {
          this.memoria.peticionEvaluacion = peticionEvaluacion;
          this.formularios.setPeticionEvaluacion(peticionEvaluacion);
          this.addPeticionEvaluacionLink(id);
          this.datosGenerales.loadResponsable(id);
        })
      ).subscribe();
    }
  }

  public getComite(): IComite {
    return this.memoria.comite;
  }

  public getEstadoMemoria(): TipoEstadoMemoria {
    return this.memoria.estadoActual;
  }

  public getRetrospectiva(): IRetrospectiva {
    return this.memoria.retrospectiva;
  }

  public setComite(comite: IComite): void {
    this.memoria.comite = comite;
    this.formularios.setComite(comite);
  }


}

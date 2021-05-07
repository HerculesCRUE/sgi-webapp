import { FormGroup } from '@angular/forms';
import { IApartado } from '@core/models/eti/apartado';
import { IBloque } from '@core/models/eti/bloque';
import { IComentario } from '@core/models/eti/comentario';
import { IComite } from '@core/models/eti/comite';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IMemoria, isFormularioEditable } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { IRespuesta } from '@core/models/eti/respuesta';
import { TIPO_EVALUACION } from '@core/models/eti/tipo-evaluacion';
import { Fragment, Group } from '@core/services/action-service';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { BloqueService } from '@core/services/eti/bloque.service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { FormularioService } from '@core/services/eti/formulario.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { RespuestaService } from '@core/services/eti/respuesta.service';
import { SgiFormlyFieldConfig } from '@formly-forms/formly-field-config';
import { FormlyFormOptions } from '@ngx-formly/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of, zip } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { endWith, map, mergeMap, switchMap, takeLast } from 'rxjs/operators';

export interface IBlock {
  bloque: IBloque;
  formlyData: IFormlyData;
  questions: IQuestion[];
  loaded: boolean;
  selected: boolean;
}

interface IQuestion {
  apartado: IApartadoWithRespuestaAndComentario;
  childs: IQuestion[];
}

interface IFormlyData {
  formGroup: FormGroup;
  fields: SgiFormlyFieldConfig[];
  options: FormlyFormOptions;
  model: any;
}

interface IApartadoWithRespuestaAndComentario extends IApartado {
  respuesta: IRespuesta;
  comentario: IComentario;
}

export class MemoriaFormularioFragment extends Fragment {

  public blocks$: BehaviorSubject<IBlock[]> = new BehaviorSubject<IBlock[]>([]);
  public selectedIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  private memoria: IMemoria;
  private comite: IComite;
  private comentarios: Map<number, IComentario>;
  private readonly: boolean;

  isReadonly(): boolean {
    return this.readonly;
  }

  constructor(
    private readonly logger: NGXLogger,
    readonly: boolean,
    key: number,
    comite: IComite,
    private formularioService: FormularioService,
    private bloqueService: BloqueService,
    private apartadoService: ApartadoService,
    private respuestaService: RespuestaService,
    private memoriaService: MemoriaService,
    private evaluacionService: EvaluacionService
  ) {
    super(key);
    this.readonly = readonly;
    this.memoria = {} as IMemoria;
    this.comite = comite;
    this.subscriptions.push(this.selectedIndex$.subscribe(
      (index) => {
        if (index !== undefined) {
          this.loadBlock(index);
        }
      }
    ));
  }

  public setComite(comite: IComite) {
    if (!this.comite || this.comite.id !== comite.id) {
      this.comite = comite;
      this.loadFormulario(comite);
    }
  }

  public performChecks(markAllTouched?: boolean) {
    this.blocks$.value.forEach((block) => {
      if (block.loaded) {
        block.formlyData.fields.forEach((field) => {
          if (field.group) {
            field.group.forceUpdate(markAllTouched);
          }
        });
      }
    });
  }

  public setPeticionEvaluacion(peticionEvaluacion: IPeticionEvaluacion) {
    if (!this.memoria.peticionEvaluacion) {
      this.memoria.peticionEvaluacion = peticionEvaluacion;
    }
  }

  protected onInitialize(): void {
    if (this.getKey() && this.comite) {
      this.subscriptions.push(
        this.memoriaService.findById(this.getKey() as number).pipe(
          map((memoria) => {
            this.memoria = memoria;
            if (!isFormularioEditable(this.memoria) && !this.readonly) {
              this.readonly = true;
            }
            return memoria;
          }),
          switchMap((memoria) => {
            return this.loadComentarios(memoria.id);
          })
        ).subscribe(
          (comentarios) => {
            this.comentarios = comentarios;
            this.loadFormulario(this.comite);
          }
        ));
    }
  }

  private loadFormulario(comite: IComite) {
    this.subscriptions.push(this.formularioService.findById(comite.formulario.id).pipe(
      switchMap((formulario) => {
        return this.formularioService.getBloques(formulario.id);
      }),
      map((response) => {
        return this.toBlocks(response.items);
      }),
    ).subscribe(
      (res) => {
        this.blocks$.next(res);
        this.loadBlock(this.selectedIndex$.value);
      },
      (error) => {
        this.logger.error(error);
      }
    )
    );
  }

  private loadComentarios(idMemoria: number): Observable<Map<number, IComentario>> {
    return this.memoriaService.getEvaluacionesMemoria(idMemoria).pipe(
      map((response) => {
        return response.items.
          filter(e => (e.tipoEvaluacion.id as TIPO_EVALUACION) === TIPO_EVALUACION.MEMORIA).
          reduce((prev, current) => {
            if (prev.version <= current.version) {
              return current;
            }
            return prev;
          }, { version: -1 } as IEvaluacion);
      }),
      switchMap((value) => {
        if (!value.id) {
          return of([] as IComentario[]);
        }
        return this.evaluacionService.getComentariosGestor(value.id).pipe(map(response => response.items));
      }),
      map((comentarios) => {
        const apartadoComentario = new Map<number, IComentario>();
        comentarios.forEach((comentario) => apartadoComentario.set(comentario.apartado.id, comentario));
        return apartadoComentario;
      })
    );
  }

  saveOrUpdate(): Observable<void> {
    const respuestas: IRespuesta[] = [];
    this.blocks$.value.forEach((block) => {
      block.questions.forEach((question) => {
        respuestas.push(...this.getRespuestas(question));
      });
    });
    if (respuestas.length === 0) {
      return of(void 0);
    }
    return merge(
      this.updateRespuestas(respuestas.filter((respuesta) => respuesta.id !== undefined)),
      this.createRespuestas(respuestas.filter((respuesta) => respuesta.id === undefined)),
    ).pipe(
      takeLast(1)
    );
  }

  private getRespuestas(question: IQuestion): IRespuesta[] {
    const respuestas: IRespuesta[] = [];
    let respuesta = {};
    question.apartado.esquema.forEach((field) => {
      respuesta = Object.assign(respuesta, field.model);
    });
    question.apartado.respuesta.valor = respuesta;
    respuestas.push(question.apartado.respuesta);
    if (!question.apartado.respuesta.id) {
      question.apartado.respuesta.memoria = { id: this.getKey() as number } as IMemoria;
      question.apartado.respuesta.apartado = { id: question.apartado.id } as IApartado;
    }
    question.childs.forEach((child) => {
      respuestas.push(...this.getRespuestas(child));
    });
    return respuestas;
  }

  private createRespuestas(respuestas: IRespuesta[]): Observable<void> {
    return from(respuestas).pipe(
      mergeMap((respuesta) => {
        return this.respuestaService.create(respuesta).pipe(
          map((updated) => {
            respuesta = updated;
          })
        );
      }),
      endWith()
    );
  }

  private updateRespuestas(respuestas: IRespuesta[]): Observable<void> {
    return from(respuestas).pipe(
      mergeMap((respuesta) => {
        return this.respuestaService.update(respuesta.id, respuesta).pipe(
          map((updated) => {
            respuesta = updated;
          })
        );
      }),
      endWith()
    );
  }

  /**
   * Convert an array of IApartadoRespuesta to an array o IBlock
   *
   * @param apartadosRespuesta The array of IApartadoRespuesta to convert
   */
  private toBlocks(bloques: IBloque[]): IBlock[] {
    const blocks: IBlock[] = [];
    const bloqueModels: any[] = [];
    bloques.forEach((bloque) => {
      const block: IBlock = {
        bloque,
        formlyData: {
          formGroup: new FormGroup({}),
          fields: [],
          model: {},
          options: {}
        },
        questions: [],
        selected: false,
        loaded: false
      };
      bloqueModels[bloque.orden] = block.formlyData.model;
      block.formlyData.options.formState = {
        mainModel: block.formlyData.model,
        memoria: this.memoria,
        bloques: bloqueModels
      };
      blocks.push(block);
    });
    return blocks;
  }

  /**
   * Load all questions, including responses, of an block by their index in blocks$. 
   *
   * Only is loaded if have been loaded previously.
   * 
   * @param index Index to load
   */
  private loadBlock(index: number): void {
    const block = this.blocks$.value[index];
    if (block && !block.loaded) {
      this.bloqueService.getApartados(block.bloque.id).pipe(
        map((apartados) => {
          return apartados.items.map((ap) => ap as IApartadoWithRespuestaAndComentario);
        }),
        map((apartadosRespuestas) => {
          apartadosRespuestas.forEach((apartado) => apartado.comentario = this.comentarios.get(apartado.id));
          return apartadosRespuestas;
        }),
        switchMap((apartadosRespuesta) => {
          const respuestasApartados: Observable<IApartadoWithRespuestaAndComentario>[] = [];
          apartadosRespuesta.forEach(apartado => {
            respuestasApartados.push(this.respuestaService.findByMemoriaIdAndApartadoId(this.getKey() as number, apartado.id).pipe(
              map((respuesta) => {
                apartado.respuesta = respuesta ? respuesta : { valor: {} } as IRespuesta;
                return apartado;
              })
            ));
          });
          return zip(...respuestasApartados);
        }),
        switchMap((apartados) => {
          return this.fillBlock(block, apartados);
        })
      ).subscribe(
        (value) => {
          block.loaded = true;
          block.selected = true;
          this.fillFormlyData(true, value.formlyData.model, value.formlyData.options.formState, value.formlyData.fields, value.questions);
          value.formlyData.fields.forEach((f) => {
            if (f.group) {
              this.subscriptions.push(f.group.status$.subscribe((status) => {
                this.evalStatusChange();
              }));
            }
          });
        }
      );
    }
    else if (block) {
      block.selected = true;
    }
  }

  private evalStatusChange(): void {
    let changes = false;
    let errors = false;
    this.blocks$.value.forEach((block) => {
      block.formlyData.fields.forEach((f) => {
        if (f.group) {
          changes = changes || f.group.hasChanges();
          errors = errors || f.group.hasErrors();
        }
      });
    });
    this.setChanges(changes);
    this.setErrors(errors);
  }

  /**
   * Fill a block with received apartados, also load childs of apartados because received apartados are considered parents.
   *
   * The apartados are converted to questions, and ordered according to their orden field
   *
   * @param apartados The list of parent apartado  of the block
   */
  private fillBlock(block: IBlock, apartados: IApartadoWithRespuestaAndComentario[]): Observable<IBlock> {
    const firstLevel = apartados
      .sort((a, b) => a.orden - b.orden)
      .map((apartadoRespuesta) => {
        const iQuestion: IQuestion = {
          apartado: apartadoRespuesta,
          childs: [],
        };
        return iQuestion;
      });
    block.questions.push(...firstLevel);
    return from(firstLevel).pipe(
      mergeMap((question) => {
        return this.getQuestionChilds(question).pipe(
          map((childs) => {
            question.childs.push(...childs);
            return block;
          }));
      }),
      endWith(block)
    );
  }

  /**
   * Recursively get childs of a question.
   *
   * @param question The question where the childs are searched
   */
  private getQuestionChilds(question: IQuestion): Observable<IQuestion[]> {
    return this.apartadoService.getHijos(question.apartado.id).pipe(
      map((apartados) => {
        return apartados.items.map((ap) => ap as IApartadoWithRespuestaAndComentario);
      }),
      map((apartadosRespuestas) => {
        apartadosRespuestas.forEach((apartado) => apartado.comentario = this.comentarios.get(apartado.id));
        return apartadosRespuestas;
      }),
      switchMap((apartadosRespuesta) => {
        const respuestasApartados: Observable<IApartadoWithRespuestaAndComentario>[] = [];
        apartadosRespuesta.forEach(apartado => {
          respuestasApartados.push(this.respuestaService.findByMemoriaIdAndApartadoId(this.getKey() as number, apartado.id).pipe(
            map((respuesta) => {
              apartado.respuesta = respuesta ? respuesta : { valor: {} } as IRespuesta;
              return apartado;
            })
          ));
        });
        return zip(...respuestasApartados);
      }),
      map((hijos) => {
        return hijos
          .sort((a, b) => a.orden - b.orden)
          .map((hijo) => {
            const iQuestion: IQuestion = {
              apartado: hijo,
              childs: [],
            };
            return iQuestion;
          });
      }),
      switchMap((value) => {
        question.childs.push(...value);
        if (value.length > 0) {
          return from(value).pipe(
            mergeMap((iq) => {
              return this.getQuestionChilds(iq);
            })
          );
        }
        else {
          return of([]);
        }
      })
    );
  }

  /**
   * Fill the Formly data recursively. The received questions are loaded as nested fieldConfigs
   * of the provided fieldConfig.
   *
   * @param firstLevel Indicates if it's the first iteration
   * @param formlyFieldConfig The Formly field config onto load questions
   * @param questions  The questions to load
   */
  private fillFormlyData(firstLevel: boolean, model: any, formState: any, formlyFieldConfig: SgiFormlyFieldConfig[],
    questions: IQuestion[]): void {
    questions.forEach(question => {
      const firstFieldConfig = question.apartado.esquema ? question.apartado.esquema[0] : {};
      const key = firstFieldConfig.key as string;
      const fieldConfig = firstFieldConfig.fieldGroup;
      if (firstLevel && key) {
        model[key] = question.apartado.respuesta.valor;
        this.evalExpressionModelValue(question.apartado.esquema, model[key], formState);
      }
      else {
        model = Object.assign(model, question.apartado.respuesta.valor);
      }
      if (!firstFieldConfig.templateOptions) {
        firstFieldConfig.templateOptions = {};
      }
      firstFieldConfig.templateOptions.comentario = question.apartado.comentario;
      firstFieldConfig.group = new Group();
      if (this.readonly || (!this.readonly && this.comentarios.size && !question.apartado.comentario)) {
        firstFieldConfig.templateOptions.locked = true;
        if (firstFieldConfig.fieldGroup) {
          firstFieldConfig.fieldGroup.forEach((esquema) => {
            if (esquema.templateOptions) {
              esquema.templateOptions.disabled = true;
            }
            else {
              esquema.templateOptions = {
                disabled: true
              };
            }
          });
        }
      }
      formlyFieldConfig.push(...question.apartado.esquema);
      if (question.childs.length) {
        this.fillFormlyData(false, key ? model[key] : model, formState, fieldConfig ? fieldConfig : formlyFieldConfig, question.childs);
      }
    });
  }

  private evalExpressionModelValue(fieldConfig: SgiFormlyFieldConfig[], model: any, formState: any) {
    fieldConfig.forEach(fg => {
      if (fg.key && fg.templateOptions?.expressionModelValue) {
        const f = this.evalStringExpression(fg.templateOptions.expressionModelValue, ['model', 'formState', 'field']);
        model[fg.key as string] = this.evalExpression(f, { fg }, [{ model }, formState, fg]);
      }
      if (fg.key && fg.fieldGroup) {
        this.evalExpressionModelValue(fg.fieldGroup, model, formState);
      }
    });
  }

  private evalStringExpression(expression: string, argNames: string[]) {
    try {
      return Function(...argNames, `return ${expression};`) as any;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private evalExpression(expression: Function, thisArg: any, argVal: any[]): any {
    return expression.apply(thisArg, argVal);
  }
}

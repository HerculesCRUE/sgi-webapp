import { Fragment } from '@core/services/action-service';
import { BehaviorSubject, from, merge, Observable, of, zip } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { FormGroup } from '@angular/forms';
import { IBloque } from '@core/models/eti/bloque';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { endWith, map, mergeMap, switchMap, takeLast } from 'rxjs/operators';
import { IApartado } from '@core/models/eti/apartado';
import { FormularioService } from '@core/services/eti/formulario.service';
import { IComite } from '@core/models/eti/comite';
import { IMemoria } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { BloqueService } from '@core/services/eti/bloque.service';
import { RespuestaService } from '@core/services/eti/respuesta.service';
import { ApartadoService } from '@core/services/eti/apartado.service';
import { IRespuesta } from '@core/models/eti/respuesta';

export interface IBlock {
  bloque: IBloque;
  formlyData: IFormlyData;
  questions: IQuestion[];
  loaded: boolean;
  selected: boolean;
}

interface IQuestion {
  apartado: IApartadoWithRespuesta;
  childs: IQuestion[];
}

interface IFormlyData {
  formGroup: FormGroup;
  fields: FormlyFieldConfig[];
  options: FormlyFormOptions;
  model: any;
}

interface IApartadoWithRespuesta extends IApartado {
  respuesta: IRespuesta;
}

export class MemoriaFormularioFragment extends Fragment {

  private subscriptions: Subscription[] = [];

  public blocks$: BehaviorSubject<IBlock[]> = new BehaviorSubject<IBlock[]>([]);
  public selectedIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  private memoria: IMemoria;
  private comite: IComite;

  constructor(
    private logger: NGXLogger,
    key: number,
    comite: IComite,
    private formularioService: FormularioService,
    private bloqueService: BloqueService,
    private apartadoService: ApartadoService,
    private respuestaService: RespuestaService
  ) {
    super(key);
    this.memoria = {} as IMemoria;
    this.comite = comite;
    //TODO: Remove when change detection works
    this.setChanges(true);
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

  public setPeticionEvaluacion(peticionEvaluacion: IPeticionEvaluacion) {
    if (!this.memoria.peticionEvaluacion) {
      this.memoria.peticionEvaluacion = peticionEvaluacion;
    }
  }

  protected onInitialize(): void {
    if (this.getKey() && this.comite) {
      this.loadFormulario(this.comite);
    }
  }

  private loadFormulario(comite: IComite) {
    this.subscriptions.push(this.formularioService.findById(comite.formulario.id).pipe(
      switchMap((formulario) => {
        return this.formularioService.getBloques(formulario.id);
      }),
      map((response) => {
        return this.toBlocks(response.items);
      })
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
          const withResponse: IApartadoWithRespuesta[] = apartados.items.map((ap) => ap as IApartadoWithRespuesta);
          return withResponse;
        }),
        switchMap((apartadosRespuesta) => {
          const respuestasApartados: Observable<IApartadoWithRespuesta>[] = [];
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
        }
      );
    }
    else if (block) {
      block.selected = true;
    }
  }

  /**
   * Fill a block with received apartados, also load childs of apartados because received apartados are considered parents.
   *
   * The apartados are converted to questions, and ordered according to their orden field
   *
   * @param apartados The list of parent apartado  of the block
   */
  private fillBlock(block: IBlock, apartados: IApartadoWithRespuesta[]): Observable<IBlock> {
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
        const withResponse: IApartadoWithRespuesta[] = apartados.items.map((ap) => ap as IApartadoWithRespuesta);
        return withResponse;
      }),
      switchMap((apartadosRespuesta) => {
        const respuestasApartados: Observable<IApartadoWithRespuesta>[] = [];
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
  private fillFormlyData(firstLevel: boolean, model: any, formState: any, formlyFieldConfig: FormlyFieldConfig[], questions: IQuestion[]): void {
    questions.forEach(question => {
      const key = question.apartado.esquema ? question.apartado.esquema[0].key as string : undefined;
      const fieldConfig = question.apartado.esquema ? question.apartado.esquema[0]?.fieldGroup : undefined;
      if (firstLevel && key) {
        model[key] = question.apartado.respuesta.valor;
        this.evalExpressionModelValue(question.apartado.esquema, model[key], formState);
      }
      else {
        model = Object.assign(model, question.apartado.respuesta.valor);
      }
      formlyFieldConfig.push(...question.apartado.esquema);
      if (question.childs.length) {
        this.fillFormlyData(false, key ? model[key] : model, formState, fieldConfig ? fieldConfig : formlyFieldConfig, question.childs);
      }
    });
  }

  private evalExpressionModelValue(fieldConfig: FormlyFieldConfig[], model: any, formState: any) {
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
      console.error(error);
    }
  }

  private evalExpression(expression: Function, thisArg: any, argVal: any[]): any {
    return expression.apply(thisArg, argVal);
  }
}

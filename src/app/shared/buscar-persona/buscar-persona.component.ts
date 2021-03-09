import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IPersona } from '@core/models/sgp/persona';
import { BuscarPersonaDialogoComponent } from './dialogo/buscar-persona-dialogo.component';

const TEXT_USER_TITLE = marker('eti.buscarUsuario.titulo');
const TEXT_USER_BUTTON = marker('botones.buscar');

@Component({
  selector: 'sgi-buscar-persona',
  templateUrl: './buscar-persona.component.html',
  styleUrls: ['./buscar-persona.component.scss']
})
export class BuscarPersonaComponent implements OnChanges {

  datosUsuario: string;
  private persona: IPersona;

  @Input() required = false;
  @Input() disabled = false;
  @Input() textoLabel = TEXT_USER_TITLE;
  @Input() textoInput = TEXT_USER_TITLE;
  @Input() textoButton = TEXT_USER_BUTTON;
  @Input() datosUsuarioTexto: string;

  @Output()
  usuarioSeleccionado: EventEmitter<IPersona> = new EventEmitter();

  constructor(public dialog: MatDialog) {
    this.datosUsuario = this.datosUsuarioTexto;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.datosUsuarioTexto) {
      this.datosUsuario = this.datosUsuarioTexto;
    }
  }

  formularioBuscarUsuario(): void {
    this.persona = {} as IPersona;
    const dialogRef = this.dialog.open(BuscarPersonaDialogoComponent, {
      width: '600px',
      data: this.persona
    });

    dialogRef.afterClosed().subscribe((persona: IPersona) => {
      this.selectUsuario(persona);
    });
  }

  private emitValue() {
    this.usuarioSeleccionado.emit(this.persona);
  }

  selectUsuario(persona: IPersona) {
    this.persona = persona;
    this.datosUsuario = persona ? persona.nombre + ' ' + persona.primerApellido + ' ' +
      persona.segundoApellido + '(' + persona.identificadorNumero + persona.identificadorLetra + ')' : '';
    this.emitValue();
  }

  clear() {
    this.persona = null;
    this.datosUsuario = null;
    this.emitValue();
  }

}

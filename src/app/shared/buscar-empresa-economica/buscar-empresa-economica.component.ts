import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { MatDialog } from '@angular/material/dialog';
import { NGXLogger } from 'ngx-logger';
import { BuscarEmpresaEconomicaDialogoComponent, EmpresaEconomicaModalData } from './dialogo/buscar-empresa-economica-dialogo.component';

const TEXT_USER_TITLE = marker('sgp.buscadorEmpresaEconomica.titulo');
const TEXT_USER_BUTTON = marker('botones.buscar');

@Component({
  selector: 'sgi-buscar-empresa-economica',
  templateUrl: './buscar-empresa-economica.component.html',
  styleUrls: ['./buscar-empresa-economica.component.scss']
})
export class BuscarEmpresaEconomicaComponent implements OnChanges {

  datosEmpresaEconomica = '';
  empresaEconomica = {} as IEmpresaEconomica;

  @Input() textoLabel = TEXT_USER_TITLE;
  @Input() textoInput = TEXT_USER_TITLE;
  @Input() textoButton = TEXT_USER_BUTTON;
  @Input() datosEmpresaEconomicaTexto: string;

  @Output() empresaEconomicaSeleccionada = new EventEmitter<IEmpresaEconomica>();

  constructor(public dialog: MatDialog, private readonly logger: NGXLogger) { }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, 'ngOnChanges(changes: SimpleChanges)', 'start');
    if (changes.datosEmpresaEconomicaTexto) {
      this.datosEmpresaEconomica = this.datosEmpresaEconomicaTexto;
    }
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, 'ngOnChanges(changes: SimpleChanges)', 'end');
  }

  formularioBuscarEmpresaEconomica(): void {
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, `${this.formularioBuscarEmpresaEconomica.name}()`, 'start');
    const data: EmpresaEconomicaModalData = {
      empresaEconomica: this.empresaEconomica
    };
    const dialogRef = this.dialog.open(BuscarEmpresaEconomicaDialogoComponent, {
      width: '1000px',
      data
    });
    dialogRef.afterClosed().subscribe((empresaEconomica: IEmpresaEconomica) => {
      if (empresaEconomica) {
        this.datosEmpresaEconomica = empresaEconomica.razonSocial;
        this.selectEmpresaEconomica(empresaEconomica);
      }
    });
    this.logger.debug(BuscarEmpresaEconomicaComponent.name, `${this.formularioBuscarEmpresaEconomica.name}()`, 'end');
  }

  selectEmpresaEconomica(empresaEconomica: IEmpresaEconomica) {
    this.logger.debug(BuscarEmpresaEconomicaComponent.name,
      `${this.formularioBuscarEmpresaEconomica.name}(empresaEconomica: ${empresaEconomica})`, 'start');
    this.empresaEconomicaSeleccionada.emit(empresaEconomica);
    this.logger.debug(BuscarEmpresaEconomicaComponent.name,
      `${this.formularioBuscarEmpresaEconomica.name}(empresaEconomica: ${empresaEconomica})`, 'end');
  }

}

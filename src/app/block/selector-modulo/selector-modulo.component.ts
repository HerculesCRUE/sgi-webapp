import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Module } from '@core/module';

const MSG_MODULO_CSP = marker('selector-modulo.csp');
const MSG_MODULO_ETI = marker('selector-modulo.etica');
const MSG_MODULO_INV = marker('selector-modulo.investigador');

interface SelectorModulo {
  module: Module;
  nombre: string;
}

@Component({
  templateUrl: './selector-modulo.component.html',
  styleUrls: ['./selector-modulo.component.scss']
})
export class SelectorModuloComponent implements OnInit {
  modulos: SelectorModulo[];

  constructor(
    private logger: NGXLogger,
    public dialogRef: MatDialogRef<SelectorModuloComponent>,
    private router: Router
  ) {
    this.modulos = [
      {
        module: Module.CSP,
        nombre: MSG_MODULO_CSP
      },
      {
        module: Module.ETI,
        nombre: MSG_MODULO_ETI
      },
      {
        module: Module.INV,
        nombre: MSG_MODULO_INV
      }
    ];
  }

  ngOnInit(): void {
    this.logger.debug(SelectorModuloComponent.name, 'ngOnInit()', 'start');
    // this.dialogRef.updateSize('420px', '360px');
    this.logger.debug(SelectorModuloComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  openModulo(modulo: string) {
    this.router.navigateByUrl(modulo).then(
      () => {
        this.closeModal();
      }
    );
  }
}

import moment from 'moment';
import { Moment } from 'moment';

/**
 * Clase para definir funciones para trabajar con fechas
 */
export class DateUtils {

  /**
   * Convierte una fecha en formato string, moment o Date a Date.
   *
   * @param fecha una fecha con formato MM/DD/YYYY
   * @return la fecha como un Date.
   */
  static fechaToDate(fecha: string | Moment | Date): Date {
    let fechaDate: Date;
    if (fecha && typeof fecha === 'string') {
      fechaDate = new Date(fecha);
    } else if (fecha instanceof Date) {
      fechaDate = fecha as Date;
    } else if (moment.isMoment(fecha)) {
      fechaDate = fecha.toDate();
    }
    return fechaDate;
  }

  /**
   * Recupera la fecha de inicio del dia correspondiente a la fecha (yyyy-MM-dd 00:00:00.000).
   * @param fecha una fecha
   *
   * @return una nueva fecha correspondiente al inicio del dia
   */
  static getFechaInicioDia(fecha: Date): Date {
    if (fecha) {
      const fechaInicioDia = new Date(fecha);
      fechaInicioDia.setHours(0, 0, 0, 0);
      return fechaInicioDia;
    }
    return null;
  }

  /**
   * Recupera la fecha de fin del dia correspondiente a la fecha (yyyy-MM-dd 23:59:59.999).
   * @param fecha una fecha
   *
   * @return una nueva fecha correspondiente al fin del dia
   */
  static getFechaFinDia(fecha: Date): Date {
    if (fecha) {
      const fechaFinDia = new Date(fecha);
      fechaFinDia.setHours(23, 59, 59, 999);
      return fechaFinDia;
    }
    return null;
  }

  /**
   * Formatea la fecha con formato ISO yyyy-MM-dd, ej. 2020-07-23.
   *
   * @param fecha una fecha
   * @return un string con la fecha formateada o '' si la fecha no esta definida.
   */
  static formatFechaAsISODate(fecha: Date): string {

    if (!fecha) {
      return '';
    }

    const fechaDate = this.fechaToDate(fecha);

    let mes = (fechaDate.getMonth() + 1).toString();
    let dia = fechaDate.getDate().toString();
    const anio = fechaDate.getFullYear().toString();

    if (mes.length < 2) {
      mes = '0' + mes;
    }

    if (dia.length < 2) {
      dia = '0' + dia;
    }

    return [anio, mes, dia].join('-');
  }


  /**
   * Formatea la fecha con hora con formato ISO yyyy-MM-dd'T'HH:mm:ss, ej. 2020-07-23T09:17:00.
   *
   * @param fecha una fecha
   * @return un string con la fecha formateada o '' si la fecha no esta definida.
   */
  static formatFechaAsISODateTime(fecha: Date): string {


    if (!fecha) {
      return '';
    }

    const fechaDate = this.fechaToDate(fecha);
    const fechaString = this.formatFechaAsISODate(fechaDate);

    let hora = fechaDate.getHours().toString();
    let minuto = fechaDate.getMinutes().toString();
    let segundo = fechaDate.getSeconds().toString();

    if (hora.length < 2) {
      hora = '0' + hora;
    }

    if (minuto.length < 2) {
      minuto = '0' + minuto;
    }

    if (segundo.length < 2) {
      segundo = '0' + segundo;
    }

    const horaString = [hora, minuto, segundo].join(':');


    return [fechaString, horaString].join('T');
  }

  /**
   * Comprueba que el rango de fechas no se solapen
   *
   * @param fecha una fecha
   * @return un string con la fecha formateada o '' si la fecha no esta definida.
   */
  static dateRangeOverlaps(aDateStart: Date, aDateEnd: Date, bDateStart: Date, bDateEnd: Date) {
    if (aDateStart.getTime() <= bDateStart.getTime() && bDateStart.getTime() <= aDateEnd.getTime()) { return true; } // b starts in a
    if (aDateStart.getTime() <= bDateEnd.getTime() && bDateEnd.getTime() <= aDateEnd.getTime()) { return true; } // b ends in a
    if (bDateStart.getTime() < aDateStart.getTime() && aDateEnd.getTime() < bDateEnd.getTime()) { return true; } // a in b
    return false;
  }

}

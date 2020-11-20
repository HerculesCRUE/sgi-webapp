import { Injectable } from '@angular/core';
import { SgiRestService } from '@sgi/framework/http/';
import { IDocumento } from '@core/models/sgdoc/documento';
import { NGXLogger } from 'ngx-logger';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { environment } from '@env';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map, takeLast } from 'rxjs/operators';

export interface FileModel {
  file: File;
  progress: number;
  status: 'attached' | 'uploading' | 'complete' | 'error';
  document?: IDocumento;
}

export function triggerDownloadToUser(file: Blob, fileName: string) {
  const downloadLink = document.createElement('a');
  const href = window.URL.createObjectURL(file);
  downloadLink.href = href;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(href);
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService extends SgiRestService<string, IDocumento>{
  private static readonly MAPPING = '/documentos';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(DocumentoService.name, logger,
      `${environment.serviceServers.sgdoc}${DocumentoService.MAPPING}`, http);
  }

  /**
   * Crea el fichero en sgdoc.
   * @param fichero Fichero a crear.
   */
  uploadFichero(fileModel: FileModel): Observable<IDocumento> {
    this.logger.debug(DocumentoService.name, `uploadFichero()`, '-', 'START');

    const formData = new FormData();
    formData.append('archivo', fileModel.file);

    return this.http.post(`${this.endpointUrl}`, formData, { observe: 'events', reportProgress: true }).pipe(
      map((event: HttpEvent<any>) => {
        console.log(event);
        switch (event.type) {
          case HttpEventType.Sent:
            fileModel.status = 'uploading';
            break;
          case HttpEventType.UploadProgress:
            fileModel.progress = Math.round(100 * event.loaded / event.total);
            break;
          case HttpEventType.Response:
            fileModel.status = 'complete';
            return event.body as IDocumento;
        }
      }),
      takeLast(1),
      catchError((err) => {
        fileModel.status = 'error';
        return throwError(err);
      })
    );

  }

  /**
   * Recupera la información del documento.
   * @param documentoRef referencia del documento.
   */
  getInfoFichero(documentoRef: string): Observable<IDocumento> {
    this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'START');

    return this.http.get<IDocumento>(`${this.endpointUrl}/${documentoRef}`).pipe(
      tap(() => this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'end'))
    );

  }


  /**
   * Descarga el fichero.
   * @param documentoRef referencia del documento.
   */
  downloadFichero(documentoRef: string): Observable<Blob> {
    this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'START');

    return this.http.get(`${this.endpointUrl}/${documentoRef}/archivo`, {
      headers: new HttpHeaders().set('Accept', 'application/octet-stream'), responseType: 'blob'
    }).pipe(
      tap(() => this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'end'))
    );

  }


  /**
   * Elimina el documento.
   * @param documentoRef referencia del documento.
   */
  eliminarFichero(documentoRef: string): Observable<void> {
    this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'START');


    return this.http.delete<void>(`${this.endpointUrl}/${documentoRef}`).pipe(
      tap(() => this.logger.debug(DocumentoService.name, `downloadFichero(${documentoRef}: string)`, '-', 'end'))
    );

  }
}

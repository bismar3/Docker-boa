import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Tramo } from '../../../interfaces/tramo.interface';

const httpOptions = (token: string) => ({
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
});

@Injectable({ providedIn: 'root' })
export class TramoService {
  private url: string = `${environment.URL_SERVICIOS}/tramo`;
  constructor(private http: HttpClient) { }

  public getAll(): Observable<Tramo[]> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Tramo[]>(this.url, httpOptions(token)).pipe(catchError(this.handleError('getAll', [])));
    return of([]);
  }
  public getById(id: number): Observable<Tramo> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.get<Tramo>(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError<Tramo>('getById')));
    return of();
  }
  public create(tramo: Tramo): Observable<Tramo> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.post<Tramo>(this.url, tramo, httpOptions(token)).pipe(catchError(this.handleError<Tramo>('create')));
    return of();
  }
  public delete(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) return this.http.delete(`${this.url}/${id}`, httpOptions(token)).pipe(catchError(this.handleError('delete')));
    return of();
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => { console.error(error); return of(result as T); };
  }
}
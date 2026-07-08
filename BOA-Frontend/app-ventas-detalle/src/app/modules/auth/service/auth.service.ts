import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { User } from '../../../interfaces/user.interface';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlAuth = `${environment.URL_SERVICIOS}/token`;

  constructor(private http: HttpClient) {}

  public getToken(user: User): Observable<User> {
    return this.http.post<any>(this.urlAuth, user, httpOptions).pipe(
      map((res: HttpResponse<any>) => {
        if (res.headers.has("Authorization")) {
          const token = res.headers.get("Authorization");
          if (token) {
            user.token = token;
            sessionStorage.setItem('token', 'Bearer ' + token);
          }
        }
        return { ...user, ...res.body.user };
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error("AuthService error", error);
    const mensajeReal = error?.error?.message || error?.message || "Error de autenticación.";
    return throwError(() => new Error(mensajeReal));
  }
}
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpUrlEncodingCodec,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatlabResponse } from './models';

@Injectable({
  providedIn: 'root',
})
export class MatlabService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:8000';
  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    }),
  };
  getSessions(): Observable<MatlabResponse> {
    return this.http.get<MatlabResponse>(this.apiUrl + '/sessions');
  }

  runCommand(sid: number, commands: string): Observable<MatlabResponse> {
    return this.http.get<MatlabResponse>(
      this.apiUrl + '/run?sid=' + sid + '&commands=' + encodeURI(commands)
    );
  }
}
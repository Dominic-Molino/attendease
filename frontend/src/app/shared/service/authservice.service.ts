import { HttpClient } from '@angular/common/http';
import { Injectable, input } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  constructor(private http: HttpClient) {}
  API_URL = 'http://localhost:3000/user';

  getAll() {
    return this.http.get(this.API_URL);
  }

  getByCode(code: any) {
    return this.http.get(this.API_URL + '/' + code);
  }

  registerStudent(inputData: any) {
    return this.http.post(this.API_URL, inputData);
  }

  updateStudent(code: any, inputData: any) {
    return this.http.put(this.API_URL + '/' + code, inputData);
  }
}

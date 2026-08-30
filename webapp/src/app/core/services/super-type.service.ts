import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuperType } from '../models/card.models';

/** Same shape as CardSetService — see that file for the general explanation of this pattern. */
@Injectable({ providedIn: 'root' })
export class SuperTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/super-types';

  /** GET /api/super-types. Optional on a card — AllCard.superType can be null. */
  getAll(): Observable<SuperType[]> {
    return this.http.get<SuperType[]>(this.baseUrl);
  }
}

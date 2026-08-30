import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardType } from '../models/card.models';

/** Same shape as CardSetService — see that file for the general explanation of this pattern. */
@Injectable({ providedIn: 'root' })
export class CardTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/card-types';

  /** GET /api/card-types — "Unit", "Spell", "Battlefield", etc. */
  getAll(): Observable<CardType[]> {
    return this.http.get<CardType[]>(this.baseUrl);
  }
}

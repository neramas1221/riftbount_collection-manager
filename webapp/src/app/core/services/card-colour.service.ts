import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardColour } from '../models/card.models';

/** Same shape as CardSetService — see that file for the general explanation of this pattern. */
@Injectable({ providedIn: 'root' })
export class CardColourService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/card-colour';

  /** GET /api/card-colour — includes both base colours ("Fury") and combo rows ("Fury-Chaos"). */
  getAll(): Observable<CardColour[]> {
    return this.http.get<CardColour[]>(this.baseUrl);
  }
}

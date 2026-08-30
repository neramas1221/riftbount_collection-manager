import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardRarity } from '../models/card.models';

/** Same shape as CardSetService — see that file for the general explanation of this pattern. */
@Injectable({ providedIn: 'root' })
export class CardRarityService {
  private readonly http = inject(HttpClient);
  // Note: the backend route really is "card-raritys" (typo baked into CardRarityController).
  private readonly baseUrl = '/api/card-raritys';

  /** GET /api/card-raritys — "Common", "Rare", etc. */
  getAll(): Observable<CardRarity[]> {
    return this.http.get<CardRarity[]>(this.baseUrl);
  }
}

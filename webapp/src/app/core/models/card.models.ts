/**
 * TypeScript interfaces mirroring the backend's DTOs (see spring_boot's dto/ package). These
 * are the shapes returned by the Spring Boot API — there's no runtime validation of them (a
 * `interface` is purely a compile-time type, erased entirely once TypeScript compiles to JS),
 * so if the backend's JSON shape changes, these need to be updated to match by hand.
 */

/** A print run, e.g. "Origins". `totalCollectorNum` is how many cards the set contains in total. */
export interface CardSet {
  id: number;
  setName: string;
  totalCollectorNum: number;
}

/**
 * A colour row as stored in the DB — NOT one row per base colour. Dual-colour cards get their
 * own combined row too, e.g. "Fury", "Chaos" and "Fury-Chaos" are three separate rows here, not
 * a card referencing two colours. See resolveColourFilterNames() in card-database.component.ts
 * for how the UI reconstructs "pick 2 base colours" filtering on top of that.
 */
export interface CardColour {
  id: number;
  colour: string;
}

/** e.g. "Unit", "Spell", "Battlefield" — drives several UI rules, see card-database.component.ts. */
export interface CardType {
  id: number;
  type: string;
}

export interface SuperType {
  id: number;
  superType: string;
}

/** e.g. "Common", "Rare". */
export interface CardRarity {
  id: number;
  rarity: string;
}

/**
 * A single physical card printing. Note that cardSet/cardType/cardColour/superType/cardRarity
 * are plain numeric ids (foreign keys), not nested objects — the backend deliberately returns
 * flat DTOs, so anywhere the UI needs to show "Origins" instead of "6" it has to look the id up
 * itself. See ReferenceDataService.enrich(), which does exactly that and produces an
 * EnrichedCard (below) with the human-readable names alongside the raw ids.
 *
 * Also mirrors the JSON actually produced by AllCardResponse.java. Note that overNumbered,
 * alternative and signature come across WITHOUT their "is" prefix: they're primitive
 * `boolean` fields already named isXxx, so Lombok emits isXxx() getters and Jackson's
 * bean-property convention strips the "is" a second time (isToken stays "isToken" because
 * it's an int field with a getIsToken() getter, which isn't subject to that stripping).
 */
export interface AllCard {
  id: number;
  cardName: string;
  cardSet: number;
  overNumbered: boolean;
  alternative: boolean;
  cardType: number;
  cardColour: number;
  isToken: number;
  collectorNumber: string;
  cardPrice: number;
  energy: number | null;
  might: number | null;
  power: number | null;
  subType: string[];
  signature: boolean;
  superType: number | null;
  cardRarity: number | null;
  cardImageUrl: string | null;
}

/** How many copies of one AllCard the user owns. `id` here is the owned-card row's own id (used for delete), not the card's id — that's `allCardId`. */
export interface OwnedCard {
  id: number;
  allCardId: number;
  quantity: number;
}

/** Body sent to POST /api/owned-cards to create/update how many of a card you own. */
export interface OwnedCardRequest {
  allCardId: number;
  quantity: number;
}

/** Mirrors UserCardFilterRequest.java, POST /api/all-card/search. Every field is optional — omit it and that filter simply isn't applied. */
export interface UserCardFilterRequest {
  cardSets?: string[];
  cardTypes?: string[];
  cardColours?: string[];
  cardEnergyMin?: number;
  cardEnergyMax?: number;
  cardMightMin?: number;
  cardMightMax?: number;
  cardPowerMin?: number;
  cardPowerMax?: number;
  isOverNumbered?: boolean;
  isAlternative?: boolean;
  isToken?: number;
  isSignature?: boolean;
}

/** One point on the (currently synthetic — see price-history.service.ts) price chart. */
export interface PricePoint {
  date: string;
  price: number;
}

/**
 * An AllCard with its foreign keys resolved to readable names — this is what every page
 * actually renders in its templates, never the raw AllCard. Built by ReferenceDataService.enrich().
 */
export interface EnrichedCard extends AllCard {
  setName: string;
  typeName: string;
  colourName: string;
  superTypeName: string | null;
  rarityName: string | null;
}

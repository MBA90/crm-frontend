// Mirrors crm-master-setup's CountryDTO / StateDTO
// (GET /api/v1/locations/countries, GET /api/v1/locations/countries/{iso2}/states).

export interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phoneCode: string | null;
}

export interface State {
  id: number;
  name: string;
  countryId: number;
  iso2: string | null;
  iso3: string | null;
  latitude: number | null;
  longitude: number | null;
}
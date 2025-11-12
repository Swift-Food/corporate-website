export interface StatsToMarket {
  marketId: string;
  distance: number;
  time: number;
}

export interface LocationDto {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: string;
  userId: string | null;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  flat?: string;
  city: string;
  zipcode: string;
  location: LocationDto;
  isDefault: boolean;
  organizationId?: string;
  statsToMarkets: StatsToMarket[];
}

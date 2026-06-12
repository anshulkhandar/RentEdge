'use client';

export interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  area: string;
  price: number; // Monthly rent
  rent: number; // For compatibility
  depositMonths: number;
  deposit: number; // For compatibility
  rentScoreRequired: number;
  beds: number;
  bhk: number;
  baths: number;
  sqft: number;
  images: string[];
  image: string; // For compatibility
  location: string; // For compatibility
  tag: string; // For compatibility
  amenities: string[];
  description: string;
  ownerName: string;
  ownerPhoneMasked: string;
  ownerPhoneFull: string;
}

export const mockProperties: Property[] = [];

export type InterestOption = 'interested' | 'not-interested';

export interface MerchantFormData {
  storeName: string;
  merchantName: string;
  phoneNumber: string;
  address: string;
  pinCode: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  interest: InterestOption | '';
  potentialProblems: string;
}

export interface MerchantFormErrors {
  storeName?: string;
  merchantName?: string;
  phoneNumber?: string;
  address?: string;
  pinCode?: string;
  location?: string;
  interest?: string;
}

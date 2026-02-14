export interface Product {
  id: string;
  model: string; // SKU / Model Number
  name: string;
  category: 'Hardware' | 'Software' | 'Service';
  subCategory: string; // e.g., 'IPC', 'NVR', 'Platform'
  price: string;
  description: string;
  features: string[]; // Marketing highlights (Key Selling Points)
  specs: string[]; // Technical specifications
  imageUrl: string;
  brochureUrl?: string; // External link for full brochure
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string; // External link for case details
}

export interface AppState {
  products: Product[];
  caseStudies: CaseStudy[];
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ImageGenerationParams {
  prompt: string;
  size: ImageSize;
}

export interface CloudSettings {
  enabled: boolean;
  endpointUrl: string; // e.g., https://api.jsonbin.io/v3/b/<BIN_ID>
  apiKey: string;      // Header: X-Master-Key
}

export interface AppData {
  products: Product[];
  cases: CaseStudy[];
  lastUpdated: number;
}

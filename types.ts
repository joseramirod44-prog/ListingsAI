export interface Listing {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  item_type?: string;
  brand?: string;
  condition?: string;
  price?: number;
  tags: string[];
  image_urls: string[];
  ai_metadata: {
    analysis?: string;
    tokensUsed?: number;
    generatedAt?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ListingFormData {
  item_type: string;
  brand: string;
  condition: string;
  price: string;
  additionalInfo: string;
}

export interface AIGeneratedContent {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice?: number;
  analysis: string;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

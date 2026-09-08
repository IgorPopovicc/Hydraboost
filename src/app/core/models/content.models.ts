export interface NavigationItem {
  readonly label: string;
  readonly path: string;
}

export interface ServiceItem {
  readonly id: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly context: string;
  readonly image: string;
  readonly imageSrcset?: string;
  readonly imageAvifSrcset?: string;
  readonly imageAlt: string;
}

export interface PricingItem {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly priceType?: 'fixed' | 'descriptive';
}

export interface PricingCategory {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly items: readonly PricingItem[];
}

export interface PersonalizedPricingPackage {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly introduction: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly price: string;
  readonly cta: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface SeoConfig {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly socialImage: string;
  readonly socialImageAlt: string;
  readonly robots?: string;
  readonly faq?: boolean;
}

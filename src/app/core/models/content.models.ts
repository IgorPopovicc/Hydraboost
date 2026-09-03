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
  readonly imageAlt: string;
}

export interface PricingItem {
  readonly serviceId: string;
  readonly serviceName: string;
  readonly price: string;
  readonly note: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface SeoConfig {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly robots?: string;
  readonly faq?: boolean;
}

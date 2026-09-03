import { PricingItem } from '../models/content.models';

// Jedinstveno mjesto za buduće odobrene cijene. Promijenite samo vrijednost `price`.
export const PRICING: readonly PricingItem[] = [
  { serviceId: 'hidratacija-i-oporavak', serviceName: 'Hidratacija i oporavak', price: 'Cijena na upit', note: 'Prema sastavu terapije i lokaciji dolaska' },
  { serviceId: 'imuno-podrska', serviceName: 'Imuno i vitaminska podrška', price: 'Cijena na upit', note: 'Prema individualno dogovorenom sastavu' },
  { serviceId: 'energija-i-vitalnost', serviceName: 'Energija i vitalnost', price: 'Cijena na upit', note: 'Nakon konsultacije i procjene potreba' },
  { serviceId: 'individualna-terapija', serviceName: 'Individualno prilagođena terapija', price: 'Cijena na upit', note: 'Zavisi od medicinske indikacije i sastava' },
] as const;

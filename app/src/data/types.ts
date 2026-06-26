/**
 * Tipos derivados de la data estática.
 * Single source of truth: los tipos se infieren de los propios datos,
 * así no hay que mantener interfaces en paralelo. Si cambias la data,
 * el tipo se actualiza solo.
 */
import { productsData } from './products';
import { tratamientosData } from './treatments';
import { consentimientosData } from './consents';
import { profesionalesData } from './professionals';
import { consultasData } from './consultations';
import { boxesData } from './boxes';
import { faqData } from './faq';
import { protocolRules, paymentPolicies } from './general';

export type Product = (typeof productsData)[number];
export type Treatment = (typeof tratamientosData)[number];
export type Consent = (typeof consentimientosData)[number];
export type Professional = (typeof profesionalesData)[number];
export type Consultation = (typeof consultasData)[number];
export type Box = (typeof boxesData)[number];
export type FaqItem = (typeof faqData)[number];
export type ProtocolRule = (typeof protocolRules)[number];
export type PaymentPolicy = (typeof paymentPolicies)[number];

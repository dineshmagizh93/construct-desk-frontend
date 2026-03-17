import { apiClient } from './client';

export type PlanName = 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingPeriod = 'monthly' | 'yearly';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export const subscriptionApi = {
  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    planName: PlanName,
    billingPeriod: BillingPeriod,
  ): Promise<CheckoutSessionResponse> {
    console.log('[Subscription API] Creating checkout session:', { planName, billingPeriod });
    try {
      const response = await apiClient.post<CheckoutSessionResponse>('/subscription/checkout', {
        planName,
        billingPeriod,
      });
      console.log('[Subscription API] Checkout session response:', response);
      return response;
    } catch (error: any) {
      console.error('[Subscription API] Error creating checkout session:', error);
      throw error;
    }
  },

  /**
   * Create a Stripe customer portal session
   */
  async createPortalSession(): Promise<PortalSessionResponse> {
    return apiClient.get<PortalSessionResponse>('/subscription/portal');
  },
};

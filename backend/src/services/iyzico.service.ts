import Iyzipay from 'iyzipay';

export const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
});

export interface CheckoutFormRequest {
  orderId: string;
  amount: number;
  currency: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

export const createCheckoutForm = (data: CheckoutFormRequest): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: data.orderId,
      price: data.amount.toFixed(2),
      paidPrice: data.amount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: data.orderId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.WEB_URL}/payment/callback`,
      enabledInstallments: [1, 2, 3, 6],
      buyer: data.buyer,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      basketItems: data.basketItems,
    };

    iyzipay.checkoutFormInitialize.create(request, (err: Error | null, result: Record<string, unknown>) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const retrieveCheckoutForm = (token: string): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      { locale: Iyzipay.LOCALE.TR, token },
      (err: Error | null, result: Record<string, unknown>) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

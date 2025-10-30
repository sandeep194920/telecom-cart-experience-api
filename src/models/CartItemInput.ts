export interface CartItemInput {
  productId: string;
  quantity: number;
  metadata?: {
    planType?: "prepaid" | "postpaid";
    contractLength?: number;
    imei?: string;
  };
}

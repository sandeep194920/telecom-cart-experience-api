export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productType: "device" | "plan" | "addon";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: {
    planType?: "prepaid" | "postpaid";
    dataCap?: string;
    contractLength?: number;
  };
}

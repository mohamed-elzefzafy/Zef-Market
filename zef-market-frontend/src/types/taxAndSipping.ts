export interface ICreateTaxAndSipping {
  taxRate: number;
  shippingPrice: number;
}

export interface ITaxAndSipping {
  _id: string;
  taxRate: number;
  shippingPrice: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

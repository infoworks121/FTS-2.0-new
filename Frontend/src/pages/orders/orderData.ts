export type OrderType = "B2B" | "B2C" | "Bulk";
export type OrderStatus = "Pending" | "Confirmed" | "Packed" | "In Transit" | "Delivered" | "Cancelled";
export type PaymentStatus = "Paid" | "Partially Paid" | "Pending" | "Refunded";

export interface UnifiedOrder {
  id: string;
  orderType: OrderType;
  customer: string;
  district: string;
  orderValue: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdDate: string;
  paymentMode: "UPI" | "Bank Transfer" | "Wallet" | "COD";
  referralImpact: string;
  notes: string;
}

export interface B2BOrder {
  id: string;
  buyer: string;
  seller: string;
  product: string;
  quantity: number;
  margin: number;
  totalValue: number;
  status: "Open" | "Negotiating" | "Approved" | "Shipped";
  capImpact: "Low" | "Medium" | "High";
  referralLinked: boolean;
  sla: string;
}

export interface B2COrder {
  id: string;
  customer: string;
  stockPoint: string;
  product: string;
  deliveryStatus: "Assigned" | "Out for Delivery" | "Delivered" | "Failed";
  paymentMode: "UPI" | "COD" | "Wallet";
  totalAmount: number;
  returnWindowDays: number;
  route: string;
  autoAssigned: boolean;
  rating: string;
}

export interface BulkOrder {
  id: string;
  businessName: string;
  negotiatedMargin: number;
  approvedBy: string;
  volume: number;
  finalPrice: number;
  status: "Pending Approval" | "Approved" | "Rejected" | "Processing";
  riskLevel: "Low" | "Medium" | "High";
  specialPricing: boolean;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  returnReason: string;
  refundAmount: number;
  referralReversal: number;
  status: "Requested" | "Validated" | "Approved" | "Reversed";
  requestedDate: string;
  walletAdjustment: "Pending" | "Applied";
  timeline: string[];
}

export interface TransactionLog {
  id: string;
  source: "Order" | "Refund";
  walletType: "Main" | "Referral" | "Trust" | "Reserve";
  direction: "Credit" | "Debit";
  amount: number;
  timestamp: string;
  linkedOrderId: string;
  reference: string;
}

export interface LedgerEntry {
  entryId: string;
  wallet: "Main" | "Referral" | "Trust" | "Reserve";
  referenceId: string;
  description: string;
  credit: number;
  debit: number;
  runningBalance: number;
  timestamp: string;
}

export const unifiedOrders: UnifiedOrder[] = [
  {
    id: "ORD-90211",
    orderType: "B2B",
    customer: "Mizan Trading",
    district: "Dhaka North",
    orderValue: 125000,
    paymentStatus: "Partially Paid",
    orderStatus: "Confirmed",
    createdDate: "2026-02-18",
    paymentMode: "Bank Transfer",
    referralImpact: "Referral commission reserved",
    notes: "Corporate volume order",
  },
  {
    id: "ORD-90212",
    orderType: "B2C",
    customer: "Rahima Khatun",
    district: "Sylhet",
    orderValue: 4200,
    paymentStatus: "Paid",
    orderStatus: "In Transit",
    createdDate: "2026-02-18",
    paymentMode: "UPI",
    referralImpact: "No referral dependency",
    notes: "Fragile shipment",
  },
  {
    id: "ORD-90213",
    orderType: "Bulk",
    customer: "Hossain Wholesale",
    district: "Khulna",
    orderValue: 560000,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    createdDate: "2026-02-19",
    paymentMode: "Wallet",
    referralImpact: "Referral reversal protected",
    notes: "Negotiated with dynamic cap guard",
  },
  {
    id: "ORD-90214",
    orderType: "B2C",
    customer: "Nusrat Jahan",
    district: "Barisal",
    orderValue: 1890,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    createdDate: "2026-02-17",
    paymentMode: "COD",
    referralImpact: "Auto referral posted",
    notes: "Fast lane delivery",
  },
];

export const b2bOrders: B2BOrder[] = [
  {
    id: "B2B-1451",
    buyer: "Arafat Distributors",
    seller: "Delta Foods",
    product: "Packaged Rice 25kg",
    quantity: 320,
    margin: 8.5,
    totalValue: 445000,
    status: "Approved",
    capImpact: "Medium",
    referralLinked: true,
    sla: "4h left",
  },
  {
    id: "B2B-1452",
    buyer: "Prime Stock Hub",
    seller: "Fresh Agro Ltd",
    product: "Cooking Oil 5L",
    quantity: 500,
    margin: 7.1,
    totalValue: 612500,
    status: "Negotiating",
    capImpact: "High",
    referralLinked: false,
    sla: "1d 2h",
  },
];

export const b2cOrders: B2COrder[] = [
  {
    id: "B2C-3111",
    customer: "Shamim Akter",
    stockPoint: "SP-Dhaka-02",
    product: "Organic Honey",
    deliveryStatus: "Out for Delivery",
    paymentMode: "UPI",
    totalAmount: 950,
    returnWindowDays: 6,
    route: "SP-Dhaka-02 → Mirpur",
    autoAssigned: true,
    rating: "Pending",
  },
  {
    id: "B2C-3112",
    customer: "Farhan Ahmed",
    stockPoint: "SP-Chattogram-01",
    product: "LED Bulb Pack",
    deliveryStatus: "Delivered",
    paymentMode: "COD",
    totalAmount: 1250,
    returnWindowDays: 2,
    route: "SP-Chattogram-01 → Halishahar",
    autoAssigned: true,
    rating: "4.8/5",
  },
];

export const bulkOrders: BulkOrder[] = [
  {
    id: "BLK-2201",
    businessName: "Rahman Hypermarket",
    negotiatedMargin: 6.2,
    approvedBy: "Admin: Samiul",
    volume: 2400,
    finalPrice: 1250000,
    status: "Approved",
    riskLevel: "Low",
    specialPricing: true,
  },
  {
    id: "BLK-2202",
    businessName: "Zed Mart Chain",
    negotiatedMargin: 4.8,
    approvedBy: "Pending",
    volume: 5100,
    finalPrice: 2890000,
    status: "Pending Approval",
    riskLevel: "High",
    specialPricing: true,
  },
];

export const refundRequests: RefundRequest[] = [
  {
    id: "RFD-1001",
    orderId: "ORD-90212",
    returnReason: "Damaged packaging",
    refundAmount: 4200,
    referralReversal: 210,
    status: "Requested",
    requestedDate: "2026-02-19",
    walletAdjustment: "Pending",
    timeline: ["Request Created", "QC Assigned", "Awaiting Finance Reversal"],
  },
  {
    id: "RFD-1002",
    orderId: "ORD-90188",
    returnReason: "Wrong item delivered",
    refundAmount: 1280,
    referralReversal: 64,
    status: "Approved",
    requestedDate: "2026-02-18",
    walletAdjustment: "Applied",
    timeline: ["Request Created", "Validated", "Ledger Reversal Posted"],
  },
];

export const transactionLogs: TransactionLog[] = [
  {
    id: "TXN-77121",
    source: "Order",
    walletType: "Main",
    direction: "Credit",
    amount: 125000,
    timestamp: "2026-02-19 09:21:16",
    linkedOrderId: "ORD-90211",
    reference: "FIN-REF-29A21",
  },
  {
    id: "TXN-77122",
    source: "Refund",
    walletType: "Referral",
    direction: "Debit",
    amount: 210,
    timestamp: "2026-02-19 10:09:44",
    linkedOrderId: "ORD-90212",
    reference: "FIN-REF-29A22",
  },
  {
    id: "TXN-77123",
    source: "Order",
    walletType: "Trust",
    direction: "Credit",
    amount: 5600,
    timestamp: "2026-02-19 10:28:05",
    linkedOrderId: "ORD-90213",
    reference: "FIN-REF-29A23",
  },
];

export const ledgerEntries: LedgerEntry[] = [
  {
    entryId: "LED-20001",
    wallet: "Main",
    referenceId: "FIN-REF-29A21",
    description: "Order settlement posted",
    credit: 125000,
    debit: 0,
    runningBalance: 912500,
    timestamp: "2026-02-19 09:21:16",
  },
  {
    entryId: "LED-20002",
    wallet: "Referral",
    referenceId: "FIN-REF-29A22",
    description: "Refund referral reversal",
    credit: 0,
    debit: 210,
    runningBalance: 120340,
    timestamp: "2026-02-19 10:09:44",
  },
  {
    entryId: "LED-20003",
    wallet: "Trust",
    referenceId: "FIN-REF-29A23",
    description: "Trust allocation from order",
    credit: 5600,
    debit: 0,
    runningBalance: 435600,
    timestamp: "2026-02-19 10:28:05",
  },
];


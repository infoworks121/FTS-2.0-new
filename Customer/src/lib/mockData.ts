// Mock data for FTS Customer Panel

export const currentUser = {
  id: "usr_001",
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "rajesh.kumar@email.com",
  avatar: "",
  city: "Indore",
  pincode: "452001",
  referralCode: "FTS-RAJ2024",
  walletBalance: 4250,
  referralWalletBalance: 1200,
  trustFundBalance: 850,
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled" | "returned";

export const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  pending: { label: "Pending", class: "status-pending" },
  confirmed: { label: "Confirmed", class: "status-primary" },
  processing: { label: "Processing", class: "status-primary" },
  dispatched: { label: "Dispatched", class: "status-cyan" },
  delivered: { label: "Delivered", class: "status-success" },
  cancelled: { label: "Cancelled", class: "status-destructive" },
  returned: { label: "Returned", class: "status-destructive" },
};

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  thumbnail: string;
  images: string[];
  sellingPrice: number;
  mrp: number;
  unit: string;
  sku: string;
  inStock: boolean;
  type: "physical" | "service" | "subscription";
  description: string;
  tags: string[];
  variants?: { name: string; options: string[] }[];
  subscription?: { cycle: string; price: number; trialDays: number }[];
}

export interface OrderItem {
  product: Product;
  variant?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  placedAt: string;
  deliveryAddress: Address;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  fulfilledBy: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline: { step: string; timestamp?: string; completed: boolean }[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  source: string;
  balanceAfter: number;
  timestamp: string;
}

export interface Referral {
  id: string;
  maskedName: string;
  maskedPhone: string;
  joinedDate: string;
  ordersPlaced: number;
  earned: number;
}

export interface Notification {
  id: string;
  type: "order" | "wallet" | "referral" | "system";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  link: string;
}

const productImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop",
];

export const categories = [
  { id: "seeds", name: "Seeds", icon: "Sprout", subCategories: ["Vegetable Seeds", "Fruit Seeds", "Flower Seeds"] },
  { id: "fertilizers", name: "Fertilizers", icon: "Droplets", subCategories: ["Organic", "Chemical", "Bio-fertilizers"] },
  { id: "tools", name: "Farm Tools", icon: "Wrench", subCategories: ["Hand Tools", "Power Tools", "Irrigation"] },
  { id: "pesticides", name: "Pesticides", icon: "Bug", subCategories: ["Insecticides", "Herbicides", "Fungicides"] },
  { id: "machinery", name: "Machinery", icon: "Tractor", subCategories: ["Tractors", "Harvesters", "Tillers"] },
  { id: "livestock", name: "Livestock Feed", icon: "Beef", subCategories: ["Cattle Feed", "Poultry Feed", "Fish Feed"] },
  { id: "tech", name: "AgriTech", icon: "Cpu", subCategories: ["Sensors", "Drones", "Software"] },
  { id: "services", name: "Services", icon: "Headphones", subCategories: ["Soil Testing", "Consultation", "Training"] },
];

export const products: Product[] = [
  {
    id: "prod_001", name: "Premium Hybrid Tomato Seeds (500g)", category: "Seeds", subCategory: "Vegetable Seeds",
    thumbnail: productImages[0], images: productImages.slice(0, 3),
    sellingPrice: 450, mrp: 650, unit: "per pack", sku: "SKU-TOM-500",
    inStock: true, type: "physical",
    description: "High-yield hybrid tomato seeds suitable for all seasons. Disease resistant variety with 95% germination rate.",
    tags: ["organic", "hybrid", "high-yield"], variants: [{ name: "Weight", options: ["250g", "500g", "1kg"] }],
  },
  {
    id: "prod_002", name: "Organic Neem Oil Pesticide (1L)", category: "Pesticides", subCategory: "Insecticides",
    thumbnail: productImages[1], images: productImages.slice(1, 4),
    sellingPrice: 320, mrp: 450, unit: "per bottle", sku: "SKU-NEM-1L",
    inStock: true, type: "physical",
    description: "100% organic neem oil concentrate for pest control. Safe for food crops and beneficial insects.",
    tags: ["organic", "natural", "eco-friendly"],
  },
  {
    id: "prod_003", name: "Solar Drip Irrigation Kit", category: "Farm Tools", subCategory: "Irrigation",
    thumbnail: productImages[2], images: productImages.slice(2, 5),
    sellingPrice: 12500, mrp: 18000, unit: "per kit", sku: "SKU-DRP-SOL",
    inStock: true, type: "physical",
    description: "Complete solar-powered drip irrigation system covering up to 1 acre. Includes solar panel, pump, and drippers.",
    tags: ["solar", "water-saving", "automated"],
  },
  {
    id: "prod_004", name: "Soil Testing Service", category: "Services", subCategory: "Soil Testing",
    thumbnail: productImages[3], images: productImages.slice(3, 6),
    sellingPrice: 999, mrp: 1500, unit: "per test", sku: "SKU-SRV-SOIL",
    inStock: true, type: "service",
    description: "Comprehensive soil analysis report with NPK levels, pH, organic carbon, and recommendations.",
    tags: ["testing", "analysis", "report"],
  },
  {
    id: "prod_005", name: "AgriSense IoT Monitoring Kit", category: "AgriTech", subCategory: "Sensors",
    thumbnail: productImages[4], images: productImages.slice(4, 6),
    sellingPrice: 8999, mrp: 12999, unit: "per kit", sku: "SKU-IOT-MON",
    inStock: true, type: "subscription",
    description: "Smart farming sensor kit with soil moisture, temperature, humidity sensors and cloud dashboard.",
    tags: ["iot", "smart-farming", "monitoring"],
    subscription: [
      { cycle: "Monthly", price: 499, trialDays: 14 },
      { cycle: "Yearly", price: 4999, trialDays: 30 },
    ],
  },
  {
    id: "prod_006", name: "Premium Cattle Feed (50kg)", category: "Livestock Feed", subCategory: "Cattle Feed",
    thumbnail: productImages[5], images: productImages.slice(0, 3),
    sellingPrice: 1800, mrp: 2200, unit: "per bag", sku: "SKU-CTL-50",
    inStock: false, type: "physical",
    description: "Balanced nutrition cattle feed with essential vitamins and minerals for dairy cattle.",
    tags: ["cattle", "nutrition", "dairy"],
  },
  {
    id: "prod_007", name: "NPK 19:19:19 Fertilizer (25kg)", category: "Fertilizers", subCategory: "Chemical",
    thumbnail: productImages[0], images: productImages.slice(0, 3),
    sellingPrice: 890, mrp: 1100, unit: "per bag", sku: "SKU-NPK-25",
    inStock: true, type: "physical",
    description: "Water soluble NPK fertilizer ideal for all crops. Provides balanced nutrition for optimal growth.",
    tags: ["npk", "water-soluble", "all-crops"],
  },
  {
    id: "prod_008", name: "Handheld Garden Sprayer (5L)", category: "Farm Tools", subCategory: "Hand Tools",
    thumbnail: productImages[1], images: productImages.slice(1, 4),
    sellingPrice: 650, mrp: 900, unit: "per piece", sku: "SKU-SPR-5L",
    inStock: true, type: "physical",
    description: "Durable pressure sprayer with adjustable brass nozzle. Ideal for pesticide and fertilizer application.",
    tags: ["sprayer", "manual", "durable"],
  },
];

export const orders: Order[] = [
  {
    id: "ord_001", orderNumber: "FTS-284910", status: "dispatched",
    items: [
      { product: products[0], variant: "500g", quantity: 2, price: 450 },
      { product: products[1], quantity: 1, price: 320 },
    ],
    total: 1290, subtotal: 1220, discount: 50, delivery: 60, tax: 60,
    placedAt: "2024-03-20T10:30:00", paymentMethod: "Online", paymentStatus: "paid",
    fulfilledBy: "Indore Stock Point", carrier: "Delhivery", trackingNumber: "DL839201847IN",
    estimatedDelivery: "2024-03-25",
    deliveryAddress: { id: "addr_1", name: "Rajesh Kumar", phone: "+91 98765 43210", line1: "42, Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452010", isDefault: true },
    timeline: [
      { step: "Order Placed", timestamp: "2024-03-20T10:30:00", completed: true },
      { step: "Confirmed", timestamp: "2024-03-20T11:00:00", completed: true },
      { step: "Dispatched", timestamp: "2024-03-21T14:00:00", completed: true },
      { step: "Out for Delivery", completed: false },
      { step: "Delivered", completed: false },
    ],
  },
  {
    id: "ord_002", orderNumber: "FTS-284832", status: "delivered",
    items: [{ product: products[2], quantity: 1, price: 12500 }],
    total: 13310, subtotal: 12500, discount: 0, delivery: 0, tax: 810,
    placedAt: "2024-03-15T09:00:00", paymentMethod: "Online", paymentStatus: "paid",
    fulfilledBy: "FTS Central", estimatedDelivery: "2024-03-18",
    deliveryAddress: { id: "addr_1", name: "Rajesh Kumar", phone: "+91 98765 43210", line1: "42, Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452010", isDefault: true },
    timeline: [
      { step: "Order Placed", timestamp: "2024-03-15T09:00:00", completed: true },
      { step: "Confirmed", timestamp: "2024-03-15T09:30:00", completed: true },
      { step: "Dispatched", timestamp: "2024-03-16T10:00:00", completed: true },
      { step: "Out for Delivery", timestamp: "2024-03-18T08:00:00", completed: true },
      { step: "Delivered", timestamp: "2024-03-18T14:00:00", completed: true },
    ],
  },
  {
    id: "ord_003", orderNumber: "FTS-284750", status: "pending",
    items: [
      { product: products[6], quantity: 3, price: 890 },
      { product: products[7], quantity: 1, price: 650 },
    ],
    total: 3420, subtotal: 3320, discount: 0, delivery: 100, tax: 0,
    placedAt: "2024-03-22T16:00:00", paymentMethod: "COD", paymentStatus: "pending",
    fulfilledBy: "Indore Stock Point",
    deliveryAddress: { id: "addr_1", name: "Rajesh Kumar", phone: "+91 98765 43210", line1: "42, Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452010", isDefault: true },
    timeline: [
      { step: "Order Placed", timestamp: "2024-03-22T16:00:00", completed: true },
      { step: "Confirmed", completed: false },
      { step: "Dispatched", completed: false },
      { step: "Out for Delivery", completed: false },
      { step: "Delivered", completed: false },
    ],
  },
];

export const addresses: Address[] = [
  { id: "addr_1", name: "Rajesh Kumar", phone: "+91 98765 43210", line1: "42, Vijay Nagar", line2: "Near MR-10 Junction", city: "Indore", state: "Madhya Pradesh", pincode: "452010", isDefault: true },
  { id: "addr_2", name: "Rajesh Kumar", phone: "+91 98765 43210", line1: "Farm House, Sanwer Road", line2: "Village Umaria", city: "Indore", state: "Madhya Pradesh", pincode: "453555", isDefault: false },
];

export const walletTransactions: WalletTransaction[] = [
  { id: "txn_001", type: "credit", amount: 1290, description: "Refund for Order FTS-284650", source: "refund", balanceAfter: 4250, timestamp: "2024-03-19T12:00:00" },
  { id: "txn_002", type: "debit", amount: 2000, description: "Order Payment FTS-284832", source: "order", balanceAfter: 2960, timestamp: "2024-03-15T09:05:00" },
  { id: "txn_003", type: "credit", amount: 500, description: "Referral Bonus - Suresh joined", source: "referral", balanceAfter: 4960, timestamp: "2024-03-12T16:00:00" },
  { id: "txn_004", type: "debit", amount: 1500, description: "Withdrawal to Bank", source: "withdrawal", balanceAfter: 4460, timestamp: "2024-03-10T10:00:00" },
  { id: "txn_005", type: "credit", amount: 250, description: "Cashback on Order FTS-284600", source: "cashback", balanceAfter: 5960, timestamp: "2024-03-08T14:30:00" },
];

export const referrals: Referral[] = [
  { id: "ref_001", maskedName: "Suresh ***45", maskedPhone: "***210", joinedDate: "2024-03-10", ordersPlaced: 3, earned: 500 },
  { id: "ref_002", maskedName: "Priya ***89", maskedPhone: "***876", joinedDate: "2024-02-28", ordersPlaced: 5, earned: 350 },
  { id: "ref_003", maskedName: "Anil ***23", maskedPhone: "***543", joinedDate: "2024-02-15", ordersPlaced: 1, earned: 150 },
  { id: "ref_004", maskedName: "Kavita ***67", maskedPhone: "***321", joinedDate: "2024-01-20", ordersPlaced: 8, earned: 200 },
];

export const notifications: Notification[] = [
  { id: "n_001", type: "order", title: "Order Dispatched", body: "Your order FTS-284910 has been dispatched via Delhivery.", timestamp: "2024-03-21T14:00:00", read: false, link: "/orders/ord_001" },
  { id: "n_002", type: "wallet", title: "Refund Credited", body: "₹1,290 has been credited to your wallet for order FTS-284650.", timestamp: "2024-03-19T12:00:00", read: false, link: "/wallet" },
  { id: "n_003", type: "referral", title: "Referral Bonus!", body: "You earned ₹500 from Suresh's first order.", timestamp: "2024-03-12T16:00:00", read: true, link: "/referrals" },
  { id: "n_004", type: "system", title: "New Products Available", body: "Check out the latest AgriTech products in our marketplace.", timestamp: "2024-03-10T09:00:00", read: true, link: "/marketplace" },
  { id: "n_005", type: "order", title: "Order Delivered", body: "Your order FTS-284832 has been delivered successfully.", timestamp: "2024-03-18T14:00:00", read: true, link: "/orders/ord_002" },
];

export const spendingData = [
  { month: "Oct", amount: 5200 },
  { month: "Nov", amount: 8400 },
  { month: "Dec", amount: 3100 },
  { month: "Jan", amount: 6700 },
  { month: "Feb", amount: 9200 },
  { month: "Mar", amount: 4800 },
];

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

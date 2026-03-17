export type WalletBalanceSnapshot = {
  mainBalance: number;
  referralBalance: number;
  pendingLockedAmount: number;
  withdrawableAmount: number;
  lastTransactionAt: string;
  lastTransactionId: string;
  lastTransactionType: "Credit" | "Debit";
  lastTransactionAmount: number;
  withdrawalBlockedReason: string | null;
  hasPendingWithdrawal: boolean;
};

export type LedgerTransactionType = "Credit" | "Debit";
export type LedgerSource = "Order" | "Referral" | "Withdrawal" | "Adjustment";
export type LedgerStatus = "Completed" | "Reversed";

export type LedgerRow = {
  id: string;
  dateTime: string;
  transactionId: string;
  type: LedgerTransactionType;
  source: LedgerSource;
  amount: number;
  balanceAfter: number;
  status: LedgerStatus;
};

export type WithdrawalStatus = "Pending" | "Approved" | "Rejected" | "Paid";

export type WithdrawalHistoryRow = {
  requestId: string;
  requestDate: string;
  amountRequested: number;
  tdsAmount: number;
  processingFee: number;
  netAmount: number;
  status: WithdrawalStatus;
  adminRemarks: string;
  timeline: Array<{
    label: string;
    at: string;
    state: "completed" | "current" | "upcoming";
  }>;
};

export const walletSnapshot: WalletBalanceSnapshot = {
  mainBalance: 286450,
  referralBalance: 38420,
  pendingLockedAmount: 19500,
  withdrawableAmount: 112300,
  lastTransactionAt: "2026-02-22 17:35",
  lastTransactionId: "TXN-BW-882901",
  lastTransactionType: "Credit",
  lastTransactionAmount: 8400,
  withdrawalBlockedReason: null,
  hasPendingWithdrawal: false,
};

export const withdrawalRules = {
  minWithdrawalAmount: 1000,
  tdsRate: 0.05,
  processingFeeRate: 0.01,
  tdsRuleLabel: "TDS 5% as per applicable tax rule",
  processingFeeRuleLabel: "Processing fee 1% + GST included",
  approvalNotice: "Withdrawals are subject to admin approval",
  deductionNotice: "TDS & fees may apply",
};

export const bankDetails = {
  accountHolder: "Ramesh Kumar",
  bankName: "State Bank of India",
  accountNumberMasked: "XXXXXX5419",
  ifscMasked: "SBINXXXX120",
};

export const ledgerRows: LedgerRow[] = [
  {
    id: "L-001",
    dateTime: "2026-02-22 17:35",
    transactionId: "TXN-BW-882901",
    type: "Credit",
    source: "Order",
    amount: 8400,
    balanceAfter: 286450,
    status: "Completed",
  },
  {
    id: "L-002",
    dateTime: "2026-02-22 11:12",
    transactionId: "TXN-BW-882876",
    type: "Debit",
    source: "Withdrawal",
    amount: -15000,
    balanceAfter: 278050,
    status: "Completed",
  },
  {
    id: "L-003",
    dateTime: "2026-02-21 19:48",
    transactionId: "TXN-BW-882610",
    type: "Credit",
    source: "Referral",
    amount: 1250,
    balanceAfter: 293050,
    status: "Completed",
  },
  {
    id: "L-004",
    dateTime: "2026-02-21 16:26",
    transactionId: "TXN-BW-882551",
    type: "Debit",
    source: "Adjustment",
    amount: -500,
    balanceAfter: 291800,
    status: "Reversed",
  },
  {
    id: "L-005",
    dateTime: "2026-02-20 14:10",
    transactionId: "TXN-BW-882209",
    type: "Credit",
    source: "Order",
    amount: 9200,
    balanceAfter: 292300,
    status: "Completed",
  },
  {
    id: "L-006",
    dateTime: "2026-02-20 10:04",
    transactionId: "TXN-BW-882122",
    type: "Debit",
    source: "Withdrawal",
    amount: -12000,
    balanceAfter: 283100,
    status: "Completed",
  },
];

export const withdrawalHistoryRows: WithdrawalHistoryRow[] = [
  {
    requestId: "WD-BM-260222-01",
    requestDate: "2026-02-22 09:30",
    amountRequested: 25000,
    tdsAmount: 1250,
    processingFee: 250,
    netAmount: 23500,
    status: "Pending",
    adminRemarks: "Awaiting maker-checker approval.",
    timeline: [
      { label: "Requested", at: "2026-02-22 09:30", state: "completed" },
      { label: "Under Review", at: "2026-02-22 09:45", state: "current" },
      { label: "Approved", at: "Pending", state: "upcoming" },
      { label: "Paid", at: "Pending", state: "upcoming" },
    ],
  },
  {
    requestId: "WD-BM-260214-04",
    requestDate: "2026-02-14 15:10",
    amountRequested: 30000,
    tdsAmount: 1500,
    processingFee: 300,
    netAmount: 28200,
    status: "Paid",
    adminRemarks: "Paid to registered bank account.",
    timeline: [
      { label: "Requested", at: "2026-02-14 15:10", state: "completed" },
      { label: "Under Review", at: "2026-02-15 10:20", state: "completed" },
      { label: "Approved", at: "2026-02-15 16:05", state: "completed" },
      { label: "Paid", at: "2026-02-16 11:45", state: "completed" },
    ],
  },
  {
    requestId: "WD-BM-260208-02",
    requestDate: "2026-02-08 12:40",
    amountRequested: 18000,
    tdsAmount: 900,
    processingFee: 180,
    netAmount: 16920,
    status: "Rejected",
    adminRemarks: "Rejected: KYC mismatch in beneficiary account details.",
    timeline: [
      { label: "Requested", at: "2026-02-08 12:40", state: "completed" },
      { label: "Under Review", at: "2026-02-08 17:25", state: "completed" },
      { label: "Rejected", at: "2026-02-09 09:10", state: "current" },
      { label: "Paid", at: "Not applicable", state: "upcoming" },
    ],
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);


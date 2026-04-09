# FTS 2.0 - Core Body Implementation Roadmap
এই ফাইলটি Core Body মডিউলের সম্পন্ন হওয়া কাজ এবং পরবর্তী কাজের ধারাবাহিকতার (Roadmap) বিস্তারিত বিবরণ।

---

## ✅ সম্পন্ন হওয়া কাজ (Completed Tasks)

### 1. Database & Schema
- `core_body_profiles` এবং `core_body_installments` টেবিল তৈরি।
- Core Body (A+B) এর সংখ্যা ২০ জনের মধ্যে সীমাবদ্ধ রাখতে ডিস্ট্রিক্ট কোটা `check_core_body_district_quota()` Trigger ইমপ্লিমেন্ট করা হয়েছে।

### 2. Backend (APIs)
- `coreBodyProfileRoutes.js` এবং `coreBodyProfileController.js` যুক্ত করা হয়েছে।
- তৈরিকৃত API এন্ডপয়েন্টসমূহ:
  - `GET /profile`: প্রোফাইল তথ্য, ইনকাম ক্যাপ এবং ইনভেস্টমেন্ট দেখার জন্য।
  - `PUT /profile`: ইনভেস্টমেন্ট এমাউন্ট এবং কিস্তির সংখ্যা আপডেট করার জন্য।
  - `GET /dashboard`: ড্যাশবোর্ড স্ট্যাটিস্টিকস।
  - `POST /installment/pay`: কিস্তির পেমেন্ট সাবমিট করার জন্য (প্রাথমিক ভার্সন)।
  - `GET /reports`: রিপোর্ট জেনারেট করার জন্য।

### 3. Frontend (UI/UX)
- `CoreBodyDashboard.tsx`: ড্যাশবোর্ড ডিজাইন, ক্যাপ লিমিট প্রগ্রেস বার, এবং চার্ট তৈরি হয়েছে (Mock data bypass)।
- `CoreBodyList.tsx`: অ্যাডমিন প্যানেলে Core Body-দের লিস্ট, ফিল্টার এবং KPI কার্ড তৈরি হয়েছে।
- Core Body-দের জন্য নেভিগেশন সাইডবার যুক্ত করা হয়েছে।

---

## 🚀 পরবর্তী কাজের ধারাবাহিকতা (Next Steps & Priority Workflow)

কাজগুলো নিচের সিকোয়েন্সে (১ থেকে ৪) করলে ব্যাকএন্ড ও ফ্রন্টএন্ড সহজে কানেক্টেড হবে:

### 🔴 Step 1: Admin Verification & Core Body Onboarding (প্রথম ধাপে করণীয়)
পেমেন্ট করে সিস্টেমে এক্টিভ হওয়ার সম্পূর্ণ ফ্লো তৈরি করা।
1. **Backend:** `POST /installment/pay` এপিআই-তে স্ট্যাটাস সরাসরি `paid` না করে `pending_approval` করতে হবে।
2. **Backend:** নতুন এপিআই `PUT /admin/corebody/approve-installment` তৈরি করতে হবে যেন অ্যাডমিন পেমেন্ট ভেরিফাই করতে পারে।
3. **Frontend:** অ্যাডমিন প্যানেলে 'Pending Approvals' লিস্ট তৈরি করে সেখান থেকে কিস্তি/ইনভেস্টমেন্ট এপ্রুভ বা রিজেক্ট করার ফিচার যুক্ত করতে হবে।

### 🟡 Step 2: Core Body Stock Inventory & Issue Flow
স্টক ইস্যু ও ইনভেন্টরি প্লাস-মাইনাস ম্যানেজমেন্ট তৈরি করা।
1. **Frontend:** Core Body থেকে Dealer-এর কাছে স্টক পাঠানোর `IssueStock.tsx` পেজটি লাইভ এপিআই-এর সাথে কানেক্ট করতে হবে।
2. **Backend:** ডাটাবেসের `inventory_balances` টেবিল আপডেট করা। (Core Body এর স্টক মাইনাস হবে, Dealer এর স্টক প্লাস হবে)।
3. **Frontend:** `IssuedStockHistory.tsx` এবং `StockMovementReport.tsx` পেজগুলোকে ডায়নামিক ডাটা দিয়ে কানেক্ট করা। 

### 🔵 Step 3: Wallet Account & Profit Engine Integration
রিয়েল ইনকাম এবং প্রফিট ড্যাশবোর্ডে দেখানো ও টাকা উত্তোলনের ফ্লো।
1. **Frontend:** `CoreBodyDashboard.tsx` পেজে ڈেমো ডেটা সরিয়ে প্রফিট ইঞ্জিন থেকে পাওয়া রিয়েল 'YTD Earnings', 'MTD Earnings' এবং 'Cap Hit %' दिखाना।
2. **Frontend & Backend:** `WithdrawalRequest.tsx` পেজটি রিয়েল এপিআই দিয়ে করা, যাতে Core Body পেমেন্ট রিকুয়েস্ট দিতে পারে এবং তা অ্যাডমিনের কাছে পৌঁছায়।

### 🟢 Step 4: Dealer Performance & SLA (Service Level Agreement)
অর্ডার ডেলিভারির পারফরম্যান্স মনিটরিং।
1. **Backend:** ডিলারদের ডেলিভারি টাইমের উপর ভিত্তি করে SLA ক্যালকুলেশনের অরিজিনাল লজিক ইমপ্লিমেন্ট করা (বর্তমান `Math.random()` დেমো ডাটা সরিয়ে রিয়েল-টাইম ডাটা যুক্ত করা)।

---

*বিঃদ্রঃ এই ফাইলটি আপনার প্রজেক্টের কাজের একটি স্বচ্ছ ধারণা রাখার গাইডলাইন হিসেবে তৈরি করা হয়েছে। 1st Step দিয়ে কাজ শুরু করাই হবে সবচেয়ে যৌক্তিক।*

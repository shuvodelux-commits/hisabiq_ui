/** Exact validation messages are stable copy keys; domain validation stays language independent. */
const sourceDeleteErrors: Record<string, string> = {
  "Recovery permission denied. Settings session is unavailable.": "অনুমতি যাচাই করা যায়নি। সেটিংস সেশন পাওয়া যাচ্ছে না।",
  "Current actor lacks permission for this module.": "এই মডিউলে বর্তমান ব্যবহারকারীর অনুমতি নেই।",
  "No verified original source delete command is connected.": "মূল লেনদেন মোছার যাচাইকৃত নিরাপদ নির্দেশ সংযুক্ত নেই।",
  "Resolve linked returns before reversing this source.": "এই মূল লেনদেন উল্টো করার আগে সংযুক্ত ফেরতগুলো সমাধান করুন।",
  "Enter a reason for the source cancellation or reversal.": "মূল লেনদেন বাতিল বা উল্টো করার কারণ লিখুন।",
  "Source belongs to another business tenant.": "মূল লেনদেনটি অন্য ব্যবসার।",
  "Transaction changed or reversed. Reopen source review.": "লেনদেন বদলেছে বা উল্টো করা হয়েছে। মূল লেনদেনের পর্যালোচনা আবার খুলুন।",
  "Use the original two-account transfer review.": "মূল দুই অ্যাকাউন্টের স্থানান্তর পর্যালোচনা ব্যবহার করুন।",
  "Complete original payment account identities and amounts are required.": "মূল পেমেন্ট অ্যাকাউন্টের সম্পূর্ণ পরিচয় ও পরিমাণ প্রয়োজন।",
  "Transfer changed. Reopen source review.": "স্থানান্তর বদলেছে। মূল লেনদেনের পর্যালোচনা আবার খুলুন।",
  "Both original account identities are required.": "মূল দুই অ্যাকাউন্টের পরিচয় প্রয়োজন।",
  "Transfer is already reversed.": "স্থানান্তর ইতোমধ্যে উল্টো করা হয়েছে।",
  "Choose an active expense.": "সক্রিয় খরচ বেছে নিন।",
  "Enter a reason for cancellation.": "বাতিল করার কারণ লিখুন।",
  "Expense changed. Reopen the source review.": "খরচ বদলেছে। মূল লেনদেনের পর্যালোচনা আবার খুলুন।",
  "Only an active original manual voucher can be deleted here.": "এখানে শুধু সক্রিয় মূল ম্যানুয়াল ভাউচার মোছা যাবে।",
  "Source changed. Reopen review.": "মূল লেনদেন বদলেছে। পর্যালোচনা আবার খুলুন।",
  "Enter a reason for deleting this entry": "এই এন্ট্রি মোছার কারণ লিখুন।",
  "Write a correction reason of at least 5 characters.": "সংশোধনের কারণ অন্তত ৫ অক্ষরে লিখুন।",
  "No original ledger event is selected.": "মূল লেজার ইভেন্ট বেছে নেওয়া হয়নি।",
  "Select the Vendor source to correct.": "সংশোধনের জন্য ভেন্ডরের মূল লেনদেন বেছে নিন।",
  "Corrected quantity must be positive.": "সংশোধিত পরিমাণ শূন্যের বেশি হতে হবে।",
  "Cost must be positive with at most two decimal places, or blank for Price pending.": "দাম সর্বোচ্চ দুই দশমিকসহ শূন্যের বেশি লিখুন, অথবা দাম বাকি থাকলে খালি রাখুন।"
};
export function sourceDeleteErrorCopy(error: unknown, text: (english: string, bangla: string) => string, fallback?: (message: string) => string): string {
 const message = error instanceof Error ? error.message : String(error);
 const bangla = sourceDeleteErrors[message];
 return bangla ? text(message, bangla) : fallback ? fallback(message) : text(message || 'Could not complete the source operation. Reopen the review and try again.', 'মূল লেনদেনের কাজ সম্পন্ন হয়নি। পর্যালোচনা আবার খুলে চেষ্টা করুন।');
}

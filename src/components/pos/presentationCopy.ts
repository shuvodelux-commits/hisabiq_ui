/** POS presentation only: domain errors and stored codes remain unchanged. */
const errorBangla:Record<string,string>={
 'Select or create a saved customer before selling on installments.':'কিস্তিতে বিক্রির আগে রাখা ক্রেতা বাছুন বা নতুন ক্রেতা যোগ করুন।',
 'Customer name is required.':'ক্রেতার নাম লিখুন।',
 'Enter a valid positive selling price.':'শূন্যের বেশি সঠিক বিক্রির দাম দিন।',
 'Down payment must be a valid nonnegative amount.':'প্রথম জমা শূন্য বা তার বেশি সঠিক টাকা হতে হবে।',
 'Down payment exceeds selling price.':'প্রথম জমা বিক্রির দামের বেশি হয়েছে।',
 'No remaining installment balance; use Regular Sale for a fully paid sale.':'কিস্তিতে বাকি নেই; পুরো টাকা পেলে সাধারণ বিক্রি বাছুন।',
 'Scheduled installment total does not match the remaining balance.':'কিস্তির মোট বাকি টাকার সাথে মিলছে না।',
 'At least one installment is required.':'অন্তত একটি কিস্তি রাখুন।',
 'Duplicate installment row.':'একই কিস্তি আবার দেওয়া হয়েছে।',
 'Due dates must follow strictly increasing sequence.':'প্রতিটি কিস্তির তারিখ আগেরটির পরে দিন।',
 'Due date must be YYYY-MM-DD.':'কিস্তির তারিখ বছর-মাস-দিন হিসেবে দিন।',
 'Choose a valid due date.':'কিস্তির সঠিক তারিখ বাছুন।',
 'Installment count must be positive.':'কিস্তির সংখ্যা শূন্যের বেশি দিন।',
 'Installment count must be between 1 and 120.':'কিস্তির সংখ্যা ১ থেকে ১২০-এর মধ্যে দিন।',
 'Too many installments for the remaining amount.':'বাকি টাকার তুলনায় কিস্তির সংখ্যা বেশি।',
 'Correct invalid installment amounts first.':'আগে কিস্তির ভুল টাকা ঠিক করুন।',
 'Choose fewer installments.':'কিস্তির সংখ্যা কমান।',
 'At least one and at most 120 installments are supported.':'১ থেকে ১২০টি কিস্তি রাখা যাবে।',
 'Manually edited installment amounts exceed remaining balance.':'বদলানো কিস্তির টাকা মোট বাকি টাকার বেশি।',
 'All installment amounts are manually edited; unlock a row before rebalancing.':'সব কিস্তির টাকা আলাদা করে বদলানো হয়েছে; বাকি মেলাতে আগে একটি লাইন মুক্ত করুন।',
 'Scheduled total exceeds supported amount range.':'কিস্তির মোট সমর্থিত সীমার বেশি।',
 'Remaining balance must be nonnegative whole paisa.':'বাকি টাকা শূন্য বা তার বেশি পূর্ণ পয়সা হতে হবে।',
 'Unable to rebalance installments.':'কিস্তির বাকি মেলানো যায়নি।',
 'Unable to reset schedule.':'কিস্তির তালিকা রিসেট করা যায়নি।',
 'Unable to add installment.':'কিস্তি যোগ করা যায়নি।',
 'Schedule could not be revised.':'কিস্তির সময় বদলানো যায়নি।',
 'Cannot reverse receipt preview.':'জমার প্রিভিউ বাতিল করা যায়নি।',
 'Historical sale-line quantity and return evidence are missing.':'পুরোনো বিক্রির পরিমাণ ও ফেরতের তথ্য নেই।',
 'Historical line evidence does not reconcile to the agreement.':'পুরোনো লাইনের তথ্য কিস্তির বিক্রির সাথে মেলে না।',
 'Historical line evidence differs from the original source.':'পুরোনো লাইনের তথ্য মূল উৎসের সাথে মেলে না।',
 'Historical bundle recipe is missing.':'পুরোনো প্যাকেজের পণ্যের তথ্য নেই।',
 'Services require an authorized settlement, not stock return.':'সেবার জন্য অনুমোদিত সমন্বয় প্রয়োজন; স্টক ফেরত প্রযোজ্য নয়।',
 'Could not create Vendor.':'ভেন্ডর যোগ করা যায়নি।',
 'Cannot add Vendor':'ভেন্ডর যোগ করা যাচ্ছে না।',
 'Name is required.':'নাম লিখুন।',
 'Party name is required.':'পার্টির নাম লিখুন।',
 'Enter a valid phone number.':'সঠিক ফোন নম্বর দিন।',
};
export function posPresentationError(message:string,copy:(english:string,bangla:string)=>string):string{
 if(errorBangla[message])return copy(message,errorBangla[message]);
 const amount=/^Installment (\d+) amount must be positive whole paisa\.$/.exec(message);
 if(amount)return copy(message,`কিস্তি ${amount[1]} এর টাকা শূন্যের বেশি পূর্ণ পয়সা হতে হবে।`);
 const date=/^Installment (\d+) has an invalid due date\.$/.exec(message);
 if(date)return copy(message,`কিস্তি ${date[1]} এর সঠিক তারিখ দিন।`);
 return message;
}

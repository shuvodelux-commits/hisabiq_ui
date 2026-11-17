export type RecoveryCopy=(english:string,bangla:string)=>string;
const kinds:Record<string,[string,string]>={
 'sales-draft':['Sales draft','বিক্রয়ের খসড়া'],'sale-template':['Sale template','বিক্রয়ের নমুনা'],'purchase-draft':['Purchase draft','ক্রয়ের খসড়া'],quotation:['Quotation','মূল্য প্রস্তাব'],'online-order':['Online order','অনলাইন অর্ডার'],product:['Product','পণ্য'],party:['Party','পার্টি'],'party-note':['Party note','পার্টির নোট']
};
export function recoveryKind(kind:string,text:RecoveryCopy){const copy=kinds[kind];return copy?text(...copy):text('Record','তথ্য');}
const restrictions:Record<string,string>={
 'Product unavailable.':'পণ্য পাওয়া যাচ্ছে না।','Party unavailable.':'পার্টি পাওয়া যাচ্ছে না।',
 'Historical use of this sample product cannot be fully verified. Deactivate it instead.':'এই নমুনা পণ্যের আগের ব্যবহার পুরোপুরি যাচাই করা যায়নি। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Historical use across this sample party’s roles cannot be fully verified. Deactivate it instead.':'এই নমুনা পার্টির সব সম্পর্কের আগের ব্যবহার যাচাই করা যায়নি। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Product has stock or inventory/sale history. Deactivate it instead.':'পণ্যের মজুত বা আগের মজুত/বিক্রয়ের তথ্য আছে। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Product has purchase or vendor source history.':'পণ্যের ক্রয় বা ভেন্ডর লেনদেনের ইতিহাস আছে।',
 'Product is a package component.':'পণ্যটি একটি প্যাকেজের অংশ।',
 'Product is referenced by another source. Deactivate it instead.':'অন্য তথ্যে এই পণ্যের উল্লেখ আছে। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Party has source or financial history across its roles. Deactivate it instead.':'পার্টির সম্পর্কগুলোতে আগের তথ্য বা আর্থিক ইতিহাস আছে। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Party has expense, finance, purchase or vendor history.':'পার্টির খরচ, অর্থ, ক্রয় বা ভেন্ডর লেনদেনের ইতিহাস আছে।',
 'Party is referenced by another source.':'অন্য তথ্যে এই পার্টির উল্লেখ আছে।',
 'Party is referenced by a sale source.':'বিক্রয়ের তথ্যে এই পার্টির উল্লেখ আছে।',
 'Party has customer credit history. Deactivate it instead.':'পার্টির ক্রেতার জমা টাকার ইতিহাস আছে। পরিবর্তে নিষ্ক্রিয় করুন।',
 'Recovery permission denied.':'উদ্ধারের অনুমতি নেই।','Restore permission denied.':'ফিরিয়ে আনার অনুমতি নেই।',
 'Source belongs to another business.':'উৎসটি অন্য ব্যবসার।','Source adapter unavailable.':'এই উৎসের উদ্ধার সেবা পাওয়া যাচ্ছে না।',
 'Recovery record unavailable for this business.':'এই ব্যবসায় উদ্ধারের তথ্য পাওয়া যাচ্ছে না।',
 'Source no longer exists.':'উৎসটি আর নেই।','Source changed. Reopen its review.':'উৎস বদলেছে। আবার পর্যালোচনা খুলুন।',
 'The 30-day recovery window has expired.':'উদ্ধারের ৩০ দিনের মেয়াদ শেষ হয়েছে।','Original identity already exists.':'আগের পরিচয়ের তথ্য ইতিমধ্যে আছে।',
 'SKU already exists.':'এই SKU ইতিমধ্যে আছে।','Phone already exists.':'এই ফোন নম্বর ইতিমধ্যে আছে।',
 'A package component is unavailable.':'প্যাকেজের একটি অংশ পাওয়া যাচ্ছে না।','A source product is unavailable.':'উৎসের একটি পণ্য পাওয়া যাচ্ছে না।',
 'The original party is unavailable.':'আগের পার্টি পাওয়া যাচ্ছে না।','The original supplier is unavailable.':'আগের সরবরাহকারী পাওয়া যাচ্ছে না।',
 'Only draft quotations may be deleted.':'শুধু খসড়া মূল্য প্রস্তাব মুছতে পারবেন।',
 'Only unused, unpaid draft orders may be recovered. Use the lifecycle action for progressed orders.':'শুধু অব্যবহৃত ও অপরিশোধিত খসড়া অর্ডার উদ্ধারযোগ্য। এগিয়ে যাওয়া অর্ডারে তার অবস্থার কাজ ব্যবহার করুন।',
 'Only an authorized owner may permanently delete.':'শুধু অনুমোদিত মালিক স্থায়ীভাবে মুছতে পারবেন।',
 'Type the exact confirmation text.':'নিশ্চিতকরণের লেখাটি হুবহু লিখুন।','Only deleted records may be purged.':'শুধু মুছে ফেলা তথ্য স্থায়ীভাবে মুছতে পারবেন।',
 'Record already restored.':'তথ্যটি ইতিমধ্যে ফিরিয়ে আনা হয়েছে।','Record already purged.':'তথ্যটি ইতিমধ্যে স্থায়ীভাবে মোছা হয়েছে।',
 'Recovery permission denied. Settings session is unavailable.':'উদ্ধারের অনুমতি নেই। সেটিংস সেশন পাওয়া যাচ্ছে না।'
};
export function recoveryMessage(message:string,text:RecoveryCopy){const clean=message.replace(/^Error: /,'');return text(clean,restrictions[clean]??'এই কাজটি করা যায়নি। উৎস ও অনুমতি যাচাই করে আবার চেষ্টা করুন।');}
export function recoveryRestriction(message:string|undefined,text:RecoveryCopy){return message?recoveryMessage(message,text):undefined;}

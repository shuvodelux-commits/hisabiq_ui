# UI-to-wire field decisions

All backend names below are existing unless marked PROPOSED. Frontend model declarations: [erp.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/types/erp.ts); product form state is in `src/components/products/form/useAddProductForm.ts`; purchase form state in `src/pages/PurchaseEditor.tsx`. Exact schemas, limits, defaults and inherited fields are linked in the sibling contract indexes. This is the resolved core mapping, not a claim that every field in every settings/SaaS screen has a completed mapping.

`∅` means **no compatible current field**. It blocks live feature cutover, never permits silent omission. UI-only presentation/draft fields remain local with explicit ownership. A source amount missing because of permission must stay absent, not become numeric zero.

## Product and catalog

| UI field / type | Backend field / API type | Conversion | Validation | Null/default and preservation |
|---|---|---|---|---|
| Product.id: string | id: ULID | identity from real reply | 26-char real ID; reject p1 | Never match only by name |
| name: string | name: string | trim | 1–200 | Required |
| nameBn?: string | ∅; PROPOSED nameBn | trimmed Unicode | See EXTENSIONS | Never put into description |
| kind?: Stock/Service/Bundle | ∅ | None | Distinct stock/revenue rules | Undefined current UI means ordinary Stock; Service/Bundle cutover blocked |
| sku: string | sku: string/null | blank→null | max60 | Null read→empty UI input |
| brand?: string | brandId: ULID/null; brandName: string/null | selected master ID | tenant-owned | display label is never an ID |
| category: string | categoryId: ULID/null; categoryName | selected master ID | same tenant, two-level hierarchy | Preserve current labels; blank→null |
| unit: string | baseUnitId; baseUnitName | real unit ID | tenant-owned | Pcs/Piece aliases for display only |
| altUnit.unit: string | conversionUnitId: ULID/null | selected ID | paired factor | Both fields null when absent |
| altUnit.factor: number | conversionFactorQty: integer | exact base-factor ×1000 | positive, safe; no rounding | Only single-alternate compatibility |
| altUnit.price?: number | ∅ independent unit price | None | D03/D16 | Do not replace with base price ×factor |
| unitRelations?: UnitRelation[] | ∅ ordered chain | Proposed ordered unit levels | unique unit IDs, positive exact factors | D03; 3–4 unit UI retained |
| unitSellPrices / unitPurchasePrices | ∅ | None | independently entered prices | D03/D16 release prerequisite |
| stockViewUnit?: string | ∅ display preference | user/tenant preference with stable unit ID | must be in product unit chain | Does not change stock quantity |
| sellPrice: number | sellingPriceMinor: integer | parse raw text scale2 | nonnegative safe integer | Required; no formatted string |
| purchasePrice: number | purchasePriceMinor: integer | raw text scale2 | same; cost permission | Response omission is not 0 |
| minStock: number | minStockQty: integer | raw text scale3 | ≥0 | Base quantity |
| stock: number | stockQty: integer (response only) | divide by1000 for display | server-derived movements | Never send as product save stock |
| useDefaultPriceForAllLots?: boolean | ∅ | D04 extension | explicit policy | Current lot policy retained |
| active: boolean | status: ACTIVE/INACTIVE | enum map | status action endpoint | create SaveProductRequest does not take status |
| image?: string | hasImage; authenticated image bytes | blob URL | supported MIME/size | no image = 404/fallback initials |
| images?: string[] | ∅ gallery | None | source-owned attachments required | Keep gallery; one thumbnail is not gallery parity |
| serialTracking: Off/Optional/Required | tracksSerial: boolean | only Off→false/Required→true are compatible | Optional is not Required | D04; no boolean coercion of Optional |
| warranty.duration/unit/type/terms | warrantyMonths, supplierWarrantyMonths | months direct; years×12 only if within limit | 1–600 months | Days/type/terms have no current equivalent |
| expiry.enabled | tracksExpiry: boolean | direct | backend feature gate | other expiry policy fields remain unmatched |
| expiry.dateRequired/warningDays/allocationMethod | ∅ per-product policy | D04 | do not replace with global policy silently | Preserve current controls |
| ProductOffer[] | single product offerEnabled/offerPriceMinor/offerStartDate/offerEndDate | only one compatible offer after explicit selection | tenant-local dates | scheduled multiple offers require extension |
| default line discount | defaultDiscountType / defaultDiscountValue | Fixed→FIXED_AMOUNT (poisha); Percentage→PERCENTAGE (hundredths percent) | actual discount rules | null for absent |
| ProductUnitOption.name | unit.name: string | trim | catalogNameSchema max120 | required |
| ProductUnitOption.nameBn | ∅; PROPOSED unit.nameBn | Unicode text | EXTENSIONS | blank→null |
| ProductUnitOption.symbol | ∅; PROPOSED unit.symbol | trim | existing validUnitSymbol 1–4 nonspace | stable unit key does not become symbol |
| ProductUnitOption.value / aliases | ∅ display compatibility keys | local legacy alias mapping only | cannot use as server identity | Preserve historical labels |
| optimistic product version | ProductResponse.version | store beside view model | positive version on update | UI Product currently lacks it; add separate metadata type or approved optional version field |

## Party, role balance and payments

| UI field / type | Backend field / API type | Conversion | Validation | Null/default and preservation |
|---|---|---|---|---|
| Party.id | id | actual ULID | tenant-owned | no c1/s1 fixture IDs |
| name / nameBn | name / ∅ | trim English/main; Bengali extension | name1–200 | nameBn not discarded |
| roles: PartyRole[] | roles CUSTOMER/SUPPLIER/VENDOR[] | explicit enum map | 1–3 trading roles | Owner/Lender/Borrower/Payee need D08 |
| phone: string | phone: string/null | normalized BD phone | customer domain requires phone | blank supplier phone may be null |
| area: string | address: string/null | direct only if UI value is full intended address | max500 | area label and postal address equivalence must be checked in editor |
| balance: number | balance.netMinor: integer | display divide100 | server role balance | UI cannot PATCH balance |
| receivable/payable display | direction/outstandingMinor/advanceMinor | use server fields | preserve role semantics | never net unrelated roles |
| guardian/NID/email/description editor | guardianName/nid/email/notes | explicit fields | feature visibility rules | hidden edit fields must not be cleared |
| lastActivity | ∅ current PartyResponse | derive only from supplied server event timestamp | no fixture date fallback | leave honestly unavailable until read extension |
| avatarColor / image | ∅ presentation / attachment | deterministic initials/color local | no authority | photo integration needs attachment contract |
| status Active/Inactive | status ACTIVE/INACTIVE | explicit mapping | reserved walk-in cannot edit/remove | use status endpoint |
| opening role/direction/amount/date | OpeningBalanceRequest | amount raw scale2 positive; explicit direction | role, period, one opening per role | null amount ≠zero; blank means absent |
| editor multiple initial openings | single opening property | ∅ atomic batch create | D08/composed createWithin | no sequential partial HTTP commit |
| PaymentSplit.id | UI row key / returned payment id | keep local row key before commit | never send row key as server document ID | server ID after commit |
| method Cash/Bank/MFS/Card | accountCode resolved by account identity | use accountCodeFor equivalent from real account type | active, permission, correct tenant | label alone cannot identify account |
| amount: number / input string | amountMinor: integer | exact scale2 | >0 per active row | zero UI rows omitted before request |
| Customer Credit | ∅ cash payment method | use server-authorized advance allocation contract | cannot forge bank/cash | release hold for credit application |
| ledger date/debit/credit/balance | actual ledger response fields | scale2 display, source dates | authoritative server totals | not reconstructed from current page |

## Purchase editor and receiving

| UI field | Backend field / type | Conversion | Validation | Null/default behavior |
|---|---|---|---|---|
| supplierId | supplierPartyId: ULID | selected identity | Supplier role; vendor only owning vendor settlement | required |
| date | businessDate: YYYY-MM-DD | no UTC conversion | real date, not future, period/backdate rules | optional API defaults server today; UI sends selected day |
| referenceNo / memoNo | supplierBillRef: string/null | trimmed | max64 | blank→null |
| notes | notes: string/null | trimmed | max500 | blank→null |
| backdateReason | ∅ in CreatePurchaseRequest | no silent removal | source business rule amendment required | not notes concatenation |
| lines[].product.id | lines[].productId | real ULID | active permitted stock product | no fixture ID |
| line primary/secondary/unit quantities | lines[].qty: integer | compound→exact base quantity scale3 | >0, representable | preserve input source units via extension snapshot |
| entered cost | unitPriceMinor: integer | base-unit exact price | no unrepresentable quotient rounding | D16 when entered unit price is independent |
| expiryDate | lines[].expiryDate | ISO day/null | product policy, future/historical rules | blank→null |
| batchNumber / manufactureDate | ∅ | proposed receiving metadata | manufacture<expiry | D06 |
| serialText | separate POST serials current contract | no automatic follow-up after purchase | unique serials/source count | D06 atomic composition required |
| lot selling price | ∅ | D06 | ≥0, optional per lot | absent means product default per confirmed user rule |
| payments[] | paidMinor/paidAccountCode (single current account) | one-account only compatible | multiple rows need EXTENSIONS | do not drop all but first |
| discount + discountMode | discountMinor | UI percentage converted by authoritative domain rules | nonnegative ≤items | proposed server preview or shared exact domain |
| rounding / roundingRule | ∅ | D16 | must reconcile exact payable | do not add fake landed cost |
| photos / receipt | ∅ purchase attachment contract | preserve typed/photo draft | size/MIME/ownership | no filesystem data URLs in journal |
| sourceRevision | version in PurchaseResponse; correction request missing version | keep real source version | stale correction guard amendment | no sourceRevision=0 assumption |
| activeDraftId | local draft id | UI-only | tenant+user scope | consume after confirmed purchase only |

## POS, returns, cash and operational reads

| UI field / action | Backend field / type | Conversion and validation | Null/default / invariant |
|---|---|---|---|
| cart customer | partyId plus guest snapshots | real customer ID or null; explicit saveAsCustomer | fully paid guest does not create ordinary customer |
| cart quantity/unit | sale lines qty scale3 | exact base amount; retain entered-unit snapshot | no frontend totals accepted |
| line discount | lineDiscountMinor | raw scale2 | default0 |
| bill discount | discountMinor | domain-computed value if percentage UI | default0 |
| Own/Negative/Vendor | source + allocations sourceType | own/vendor/negative base qty must sum to line | allowNegativeStock is explicit confirmation, server policy controls |
| serial strings | allocations[].serialUnitIds | resolve existing serial rows by source | never send serial number as ULID |
| vendor unknown cost | vendorUnitCostMinor null | null remains unknown/provisional | zero is known free cost and differs |
| overpayment choice | overpaymentHandling CHANGE/ADVANCE | explicit choice | change does not remain in drawer receipt |
| invoice/ref number | SaleResponse.number | server authority | no preview counter or Math.random ID |
| installment controls | ∅ | D09 | no receivable schedule inferred from generic due |
| return line | sourceLineId + qty + serialUnitIds | use returnable response source IDs | ignore current product recipe/price for historic value |
| return reason | DAMAGED/WRONG_ITEM/CHANGED_MIND/EXTRA_QUANTITY/OTHER | explicit UI label mapping | OTHER note retains user explanation |
| refund | refundMinor/refundAccountCode | scale2; correct money source | 0 leaves credit according to owning service |
| batch returns | ∅ atomic multi-document contract | cannot loop public creates | blocked pending composed algorithm |
| cash start opening string | openingAmountMinor | raw scale2 ≥0 | compare with drawerBalanceMinor |
| cash start counterpart | counterpartAccountCode | actual account code/approved fixed counterpart | required on difference; null otherwise |
| count and close | countedClosingMinor/reason | ≥0, variance reason server-enforced | expectedClosingMinor immutable |
| count without close | ∅ server draft-count endpoint | keep unposted count draft | never secretly close |
| cash setting | key cash_session_enabled; value on/off | backend setting save | old frontend local setting not live authority |
| Dashboard summary | businessName only | no financial figures here | card endpoint is separate |
| Dashboard cards missing amount | optional permission-filtered field | no substitute0 | preserve entitlement/permission hint |
| date ranges | actual endpoint fromDate/toDate or from/to schema names | endpoint-specific query; no generic renamed filter | reset keyset cursor per query |
| query/column sort/page | endpoint allowlist + cursor/limit | cursor history adapter | no invented arbitrary offset paging |

## Forms not yet fully mapped

Settings, team employment metadata, invoice style configuration, vendor correction, warranty service detail, finance relationships/cheques, online/COD, installment lifecycle, bundle partial returns, recovery and SaaS billing have explicit packet gaps. The source-action censuses include their current form fields and handlers; those censuses do **not** satisfy a field-by-field implementation mapping. Complete those mappings in the listed blocked packet amendments before any coding assignment. See REVIEW.md; the blueprint is not declared complete.

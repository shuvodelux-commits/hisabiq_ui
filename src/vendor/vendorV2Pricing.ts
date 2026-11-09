/** Keep the entered money amount stable when changing a Vendor V2 pricing unit.
 * Quantity stays in base units; only the price-in display is converted.
 * No accounting events are posted by this UI helper.
 */
export function convertVendorV2UnitPrice(price:string,fromFactor:number,toFactor:number):string {
 if(!price.trim())return '';
 const value=Number(price);
 if(!Number.isFinite(value)||value<0)throw Error('Vendor unit price must be nonnegative and finite.');
 if(!Number.isFinite(fromFactor)||fromFactor<=0||!Number.isFinite(toFactor)||toFactor<=0)
  throw Error('A valid conversion factor is required.');
 const converted=value*toFactor/fromFactor;
 return String(Math.round((converted+Number.EPSILON)*10000)/10000);
}

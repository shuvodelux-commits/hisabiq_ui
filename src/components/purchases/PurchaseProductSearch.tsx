import React, {forwardRef} from 'react';
import type {Product} from '../../types/erp';
import {ProductCombobox} from '../pos/ProductCombobox';

/**
 * Purchase-specific adapter to the one POS/Magic Patterns product picker.
 * No duplicate dropdown markup, focus handling, or portal styling.
 */
type Props={
 products:Product[];
 onAdd:(product:Product)=>void;
 onCreate:()=>void;
 ariaLabel?:string;
};
export const PurchaseProductSearch=forwardRef<HTMLInputElement,Props>(function PurchaseProductSearch({products,onAdd,onCreate,ariaLabel},ref){
 return <ProductCombobox ref={ref} products={products} mode="purchase" onSelect={onAdd}
  onCreate={onCreate} ariaLabel={ariaLabel??"Search product to add to purchase"}/>;
});

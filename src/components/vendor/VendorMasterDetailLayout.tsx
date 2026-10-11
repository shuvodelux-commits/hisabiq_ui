import type {ReactNode} from 'react';

type Props={
 list:ReactNode;
 detail:ReactNode;
 editingFullWidth?:boolean;
 testId:string;
};

/** Layout only: accounting, source selection, and form state stay in tab-specific components. */
export function VendorMasterDetailLayout({list,detail,editingFullWidth=false,testId}:Props){
 return <div data-testid={testId}
  className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
  <section data-testid={testId+'-list'}
   className={'min-w-0 '+(editingFullWidth?'lg:hidden':'')}>{list}</section>
  <section data-testid={testId+'-detail'}
   className={'min-w-0 '+(editingFullWidth?'lg:col-span-2':'')}>{detail}</section>
 </div>;
}

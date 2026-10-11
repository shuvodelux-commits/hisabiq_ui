import {VendorActionDialog,type VendorActionMode} from '../parties/VendorActionDialog';
import type {VendorSource} from '../../vendor/vendorTypes';

/** Inline presentation of the same verified Vendor action handler used in dialogs. */
export function VendorSourceActionForm({
 source,mode,onSaved,onCancel
}:{
 source:VendorSource;
 mode:Exclude<VendorActionMode,'details'>;
 onSaved:()=>void;
 onCancel?:()=>void;
}){
 return <VendorActionDialog source={source} mode={mode} embedded
  onSaved={onSaved} onClose={onCancel??onSaved}/>;
}

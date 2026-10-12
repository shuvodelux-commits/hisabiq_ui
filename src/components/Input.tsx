import {forwardRef,type InputHTMLAttributes} from 'react';
import {Input as DesignInput} from '../_designSystem/ds-6551b66a-cfd3-4df9-a9b1-9ead8d7fe7e9';
import {NumericInput} from './NumericInput';
export const Input=forwardRef<HTMLInputElement,InputHTMLAttributes<HTMLInputElement>>(function Input(props,ref){
 return props.type==='number'||props.inputMode==='decimal'||props.inputMode==='numeric'&&props.type!=='tel'?<NumericInput {...props} ref={ref}/>:<DesignInput {...props} ref={ref}/>;
});

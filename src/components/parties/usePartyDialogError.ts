import {useCallback,useEffect,useId,useRef,useState} from 'react';

/** Party forms share error semantics without changing their domain validation. */
export function usePartyDialogError(){
 const id=useId();
 const summary=useRef<HTMLParagraphElement>(null);
 const [failure,setFailure]=useState<{message:string;field?:string}>({message:''});
 const setError=useCallback((message:string,field?:string)=>setFailure({message,field}),[]);
 useEffect(()=>{
  if(!failure.message)return;
  const target=failure.field?document.getElementById(`${id}-${failure.field}-0`):null;
  (target??summary.current)?.focus();
 },[failure,id]);
 const errorId=`${id}-error`;
 return {
  error:failure.message,setError,
  inputErrorProps:(field:string,index=0)=>({
   id:`${id}-${field}-${index}`,
   'aria-invalid':failure.message&&failure.field===field?true:undefined,
   'aria-describedby':failure.message&&failure.field===field?errorId:undefined
  }),
  errorSummaryProps:{id:errorId,ref:summary,tabIndex:-1}
 };
}

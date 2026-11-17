import {recoveryMessage} from './copy';
import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {restoreWithCurrentAuthority} from './authority';
import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from '../components/Button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '../components/Dialog';
import {useUiCopy} from '../i18n/useUiCopy';
import {useRecoveryContext} from './useRecoveryContext';
import {recoveryStore} from './store';
import './adapters';
type Target={kind:string;id:string;label:string;revision?:string;onDeleted?:()=>void};
export function useRecoveryDelete(){const {currentAuthority}=useTenantSettings();const ctx=useRecoveryContext(),{text}=useUiCopy();const [target,setTarget]=useState<Target|null>(null),[error,setError]=useState('');
 return {request:(next:Target)=>{setError('');setTarget(next);},dialog:<Dialog open={!!target} onOpenChange={v=>!v&&setTarget(null)}><DialogContent><DialogHeader><DialogTitle>{text('Move to Recycle Bin?','রিসাইকেল বিনে সরাবেন?')}</DialogTitle><DialogDescription>{target?.label} · {text('Recoverable for 30 days in this session. No financial or stock posting. Reloading resets preview stores.','এই সেশনে ৩০ দিন পর্যন্ত ফেরানো যাবে। খাতা বা মজুতে পোস্টিং হয় না। রিলোডে প্রিভিউ রিসেট হয়।')}</DialogDescription></DialogHeader>{error&&<p role="alert" className="text-sm text-danger">{error}</p>}<DialogFooter><Button variant="outline" onClick={()=>setTarget(null)}>{text('Cancel','বাতিল')}</Button><Button variant="destructive" onClick={()=>{if(!target)return;try{const deleted=recoveryStore.delete(target.kind,target.id,ctx,new Date().toISOString(),target.revision);target.onDeleted?.();setTarget(null);toast.success(text('Moved to Recycle Bin','রিসাইকেল বিনে সরানো হয়েছে'),{action:{label:text('Undo','ফেরান'),onClick:()=>{try{restoreWithCurrentAuthority(recoveryStore,deleted.deletionId,currentAuthority);}catch(e){toast.error(recoveryMessage(String(e),text));}}}});}catch(e){setError(recoveryMessage(e instanceof Error?e.message:String(e),text));}}}>{text('Delete','মুছুন')}</Button></DialogFooter></DialogContent></Dialog>};
}

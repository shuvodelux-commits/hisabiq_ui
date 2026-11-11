import {CashSessionProvider,useCashSession} from '../../contexts/CashSessionContext';
import {CashSessionDialog} from '../layout/CashSessionDialog';
import {Button} from '../Button';
import {useUiCopy} from '../../i18n/useUiCopy';
function Specimen(){const {text}=useUiCopy();const {setOpen,sessionOpen,history}=useCashSession();return <div className="space-y-3"><p className="text-xs text-ink-500">{text('Isolated preview drawer: start blank, declare a source, count and close. No production posting.','আলাদা নমুনা ড্রয়ার: খালি অঙ্ক দিয়ে শুরু, উৎস বাছাই, গুনে বন্ধ করুন। আসল লেনদেন হয় না।')}</p><Button onClick={()=>setOpen(true)}>{sessionOpen?text('Count / close cash session','ক্যাশ গুনুন / সেশন বন্ধ করুন'):text('Start cash session','ক্যাশ সেশন শুরু করুন')}</Button><p className="text-xs text-ink-500">{text('Preview sessions','নমুনা সেশন')}: {history.length}</p><CashSessionDialog/></div>;}
export function CashSessionSpecimen(){return <CashSessionProvider><Specimen/></CashSessionProvider>;}

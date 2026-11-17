import {useSyncExternalStore} from 'react';
import {PageHeader} from '../components/PageHeader';
import {RecycleBinList} from '../components/recycle/RecycleBinList';
import {recoveryStore} from '../recovery/store';
import {useRecoveryContext} from '../recovery/useRecoveryContext';
export function RecycleBin(){const ctx=useRecoveryContext();useSyncExternalStore(recoveryStore.subscribe,recoveryStore.snapshot);const count=ctx.view?recoveryStore.list(ctx).filter(r=>r.state==='deleted').length:0;return <div className="space-y-4"><PageHeader title={`Recycle Bin (${count})`} titleBn={`রিসাইকেল বিন (${count})`} description="Review deleted preview records and restore their original identity." descriptionBn="মুছে ফেলা প্রিভিউ তথ্য দেখুন ও আগের পরিচয়ে ফেরান।"/><RecycleBinList/></div>;}

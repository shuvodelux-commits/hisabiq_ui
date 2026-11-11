import {useSyncExternalStore} from 'react';
import {Link} from 'react-router-dom';
import {SettingCard} from './ui';
import {recoveryStore} from '../recovery/store';
import {useRecoveryContext} from '../recovery/useRecoveryContext';
import {useUiCopy} from '../i18n/useUiCopy';
import '../recovery/adapters';
export function DraftRecovery(){const ctx=useRecoveryContext(),{text}=useUiCopy();useSyncExternalStore(recoveryStore.subscribe,recoveryStore.snapshot);const count=ctx.view?recoveryStore.list(ctx).filter(r=>r.state==='deleted').length:0;return <SettingCard title={text('Recycle Bin','রিসাইকেল বিন')}><p className="text-xs text-helper">{text('Deleted records in this session:','এই সেশনে মুছে ফেলা তথ্য:')} {count}. {text('30-day preview recovery; resets on reload.','৩০ দিনের প্রিভিউ উদ্ধার; রিলোডে রিসেট হয়।')}</p><Link className="text-sm text-primary underline" to="/app/recycle-bin">{text('Open Recycle Bin','রিসাইকেল বিন খুলুন')}</Link></SettingCard>;}

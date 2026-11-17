import {useId} from 'react';
import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {canManage,type SettingsPermission} from '../settings/model';
import {Trash2} from 'lucide-react';
import {ActionMenuDivider,ActionMenuItem} from '../components/layout/ActionMenu';
import {useUiCopy} from '../i18n/useUiCopy';
import {deleteEligibility,type DeleteKind} from './policy';
/** Source-specific callers supply the owning review. Disabled explanations remain readable on touch. */
export function SourceDeleteAction({kind='posted',reason,reasonBn,onReview,module='money'}:{kind?:DeleteKind;reason?:string;reasonBn?:string;onReview?:()=>void;module?:SettingsPermission}){
 const {text}=useUiCopy();
 const reasonId=useId();
 const {state,actorId}=useTenantSettings();
 const permitted=canManage(state,actorId,module);
 const review=permitted?onReview:undefined;
 const explanation=onReview&&!permitted?'Current actor lacks permission for this module.':reason??deleteEligibility({kind}).reason??'Source deletion is unavailable.';
 return <><ActionMenuDivider/><ActionMenuItem icon={Trash2} tone="destructive" disabled={!review} onClick={review} aria-describedby={!review?reasonId:undefined}>
 {text('Delete','মুছুন')}
 </ActionMenuItem>{!review&&<p id={reasonId} className="px-3 pb-2 text-[11px] font-normal text-ink-600">{text(explanation,onReview&&!permitted?'এই মডিউলে বর্তমান ব্যবহারকারীর অনুমতি নেই।':reasonBn??({setup:'সেটআপের রিকভারি সংযুক্ত নয়। রেকর্ড রাখুন বা নিষ্ক্রিয় করুন।',immutable:'ইতিহাস অপরিবর্তনীয়। নতুন অডিটসহ সংশোধন করুন।',projection:'এটি মূল তথ্য থেকে তৈরি সারি। মূল লেনদেন মোছার নিরাপদ নির্দেশ সংযুক্ত নয়।',posted:'মূল লেনদেন মোছা বা উল্টো করার নিরাপদ নির্দেশ সংযুক্ত নয়।',master:'আগের ব্যবহার বা অসম্পূর্ণ ইতিহাসের কারণে মোছা যাবে না। নিষ্ক্রিয় করুন।'}[kind]))}</p>}
 </>;
}

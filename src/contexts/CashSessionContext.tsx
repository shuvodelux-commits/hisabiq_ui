import {createContext,useContext,useRef,useState,type ReactNode} from 'react';
import {CashSessionStore,type CashAuthority} from '../finance/cashSession';
import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {effectivePermissions} from '../settings/rbac';
import {getFinancePreviewSnapshot} from '../data/financePreviewStore';
import type {CashSessionRecord} from '../data/financeAccounts';
import {businessToday} from '../utils/dateRange';

type CashCount={counted:number;expected:number;note:string;savedAt:string;closed:boolean};
type CashSessionContextValue={open:boolean;setOpen:(open:boolean)=>void;sessionOpen:boolean;openingCash:number;expectedCash:number;sampleMovements:boolean;startSession:(opening:string,counterpart:string,note:string,revision:number,operationId:string)=>void;saveCount:(counted:number,note:string,close:boolean,revision:number,operationId:string)=>void;lastCount:CashCount|null;revision:number;businessDate:string;sessionDate:string|null;previousClosing:number|null;drawerBalance:number;history:CashSessionRecord[];canView:boolean;canStart:boolean;canClose:boolean;enabled:boolean;startBlocked:boolean};
const CashSessionContext=createContext<CashSessionContextValue|null>(null);
export function CashSessionProvider({children}:{children:ReactNode}){
 const {state,actorId,currentAuthority}=useTenantSettings();
 const [open,setOpen]=useState(false);
 const storeRef=useRef<{tenantId:string;store:CashSessionStore}>();
 if(storeRef.current?.tenantId!==state.tenantId)storeRef.current={tenantId:state.tenantId,store:new CashSessionStore(state.tenantId)};
 const store=storeRef.current.store;
 const [,render]=useState(0);
 const snapshot=store.snapshot();
 const enabled=state.sections.money.cashSession;
 const permissions=effectivePermissions(state.sections.team,actorId);
 const canView=enabled&&permissions.includes('cash.daily.view');
 const canStart=canView&&permissions.includes('cash.session.start');
 const canClose=canView&&permissions.includes('cash.session.close');
 const authority=():CashAuthority=>{const current=currentAuthority();return {tenantId:current.state.tenantId,actorId:current.actorId,enabled:current.state.sections.money.cashSession,permissions:effectivePermissions(current.state.sections.team,current.actorId)};};
 const businessDate=businessToday();
 const active=snapshot.sessions.find(s=>s.status==='Open');
 const last=snapshot.sessions.at(-1);
 const previousClosing=active?.previousClosingMinor??(last?.status==='Closed'?last.countedMinor??null:null);
 const history:CashSessionRecord[]=canView?snapshot.sessions.map(s=>({id:s.id,date:s.businessDate,openedAt:s.openedAt,closedAt:s.closedAt,openingCash:s.openingMinor/100,expectedCash:s.expectedMinor/100,countedCash:s.countedMinor===undefined?undefined:s.countedMinor/100,variance:s.countedMinor===undefined?undefined:(s.countedMinor-s.expectedMinor)/100,status:s.status,note:s.countNote,openingDifference:(s.openingDifferenceMinor/100),openingSource:s.counterpartName??undefined,openingSourceId:s.counterpart??undefined,openingNote:s.openingNote,preview:true})):[];
 const lastCount:CashCount|null=canView&&last?.countedMinor!==undefined?{counted:last.countedMinor/100,expected:last.expectedMinor/100,note:last.countNote??'',savedAt:last.countSavedAt??'',closed:last.status==='Closed'}:null;
 const startSession:CashSessionContextValue['startSession']=(amount,counterpart,note,revision,operationId)=>{store.start(authority(),{amount,counterpart,note,revision,operationId,businessDate,accounts:getFinancePreviewSnapshot().accounts.map(a=>({id:a.id,name:a.name,active:a.status==='Active',drawer:a.id==='acc-cash'}))});render(v=>v+1);};
 const saveCount:CashSessionContextValue['saveCount']=(counted,note,close,revision,operationId)=>{store.count(authority(),{counted:String(counted),note,close,revision,operationId});render(v=>v+1);};
 return <CashSessionContext.Provider value={{open,setOpen,sessionOpen:!!active,openingCash:canView?(active?.openingMinor??0)/100:0,expectedCash:canView?(active?.expectedMinor??0)/100:0,sampleMovements:false,startSession,saveCount,lastCount,revision:snapshot.revision,businessDate,sessionDate:active?.businessDate??null,previousClosing:previousClosing===null?null:previousClosing/100,drawerBalance:(previousClosing??0)/100,history,canView,canStart,canClose,enabled,startBlocked:!!last&&last.businessDate===businessDate&&last.status==='Closed'}}>{children}</CashSessionContext.Provider>;
}
export function useCashSession(){const ctx=useContext(CashSessionContext);if(!ctx)throw new Error('useCashSession must be used inside CashSessionProvider');return ctx;}

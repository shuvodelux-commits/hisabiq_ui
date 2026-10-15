import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {uiText} from '../src/i18n/uiCopy.ts';

const source=(path:string)=>readFileSync(path,'utf8');

test('Party Editor and Detail display copy respects English, bilingual and Bangla without altering stored data',()=>{
 const cases=[
  ['Party name','পার্টির নাম'],
  ['Relationships','সম্পর্কের ধরন'],
  ['Opening amount','শুরুর জের'],
  ['Receive payment','টাকা নিন'],
  ['Make payment','টাকা দিন'],
  ['Note deleted','নোট মুছে গেছে'],
  ['Read-only source reference in the UI preview.','এটি প্রিভিউতে লেনদেনের মূল সূত্র। এখানে বদলানো যাবে না।']
 ] as const;
 for(const [english,bangla] of cases){
  assert.equal(uiText('English',english,bangla),english);
  assert.equal(uiText('English + Bangla',english,bangla),english);
  assert.equal(uiText('Bangla',english,bangla),bangla);
 }
});

test('Role label translation is presentation only; source enum and balance direction remain unchanged',()=>{
 const copy=source('src/i18n/partyCopy.ts');
 for(const role of ['Customer','Supplier','Vendor','Lender','Borrower','Payee','Owner']){
  assert.match(copy,new RegExp(role+':'));
 }
 assert.match(copy,/uiText\(language,role,partyRoleBn\[role\]\)/);
 assert.match(copy,/language==='English \+ Bangla'\?label/);
 const editor=source('src/components/parties/PartyEditorDialog.tsx');
 for(const invariant of [
  'roles:checked', 'draft.roles.filter(item=>item!==role)',
  "partyRoles.filter(item=>item===role || draft.roles.includes(item))",
  'relationship:role,amount,side:entry.side,date:entry.date',
  'onSave(draft,changes)',
  "original.credit?'credit':'debit'"
 ]) assert.ok(editor.includes(invariant),invariant);
});

test('Opening and Party Detail retain preview-only posting and source-linked correction boundaries',()=>{
 const opening=source('src/components/parties/PartyOpeningDialog.tsx');
 const detail=source('src/components/parties/PartyDetail.tsx');
 for(const marker of [
  'onSubmit({partyId:party.id,relationship,amount:Number(amount),side,date,note:note.trim()})',
  "const names=openingDirectionLabels(relationship)",
  'partyOpeningDirectionLabel(names[value],language)'
 ]) assert.ok(opening.includes(marker),marker);
 for(const marker of [
  'onRecordPayment', 'onEditSourcePayment', 'onReverseSource',
  "source={sources.find(item=>item.id===editorRow?.sourceId)??null}",
  'onLedgerAction(action,row)', 'onAddNote(note.trim())','onDeleteNote(deleteNote.id)'
 ]) assert.ok(detail.includes(marker),marker);
 assert.match(detail,/SMS service is not connected to the UI preview/);
 assert.match(detail,/Open a new invoice from the POS until the Party source action is connected/);
});

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SettingsDialog, Button } from '../ui';

const steps = [
  { label: 'Shop details', bn: 'দোকানের তথ্য', route: '/app/settings/business', copy: 'Set your shop name, phone, address and logo. These appear on receipts.' },
  { label: 'Business type', bn: 'ব্যবসার ধরন', route: '/app/settings/products', copy: 'Choose product defaults, unit and stock warnings for your business.' },
  { label: 'Taking money', bn: 'পেমেন্ট', route: '/app/settings/sales', copy: 'Set your default payment method and selling policies.' },
  { label: 'Receipt look', bn: 'রসিদের ডিজাইন', route: '/app/settings/invoices', copy: 'Choose paper size, invoice design and Bangla printing options.' },
  { label: 'Staff', bn: 'কর্মী', route: '/app/settings/team', copy: 'Create staff access and assign roles with the existing permission checks.' },
] as const;

/**
 * Same five-step sequence and progress presentation as Magic Patterns.
 * Links to actual tenant-backed forms instead of the prototype's independent DemoStore.
 * The guide does not claim to have saved anything.
 */
export function SetupWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  const current = steps[step];
  return (
    <SettingsDialog title="Set up your shop" description="Choose a step to open its working HisabIQ settings." open onClose={onClose}>
      <ol className="mb-4 flex items-center gap-1.5" aria-label="Setup steps">
        {steps.map((item, i) => (
          <li key={item.label} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={`h-1 rounded-full ${i <= step ? 'bg-teal-600' : 'bg-ink-100'}`} />
            <span className={`truncate text-[10.5px] ${i === step ? 'font-medium text-ink' : 'text-ink-400'}`} aria-current={i === step ? 'step' : undefined}>{item.label}</span>
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={reduced ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -12 }} transition={{ duration: 0.16 }} className="space-y-3">
          <h3 className="text-[13px] font-semibold text-ink">{current.label} <span lang="bn" className="font-bn text-[11px] font-normal text-ink-400">{current.bn}</span></h3>
          <p className="text-[13px] text-ink-600">{current.copy}</p>
          <Link to={current.route} onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3.5 text-[13px] font-medium text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
            Open {current.label} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" onClick={onClose}>Skip for now</Button>
        {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
        {step < steps.length - 1 ? <Button onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={onClose}>Finish</Button>}
      </div>
    </SettingsDialog>
  );
}

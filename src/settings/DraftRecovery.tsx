import { useState, useSyncExternalStore } from "react";
import {
  getSalesPreviewSnapshot,
  subscribeSalesPreview,
  listDeletedSalesDrafts,
  restoreSalesDraft,
} from "../data/salesPreviewStore";
import { useTenantSettings } from "./TenantSettingsProvider";
import { canManage } from "./model";
import { Button, SettingCard, Input } from "./ui";
export function DraftRecovery() {
  const { state, actorId, personal } = useTenantSettings();
  const text = (en: string, bn: string) =>
    personal.language === "Bangla" ? bn : en;
  useSyncExternalStore(subscribeSalesPreview, getSalesPreviewSnapshot);
  const [query, setQuery] = useState(""),
    [notice, setNotice] = useState("");
  const ctx = {
    tenantId: state.tenantId,
    actorId,
    allowed: canManage(state, actorId, "sales"),
  };
  const rows = listDeletedSalesDrafts(ctx).filter((r) =>
    (r.draft.label + " " + r.draft.customer)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <SettingCard title="Recycle Bin · রিসাইকেল বিন" titleBn="মুছে যাওয়া খসড়া">
      <p className="text-xs text-helper">
        {text(
          "Recover this session’s deleted sales drafts within 30 days. Reloading resets the preview; posted records are excluded.",
          "এই সেশনের মুছে যাওয়া বিক্রির খসড়া ৩০ দিনের মধ্যে ফেরত আনুন। রিলোডে প্রিভিউ মুছে যায়; সম্পন্ন লেনদেন এখানে নেই।",
        )}
      </p>
      <Input
        aria-label={text("Search deleted drafts", "মুছে যাওয়া খসড়া খুঁজুন")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={text("Search deleted drafts", "খসড়া খুঁজুন")}
      />
      {rows.map((r) => (
        <div
          key={r.draft.id}
          className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-[13px]"
        >
          <div>
            <strong>{r.draft.label}</strong>
            <p className="text-xs text-helper">
              {r.draft.customer || text("Walk-in", "সাধারণ ক্রেতা")} ·{" "}
              {text("Deleted by", "মুছেছেন")} {r.deletedBy}
            </p>
            <p className="text-xs text-helper">
              {text("Recover before", "এর আগে ফেরত আনুন")}{" "}
              {new Date(r.expiresAt).toLocaleString("en-GB", {
                timeZone: "Asia/Dhaka",
              })}{" "}
              · Dhaka
            </p>
          </div>
          <Button
            variant="outline"
            disabled={Date.now() >= Date.parse(r.expiresAt)}
            onClick={() => {
              try {
                restoreSalesDraft(r.draft.id, ctx, new Date().toISOString());
                setNotice(
                  text(
                    "Draft restored with its original identity. No money or stock posted.",
                    "খসড়া আগের পরিচয়ে ফেরত এসেছে। টাকা বা স্টকের লেনদেন হয়নি।",
                  ),
                );
              } catch (e) {
                setNotice(
                  personal.language === "Bangla"
                    ? "খসড়াটি ফেরত আনা যায়নি।"
                    : e instanceof Error
                      ? e.message
                      : "Could not restore.",
                );
              }
            }}
          >
            {text("Restore draft", "খসড়া ফেরত আনুন")}
          </Button>
        </div>
      ))}
      {!rows.length && (
        <p className="text-xs text-helper">
          {text(
            "No eligible deleted drafts in this session.",
            "এই সেশনে ফেরত আনার মতো খসড়া নেই।",
          )}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs">
          {notice}
        </p>
      )}
    </SettingCard>
  );
}

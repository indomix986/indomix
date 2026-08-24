import { useState } from "react";
import { Bot, Plus, HelpCircle, Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DbBotFaq } from "@/hooks/admin/use-admin-faq";
import { useAdminAllFaq, useUpdateFaq, useDeleteFaq } from "@/hooks/admin/use-admin-faq";
import { AddFaqModal } from "./AddFaqModal";
import { EditFaqModal } from "./EditFaqModal";

export function BotFaqManagerTab() {
  const { data: faqList = [], isLoading } = useAdminAllFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<DbBotFaq | null>(null);

  const handleToggleActive = async (faq: DbBotFaq) => {
    try {
      await updateFaqMutation.mutateAsync({
        id: faq.id,
        data: { is_active: !faq.is_active },
      });
      toast.success(faq.is_active ? "تم تعطيل السؤال" : "تم تفعيل السؤال");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل تعديل الحالة";
      toast.error("فشل تعديل الحالة", { description: errorMsg });
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`هل أنت متأكد من حذف سؤال "${question}"؟`)) return;
    try {
      await deleteFaqMutation.mutateAsync(id);
      toast.success("تم حذف السؤال بنجاح");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف السؤال";
      toast.error("فشل حذف السؤال", { description: errorMsg });
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Bot className="size-4.5 text-primary" />
            <span>أسئلة وإجابات بوت المساعد الذكي (FAQ)</span>
          </h2>
          <p className="mt-1 text-muted-foreground text-[11px]">
            أضف أو عدل الأسئلة والإجابات والكلمات المفتاحية التي يفهمها بوت الصفحة الرئيسية للرد
            التلقائي على الزبائن.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-heat px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform shrink-0"
        >
          <Plus className="size-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">جاري تحميل الأسئلة...</div>
      ) : faqList.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <HelpCircle className="size-10 text-muted-foreground/50 mx-auto" />
          <p className="font-bold text-foreground">لا توجد أسئلة مضافة للبوت بعد</p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            يمكنك إضافة أسئلة شائعة وإجاباتها ليقوم المساعد الذكي في الصفحة الرئيسية بالرد عليها
            فورياً.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqList.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all p-4 ${
                faq.is_active
                  ? "border-border bg-surface/60"
                  : "border-dashed border-border/60 bg-surface/20 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">{faq.question}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      ترتيب #{faq.display_order}
                    </span>
                    {!faq.is_active && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        معطل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                  {faq.keywords && faq.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        الكلمات المفتاحية:
                      </span>
                      {faq.keywords.map((k, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-card border border-border px-1.5 py-0.5 text-[10px] text-foreground/80 font-medium"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    title={faq.is_active ? "تعطيل السؤال" : "تفعيل السؤال"}
                    className={`grid size-8 place-items-center rounded-xl border transition-colors ${
                      faq.is_active
                        ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    {faq.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFaq(faq)}
                    title="تعديل"
                    className="grid size-8 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id, faq.question)}
                    title="حذف"
                    className="grid size-8 place-items-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && <AddFaqModal onClose={() => setIsAddOpen(false)} />}
      {editingFaq && <EditFaqModal faq={editingFaq} onClose={() => setEditingFaq(null)} />}
    </div>
  );
}

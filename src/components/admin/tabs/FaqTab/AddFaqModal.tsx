import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateFaq } from "@/hooks/admin/use-admin-faq";

interface AddFaqModalProps {
  onClose: () => void;
}

export function AddFaqModal({ onClose }: AddFaqModalProps) {
  const createFaqMutation = useCreateFaq();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("يرجى ملء نص السؤال والإجابة");
      return;
    }

    const keywordList = keywords
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      await createFaqMutation.mutateAsync({
        question,
        answer,
        keywords: keywordList,
        display_order: displayOrder,
        is_active: isActive,
      });
      toast.success("تمت إضافة السؤال بنجاح!");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل إضافة السؤال";
      toast.error("فشل إضافة السؤال", { description: errorMsg });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-6 py-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <span>إضافة سؤال جديد لبوت الصفحة الرئيسية</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">نص السؤال أو الموضوع *</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="مثال: هل متاح توصيل لأكتوبر؟ أو ما هي أنواع الصوصات؟"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الإجابة التلقائية للبوت *</label>
            <textarea
              rows={3}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="اكتب الإجابة المفصلة التي سيرد بها البوت..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              الكلمات المفتاحية للتعرف على السؤال (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="مثال: توصيل، دليفري، وقت، مدة، سريع"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              عندما يكتب الزائر أياً من هذه الكلمات في شات البوت، سيتم الرد بهذه الإجابة فوراً.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold mb-1">ترتيب العرض في الخيارات</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="add_faq_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4.5 rounded accent-primary"
              />
              <label htmlFor="add_faq_active" className="font-bold cursor-pointer">
                تفعيل السؤال في البوت
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-muted-foreground hover:bg-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createFaqMutation.isPending}
              className="rounded-2xl bg-heat px-6 py-2.5 font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform disabled:opacity-50"
            >
              {createFaqMutation.isPending ? "جاري الإضافة..." : "إضافة السؤال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

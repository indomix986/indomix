import { useState, useEffect } from "react";
import { Settings, MessageCircle, Phone, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import { useRestaurantSettings } from "@/hooks/use-catalog";
import { useUpdateRestaurantSettings } from "@/hooks/admin/use-admin-settings";
import { BotFaqManagerTab } from "../FaqTab";

export function RestaurantSettingsTab() {
  const { data: settings } = useRestaurantSettings();
  const updateSettingsMutation = useUpdateRestaurantSettings();

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(20);

  useEffect(() => {
    if (settings) {
      setPhone(settings.phone);
      setWhatsapp(settings.whatsapp);
      setWorkingHours(settings.working_hours);
      setDeliveryFee(settings.delivery_fee);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !whatsapp.trim()) {
      toast.error("يرجى إدخال أرقام الهاتف والواتساب");
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        phone,
        whatsapp,
        working_hours: workingHours,
        is_open: settings?.is_open ?? true,
        delivery_fee: deliveryFee,
      });
      toast.success("تم تحديث إعدادات المطعم بنجاح وتطبيقها على الموقع!");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حفظ الإعدادات";
      toast.error("فشل حفظ الإعدادات", { description: errorMsg });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Restaurant Settings Card */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6 text-xs"
      >
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            <span>إعدادات التواصل والتشغيل الفعلية</span>
          </h2>
          <p className="mt-1 text-muted-foreground text-[11px]">
            أي تعديل هنا ينعكس فوراً على رابط الواتساب في السلة، صفحة تواصل معنا، الفوتر، والرسوم.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-emerald-500" />
              <span>رقم الواتساب لاستقبال الطلبات (صيغة دولية بدون +) *</span>
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="مثال: 201015770734"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Phone className="size-3.5 text-primary" />
              <span>رقم هاتف الخط الساخن والدليفري *</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 01015770734"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>مواعيد العمل</span>
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="يوميًا من ١١:٠٠ صباحًا حتى ٣:٠٠ فجرًا"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" />
              <span>رسوم التوصيل الأساسية (ج.م) *</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-heat px-8 py-3 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform disabled:opacity-50"
          >
            {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>

      {/* Bot FAQ Manager Section */}
      <BotFaqManagerTab />
    </div>
  );
}

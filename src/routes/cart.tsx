import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  MessageCircle,
  Flame,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useStore } from "@/context/StoreContext";
import { useRestaurantSettings } from "@/hooks/use-catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة الطلبات وإتمام الشراء | إندومكس" },
      {
        name: "description",
        content: "راجع أصناف سلتك وأرسل طلبك مباشرة عبر الواتساب من مطعم إندومكس.",
      },
    ],
  }),
  component: CartPage,
});

type PaymentOption = "cash_on_delivery" | "instapay" | "vodafone_cash";

export function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, deliveryFee } =
    useStore();

  const { data: settings } = useRestaurantSettings();

  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("cash_on_delivery");

  const totalAmount = subtotal + deliveryFee;

  const paymentLabels: Record<PaymentOption, string> = {
    cash_on_delivery: "كاش عند الاستلام",
    instapay: "إنستاباي (InstaPay)",
    vodafone_cash: "فودافون كاش",
  };

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      toast.error("يرجى ملء الاسم، رقم الهاتف، وعنوان التوصيل");
      return;
    }

    const whatsappNumber = settings?.whatsapp || "201015770734";

    let msg = `*طلب جديد من موقع إندومكس*\n`;
    msg += `-------------------------\n`;
    msg += `👤 *الاسم:* ${customerName.trim()}\n`;
    msg += `📱 *الهاتف:* ${customerPhone.trim()}\n`;
    msg += `📍 *العنوان:* ${deliveryAddress.trim()}\n`;
    msg += `💳 *طريقة الدفع:* ${paymentLabels[paymentMethod]}\n`;
    if (orderNotes.trim()) {
      msg += `📝 *ملاحظات:* ${orderNotes.trim()}\n`;
    }
    msg += `-------------------------\n`;
    msg += `*الأصناف المطلوبة:*\n`;

    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.name}* (الكمية: ${item.quantity})\n`;
      msg += `   - الشطة: ${item.spiciness}\n`;
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        const extrasList = item.selectedExtras.map((e) => e.name).join("، ");
        msg += `   - إضافات: ${extrasList}\n`;
      }
      if (item.notes) {
        msg += `   - ملاحظة: ${item.notes}\n`;
      }
      msg += `   - السعر: ${item.unitPrice * item.quantity} ج.م\n\n`;
    });

    msg += `-------------------------\n`;
    msg += `مجموع الأصناف: ${subtotal} ج.م\n`;
    msg += `رسوم التوصيل: ${deliveryFee} ج.م\n`;
    msg += `*الإجمالي النهائي:* ${totalAmount} ج.م`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank");

    toast.success("تم تجهيز الطلب وفتح محادثة واتساب لإرساله للمطعم!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <div className="grid size-20 place-items-center rounded-full bg-surface border border-border shadow-soft">
              <ShoppingBag className="size-9 text-muted-foreground stroke-1" />
            </div>
            <h1 className="mt-5 text-lg font-extrabold text-foreground sm:text-xl">
              سلة طلباتك فارغة حالياً
            </h1>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground">
              لم تقم بإضافة أي وجبة بعد. تصفح منيو إندومكس واختر وجبتك المفضلة!
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-heat px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-heat transition-transform hover:scale-105"
            >
              <Sparkles className="size-4" />
              <span>تصفح المنيو الآن</span>
            </Link>
          </div>
        ) : (
          /* Active Cart and Checkout Grid */
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">سلة الطلبات وإتمام الشراء</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  لديك {totalItems} {totalItems === 1 ? "صنف" : "أصناف"} في السلة
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                <span>إفراغ السلة</span>
              </button>
            </div>

            <form onSubmit={handleSendWhatsAppOrder} className="mt-8 grid gap-8 lg:grid-cols-12">
              {/* Left Column: Cart items & Delivery Details Form */}
              <div className="space-y-6 lg:col-span-7">
                {/* Cart Items List */}
                <div className="space-y-4">
                  <h2 className="text-sm font-extrabold text-foreground">أصناف السلة</h2>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
                    >
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <Link
                          to="/products/$id"
                          params={{ id: item.productId }}
                          search={{ from: "cart" }}
                        >
                          <img
                            src={item.product.img}
                            alt={item.product.name}
                            className="size-18 rounded-xl object-cover ring-1 ring-border"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to="/products/$id"
                            params={{ id: item.productId }}
                            search={{ from: "cart" }}
                          >
                            <h3 className="text-sm font-extrabold text-foreground hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-chili/15 px-2 py-0.5 text-[10px] font-bold text-chili">
                              <Flame className="size-3" />
                              {item.spiciness}
                            </span>

                            {item.selectedExtras.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                + {item.selectedExtras.map((e) => e.name).join("، ")}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p className="mt-1 text-[10px] text-muted-foreground italic">
                              ملاحظة: {item.notes}
                            </p>
                          )}

                          <span className="mt-1.5 block text-xs font-extrabold text-primary">
                            {item.unitPrice} ج.م للواحد
                          </span>
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1">
                          <button
                            type="button"
                            aria-label="تقليل الكمية"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="grid size-6 place-items-center rounded-lg text-foreground/80 hover:bg-background hover:text-primary"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-extrabold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="زيادة الكمية"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="grid size-6 place-items-center rounded-lg text-foreground/80 hover:bg-background hover:text-primary"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-foreground min-w-16 text-end">
                          {item.unitPrice * item.quantity} ج.م
                        </span>

                        <button
                          type="button"
                          aria-label="حذف الصنف"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Information Form */}
                <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      <span>بيانات التوصيل والتواصل</span>
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        الاسم بالكامل *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم المستلم"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        رقم الهاتف للتواصل والدليفري *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      عنوان التوصيل بالتفصيل (المنطقة، الشارع، رقم العمارة، الشقة) *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="مثال: المعادي - شارع ٩ - عمارة ١٢ - الدور الثالث شقة ٥"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      ملاحظات خاصة بالتوصيل أو الطلب (اختياري)
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="مثال: رن الجرس مرتين، الصوس في علبة خارجية..."
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2 border-t border-border/40">
                    <label className="block text-xs font-bold text-foreground mb-2">
                      طريقة الدفع المفضلة:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "cash_on_delivery", label: "كاش عند الاستلام" },
                          { id: "instapay", label: "إنستاباي (InstaPay)" },
                          { id: "vodafone_cash", label: "فودافون كاش" },
                        ] as const
                      ).map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                            paymentMethod === pm.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Placement */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
                  <h2 className="text-base font-extrabold text-foreground border-b border-border/60 pb-3">
                    ملخص الفاتورة
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عدد الأصناف:</span>
                      <span className="font-bold">{totalItems} أصناف</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">مجموع الأصناف:</span>
                      <span className="font-bold">{subtotal} ج.م</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">رسوم التوصيل:</span>
                      <span className="font-bold">
                        {deliveryFee === 0 ? "مجاني" : `${deliveryFee} ج.م`}
                      </span>
                    </div>

                    <div className="border-t border-border/60 pt-3 flex justify-between text-base font-extrabold">
                      <span>الإجمالي النهائي:</span>
                      <span className="text-primary">{totalAmount} ج.م</span>
                    </div>
                  </div>

                  {/* Primary WhatsApp Order Action */}
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-emerald-500"
                  >
                    <MessageCircle className="size-5" />
                    <span>إرسال الطلب عبر واتساب</span>
                  </button>

                  <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                    عند الضغط سيتم فتح محادثة واتساب مع مطعم إندومكس بكامل تفاصيل وأصناف طلبك
                    لتأكيده فوراً.
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { MessageSquareText, X, Send, Bot, PhoneCall, RotateCcw } from "lucide-react";
import { useRestaurantSettings, useBotFaq } from "@/hooks/use-catalog";
import { FAQ_KNOWLEDGE, INITIAL_MESSAGES, type ChatMessage } from "./FaqBotWidget/faq-data";

export function FaqBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useRestaurantSettings();
  // ✅ Sprint 3 – Step 5.3: Only fetch bot_faq when user opens the chatbot widget
  const { data: dynamicFaq } = useBotFaq({ enabled: isOpen });

  const whatsappNumber = settings?.whatsapp || "201015770734";

  // Build active knowledge base solely from DB
  const activeFaq =
    dynamicFaq && dynamicFaq.length > 0
      ? dynamicFaq.map((item) => ({
          keywords: [item.question, ...(item.keywords || [])],
          reply: item.answer,
          whatsappLink:
            item.keywords?.some(
              (k) => k.includes("واتساب") || k.includes("تليفون") || k.includes("رقم"),
            ) ||
            item.question.includes("واتساب") ||
            item.question.includes("خدمة العملاء"),
        }))
      : [];

  // Build dynamic initial welcome options from DB FAQs (if any)
  const defaultWelcomeOptions =
    dynamicFaq && dynamicFaq.length > 0
      ? dynamicFaq.slice(0, 6).map((f) => ({ label: f.question, action: f.question }))
      : undefined;

  // Update initial welcome message options when dynamic FAQ loads
  useEffect(() => {
    if (dynamicFaq && dynamicFaq.length > 0) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0]?.id === "welcome") {
          return [
            {
              ...prev[0],
              options: defaultWelcomeOptions,
            },
          ];
        }
        return prev;
      });
    }
  }, [dynamicFaq]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  if (isDismissed) {
    return null;
  }

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      const matched = activeFaq.find((item) =>
        item.keywords.some((k) => {
          const kLower = k.toLowerCase();
          return lower.includes(kLower) || kLower.includes(lower);
        }),
      );

      let botReply: ChatMessage;

      if (matched) {
        botReply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: matched.reply,
          ...(matched.whatsappLink ? { whatsappLink: true } : {}),
        };
      } else {
        botReply = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "شكراً لسؤالك! للحصول على تفاصيل أسرع وأدق بخصوص طلبك، يمكنك التواصل فوراً مع فريق العمل على واتساب.",
          whatsappLink: true,
          options: defaultWelcomeOptions ? defaultWelcomeOptions.slice(0, 3) : undefined,
        };
      }

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "أهلاً بك في إندومكس! 🍜 أنا مساعد إندومكس الذكي، جاهز للإجابة عن استفسارات التوصيل والمنيو فوراً.",
        options: defaultWelcomeOptions,
      },
    ]);
  };

  if (isDismissed) return null;

  return (
    <aside
      aria-label="مساعد التوصيل والأسئلة الشائعة"
      className="fixed bottom-5 start-5 z-50 flex flex-col items-start sm:bottom-6 sm:start-6"
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 flex h-[460px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-surface px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="relative grid size-9 place-items-center rounded-2xl bg-heat text-primary-foreground font-bold shadow-sm">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-foreground">مساعد إندومكس الذكي</h3>
                <p className="text-[10px] text-muted-foreground">
                  متصل الآن للإجابة عن التوصيل والمنيو
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="إعادة ضبط المحادثة"
                className="grid size-7 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="تصغير"
                className="grid size-7 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 no-scrollbar bg-background/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-heat text-primary-foreground font-bold rounded-br-xs"
                      : "bg-surface border border-border text-foreground rounded-bl-xs shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {m.whatsappLink && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-emerald-500 transition-colors"
                    >
                      <PhoneCall className="size-3.5" />
                      <span>محادثة واتساب مباشرة</span>
                    </a>
                  )}
                </div>

                {/* Quick Option Pills */}
                {m.options && (
                  <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
                    {m.options.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSend(opt.action)}
                        className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 rounded-2xl bg-surface border border-border px-3 py-2 text-[10px] text-muted-foreground w-fit rounded-bl-xs">
                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                <span className="ms-1 font-semibold">يكتب الرد...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5 border-t border-border bg-surface p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب استفسارك هنا..."
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="إرسال السؤال"
              className="grid size-8.5 place-items-center rounded-xl bg-heat text-primary-foreground disabled:opacity-40 transition-transform hover:scale-105 shrink-0"
            >
              <Send className="size-3.5 -scale-x-100" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button & Close Badge */}
      <div className="group relative flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "إغلاق نافذة الأسئلة الشائعة" : "مساعد الأسئلة والتوصيل"}
          className="relative flex items-center gap-2 rounded-full bg-heat px-4 py-3 text-xs font-extrabold text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isOpen ? (
            <>
              <X className="size-4.5" />
              <span>إغلاق المحادثة</span>
            </>
          ) : (
            <>
              <div className="relative">
                <MessageSquareText className="size-4.5" />
                <span className="absolute -top-1 -end-1 size-2 rounded-full bg-chili ring-2 ring-primary" />
              </div>
              <span className="hidden sm:inline">أسئلة التوصيل والمنيو</span>
            </>
          )}
        </button>

        {!isOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            title="إخفاء الزر حتى تحديث الصفحة"
            aria-label="إخفاء المساعد"
            className="grid size-6 place-items-center rounded-full bg-surface border border-border text-muted-foreground opacity-70 hover:opacity-100 hover:text-destructive shadow-sm transition-all hover:scale-110"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </aside>
  );
}

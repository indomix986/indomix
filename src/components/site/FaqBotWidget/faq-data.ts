/**
 * FAQ knowledge base and initial chat messages for the bot widget.
 * 🔮 Supabase future: FAQ_KNOWLEDGE can come from a `faq_entries` table.
 */

import { RESTAURANT_WHATSAPP } from "@/constants/restaurant";

export interface FaqEntry {
  keywords: string[];
  reply: string;
  whatsappLink?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: { label: string; action: string }[] | undefined;
  whatsappLink?: boolean | undefined;
}

export const FAQ_KNOWLEDGE: FaqEntry[] = [];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "bot",
    text: "أهلاً بك في إندومكس! 🍜 أنا مساعد إندومكس الذكي، جاهز للإجابة عن استفساراتك.",
  },
];

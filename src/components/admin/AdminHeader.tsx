import { Shield, LogOut, Utensils, Layers, Sparkles, Settings, MessageSquareHeart } from "lucide-react";

export type AdminTab = "products" | "categories" | "offers" | "reviews" | "settings";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  productsCount: number;
  categoriesCount: number;
  offersCount: number;
  reviewsCount?: number;
}

export function AdminHeader({
  activeTab,
  onTabChange,
  onSignOut,
  productsCount,
  categoriesCount,
  offersCount,
  reviewsCount = 0,
}: AdminHeaderProps) {
  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-chili">
            <Shield className="size-4" />
            <span>نظام إدارة محتوى إندومكس (CMS)</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">لوحة التحكم الإدارية</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            إدارة قائمة الوجبات، الأصناف، العروض الترويجية، تقييمات العملاء، وأرقام التواصل والتوصيل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onTabChange("products")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "products"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Utensils className="size-4" />
          <span>قائمة الوجبات ({productsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("categories")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "categories"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          <span>الأقسام ({categoriesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("offers")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "offers"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>العروض والبوكسات ({offersCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("reviews")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "reviews"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <MessageSquareHeart className="size-4" />
          <span>معرض تقييمات العملاء ({reviewsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("settings")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "settings"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Settings className="size-4" />
          <span>إعدادات التواصل والتوصيل</span>
        </button>
      </div>
    </>
  );
}

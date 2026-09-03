import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Link2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export type AdminEntityType = "products" | "categories" | "offers" | "reviews" | "upload";

export interface AdminImageUploaderProps {
  entityType?: AdminEntityType;
  entityId?: string;
  imageUrl: string;
  onImageUploaded: (newUrl: string) => void;
  onUrlChange?: (newUrl: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function AdminImageUploader({
  entityType = "products",
  entityId,
  imageUrl,
  onImageUploaded,
  onUrlChange,
  onUploadingChange,
  label = "الصورة *",
  helperText,
  disabled = false,
}: AdminImageUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const isExistingRecord = Boolean(entityId && entityId !== "new" && entityId !== "temp");

  const handleUploadFile = async (file: File) => {
    if (disabled || isUploading) return;

    // Client-side validation: Max size 25MB
    if (file.size > 25 * 1024 * 1024) {
      const err = "حجم الصورة يتجاوز الحد الأقصى المسموح به (25 ميجابايت)";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    // Client-side validation: Accepted formats PNG, JPEG, WEBP, GIF
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    const validExtensions = /\.(png|jpe?g|webp|gif)$/i;
    if (!validMimeTypes.includes(file.type.toLowerCase()) && !validExtensions.test(file.name)) {
      const err = "صيغة الملف غير مدعومة. الصيغ المقبولة: PNG, JPEG, WEBP, GIF";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);
    setErrorMessage(null);
    setUploadSuccess(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData.session?.access_token;
      if (!token) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        token = refreshData.session?.access_token;
      }

      if (!token) {
        throw new Error("جلسة تسجيل الدخول غير متوفرة. يرجى تسجيل الدخول بحساب مسؤول أولاً");
      }

      const formData = new FormData();
      formData.append("file", file);

      const targetId = encodeURIComponent(entityId || "new");
      const response = await fetch(`/admin/${entityType}/${targetId}/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        let errorText = data?.error;
        if (!errorText) {
          if (response.status === 403) {
            errorText = "تم استنفاد كوتا رفع الصور المتاحة، يرجى التواصل مع الأدمن";
          } else {
            errorText = "الخدمة غير متاحة حاليًا، حاول مرة أخرى بعد قليل";
          }
        }
        throw new Error(errorText);
      }

      const newUrl = data.image_url as string;
      onImageUploaded(newUrl);
      if (onUrlChange) {
        onUrlChange(newUrl);
      }

      setUploadSuccess(true);
      toast.success(
        isExistingRecord ? "تم رفع الصورة وتحديث البيانات بنجاح!" : "تم رفع الصورة بنجاح وتجهيزها!",
      );

      // Invalidate relevant react-query cache
      if (entityType === "products") {
        queryClient.invalidateQueries({ queryKey: ["admin_products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else if (entityType === "categories") {
        queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else if (entityType === "offers") {
        queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
        queryClient.invalidateQueries({ queryKey: ["offers"] });
      } else if (entityType === "reviews") {
        queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
        queryClient.invalidateQueries({ queryKey: ["reviews_gallery"] });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع الصورة";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const isQuotaError =
    errorMessage?.includes("كوتا") ||
    errorMessage?.includes("quota") ||
    errorMessage?.includes("الكوتا");

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-surface/60 p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-foreground">{label}</label>
        <span className="text-[10px] text-muted-foreground">
          {helperText ||
            (isExistingRecord ? "تحديث مباشر لقاعدة البيانات" : "ستُحفظ عند إتمام النموذج")}
        </span>
      </div>

      {/* Main Container: Preview & Drop Zone */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Visual Preview */}
        <div className="sm:col-span-4 relative group w-full rounded-xl border border-border bg-background/80 flex items-center justify-center min-h-[100px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="معاينة الصورة"
              className="w-full h-auto max-h-64 object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".img-error-placeholder")) {
                  const el = document.createElement("div");
                  el.className = "img-error-placeholder flex flex-col items-center justify-center p-3 text-center text-muted-foreground w-full";
                  el.innerHTML = '<span class="text-xs">⚠️ تعذّر تحميل الصورة</span>';
                  parent.appendChild(el);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center text-muted-foreground w-full py-6">
              <ImageIcon className="size-8 opacity-40 mb-1" />
              <span className="text-[10px]">لا توجد صورة</span>
            </div>
          )}

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 p-2 text-center text-white backdrop-blur-xs">
              <Loader2 className="size-6 animate-spin text-primary mb-1" />
              <span className="text-[10px] font-bold">جاري الرفع والتحسين...</span>
            </div>
          )}

          {/* Success Badge */}
          {uploadSuccess && !isUploading && (
            <div className="absolute top-1.5 start-1.5 z-10 flex items-center gap-1 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
              <CheckCircle2 className="size-3" />
              <span>تم الرفع</span>
            </div>
          )}
        </div>

        {/* Upload Action Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`sm:col-span-8 flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[0.99]"
              : "border-border hover:border-primary/60 hover:bg-surface/80"
          } ${isUploading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
          </div>

          <p className="text-xs font-bold text-foreground mb-0.5">
            {isUploading ? "جاري المعالجة..." : "انقر لاختيار صورة أو اسحبها هنا"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            الصيغ المدعومة: PNG, JPEG, WEBP, GIF (الحد الأقصى: 25MB)
          </p>
        </div>
      </div>

      {/* Cold Start Notice */}
      {isUploading && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-500 animate-pulse">
          <Info className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">جاري الرفع وتحسين الصورة...</span>
            <p className="text-[10px] text-amber-400/90 mt-0.5 leading-relaxed">
              قد يستغرق الرفع وقتًا أطول من المعتاد في المرة الأولى (حتى 60 ثانية) إذا كانت الخدمة
              في وضع الاستيقاظ. يرجى الانتظار.
            </p>
          </div>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && !isUploading && (
        <div
          className={`flex items-start gap-2 rounded-xl p-2.5 text-[11px] border ${
            isQuotaError
              ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span className="font-bold">{errorMessage}</span>
            {isQuotaError && (
              <p className="text-[10px] text-rose-300/90 mt-1 font-semibold">
                يرجى التواصل مع مسؤول النظام لتجديد أو ترقية حصة الصور.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-muted-foreground hover:text-foreground px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Manual URL Input Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="size-3.5" />
          <span>
            {showManualInput ? "إخفاء رابط الصورة المباشر" : "عرض أو تعديل رابط الصورة يدويًا"}
          </span>
        </button>

        {showManualInput && (
          <div className="mt-2 space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  onImageUploaded(e.target.value);
                  if (onUrlChange) onUrlChange(e.target.value);
                }}
                placeholder="/assets/... أو https://..."
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary font-mono text-[11px]"
              />
              {imageUrl && (
                <button
                  type="button"
                  title="مسح الرابط"
                  onClick={() => {
                    onImageUploaded("");
                    if (onUrlChange) onUrlChange("");
                  }}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              يمكنك كتابة مسار صورة محلي أو رابط مباشر خارجي في حال عدم الرغبة بالرفع.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

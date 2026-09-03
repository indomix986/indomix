import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import fs from "node:fs";
import path from "node:path";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXTENSIONS = /\.(png|jpe?g|webp|gif)$/i;

function readEnvFileFallback(key: string): string {
  try {
    if (typeof process !== "undefined" && typeof fs !== "undefined" && fs.existsSync) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const varKey = trimmed.substring(0, eqIdx).trim();
            let varVal = trimmed.substring(eqIdx + 1).trim();
            if (
              (varVal.startsWith('"') && varVal.endsWith('"')) ||
              (varVal.startsWith("'") && varVal.endsWith("'"))
            ) {
              varVal = varVal.slice(1, -1);
            }
            if (varKey === key) return varVal;
          }
        }
      }
    }
  } catch {
    // Ignore fallback reading errors
  }
  return "";
}

function getEnvVar(key: string, envObj?: unknown, defaultValue = ""): string {
  if (envObj && typeof envObj === "object" && key in envObj) {
    const val = (envObj as Record<string, string>)[key];
    if (val) return val;
  }
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key]!;
  }
  try {
    const meta = import.meta as unknown as { env?: Record<string, string> };
    if (meta?.env?.[key]) return meta.env[key];
  } catch {
    // Ignore import.meta reading errors
  }
  const fallback = readEnvFileFallback(key);
  return fallback || defaultValue;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function handleAdminImageUpload(
  request: Request,
  entityType: string,
  entityId = "new",
  envObj?: unknown,
): Promise<Response> {
  // 1. Authenticate admin user
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    token = request.headers.get("x-supabase-auth");
  }

  if (!token) {
    return jsonResponse(
      {
        success: false,
        error: "غير مصرح: يرجى تسجيل الدخول بحساب مسؤول أولاً",
      },
      401,
    );
  }

  const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", envObj) || getEnvVar("SUPABASE_URL", envObj);
  const supabaseAnonKey =
    getEnvVar("VITE_SUPABASE_ANON_KEY", envObj) || getEnvVar("SUPABASE_ANON_KEY", envObj);
  const serviceRoleKey =
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY", envObj) || getEnvVar("SUPABASE_SERVICE_KEY", envObj);

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      {
        success: false,
        error: "بيانات الاتصال بقاعدة البيانات غير متوفرة",
      },
      500,
    );
  }

  // Create client with Authorization header so PostgREST applies the authenticated user's RLS policies
  const authedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: userData, error: userError } = await authedSupabase.auth.getUser(token);

  if (userError || !userData?.user) {
    console.error("[admin-image-upload] getUser error:", userError);
    return jsonResponse(
      {
        success: false,
        error: "جلسة تسجيل الدخول منتهية أو غير صالحة، يرجى تسجيل الدخول مجددًا",
      },
      401,
    );
  }

  // Check admin role:
  // (A) from user metadata
  const userMeta = userData.user.user_metadata || {};
  const appMeta = userData.user.app_metadata || {};
  let isAdmin =
    userMeta["role"] === "admin" ||
    appMeta["role"] === "admin" ||
    (userData.user as unknown as { role?: string }).role === "admin";

  // (B) from profiles table using authenticated Supabase client
  if (!isAdmin) {
    const { data: profile, error: profileError } = await authedSupabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      isAdmin = true;
    } else if (profileError) {
      console.warn(
        "[admin-image-upload] Profile query with user token error:",
        profileError.message,
      );
    }
  }

  // (C) fallback check with service role key if available
  if (!isAdmin && serviceRoleKey) {
    try {
      const serviceSupabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: adminProfile } = await serviceSupabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (adminProfile?.role === "admin") {
        isAdmin = true;
      }
    } catch {
      // Ignore service role fallback error
    }
  }

  if (!isAdmin) {
    console.warn(
      "[admin-image-upload] Admin verification failed for user:",
      userData.user.id,
      userData.user.email,
    );
    return jsonResponse(
      {
        success: false,
        error: "هذا الحساب لا يمتلك صلاحيات المسؤول (Admin)",
      },
      403,
    );
  }

  // 2. Parse and validate file upload
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "تعذر قراءة بيانات الطلب (multipart/form-data غير صالح)",
      },
      400,
    );
  }

  const file = (formData.get("file") || formData.get("image")) as File | null;
  if (!file || typeof file === "string" || !file.size) {
    return jsonResponse(
      {
        success: false,
        error: "يرجى اختيار ملف صورة صالح للرفع",
      },
      400,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonResponse(
      {
        success: false,
        error: "حجم الصورة يتجاوز الحد الأقصى المسموح به (25 ميجابايت)",
      },
      413,
    );
  }

  const hasValidMime = file.type && ALLOWED_MIME_TYPES.has(file.type.toLowerCase());
  const hasValidExt = ALLOWED_EXTENSIONS.test(file.name || "");
  if (!hasValidMime && !hasValidExt) {
    return jsonResponse(
      {
        success: false,
        error: "صيغة الملف غير مدعومة. الصيغ المقبولة: PNG, JPEG, WEBP, GIF",
      },
      400,
    );
  }

  // 3. Check API Key
  const apiKey = getEnvVar("IMAGE_UPLOAD_API_KEY", envObj);
  if (!apiKey) {
    console.error("[admin-image-upload] IMAGE_UPLOAD_API_KEY is not configured");
    return jsonResponse(
      {
        success: false,
        error: "خدمة رفع الصور غير مهيأة في الخادم (مفتاح API غير متوفر)",
      },
      500,
    );
  }

  const rawBaseUrl = getEnvVar("IMAGE_UPLOAD_BASE_URL", envObj, "https://omar280sa-we.hf.space");
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const uploadEndpoint = `${baseUrl}/upload`;

  // Read file bytes to allow retrying without stream exhaustion
  const fileBytes = await file.arrayBuffer();
  const fileName = file.name || "image.webp";
  const fileType = file.type || "image/webp";

  const executeExternalUpload = async (): Promise<Response> => {
    const extFormData = new FormData();
    const fileBlob = new Blob([fileBytes], { type: fileType });
    extFormData.append("file", fileBlob, fileName);

    const quality = formData.get("quality");
    if (quality) extFormData.append("quality", String(quality));

    const targetSize = formData.get("target_size");
    if (targetSize) extFormData.append("target_size", String(targetSize));

    const maxWidth = formData.get("max_width");
    if (maxWidth) extFormData.append("max_width", String(maxWidth));

    // 75 seconds timeout for cold start
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 75000);

    try {
      return await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: extFormData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // 4. Send request with 1 retry on timeout / connection failure / 502 / 504
  let extResponse: Response | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await executeExternalUpload();
      // Retry once if cold-start gateway error (502 or 504) on attempt 1
      if ((res.status === 502 || res.status === 504) && attempt === 1) {
        console.warn(
          `[admin-image-upload] Cold start status ${res.status} on attempt 1. Retrying in 2.5s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2500));
        continue;
      }
      extResponse = res;
      break;
    } catch (err: unknown) {
      console.warn(`[admin-image-upload] Attempt ${attempt} failed:`, err);
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        continue;
      }
    }
  }

  if (!extResponse) {
    return jsonResponse(
      {
        success: false,
        error: "الخدمة غير متاحة حاليًا، حاول مرة أخرى بعد قليل",
      },
      503,
    );
  }

  // 5. Handle external response
  if (extResponse.ok) {
    let result: { success?: boolean; url?: string; error?: string } | null = null;
    try {
      result = (await extResponse.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "الخدمة غير متاحة حاليًا، حاول مرة أخرى بعد قليل",
        },
        502,
      );
    }

    if (!result?.success || !result?.url) {
      return jsonResponse(
        {
          success: false,
          error: result?.error || "فشل رفع الصورة، يرجى المحاولة لاحقًا",
        },
        400,
      );
    }

    const uploadedUrl = result.url;

    // Save image_url in database if updating an existing record
    if (entityId && entityId !== "new" && entityId !== "temp") {
      try {
        if (entityType === "products") {
          const { error: dbError } = await authedSupabase
            .from("products")
            .update({
              image_url: uploadedUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", entityId);
          if (dbError) throw dbError;
        } else if (entityType === "categories") {
          const { error: dbError } = await authedSupabase
            .from("categories")
            .update({
              image_url: uploadedUrl,
            })
            .eq("id", entityId);
          if (dbError) throw dbError;
        } else if (entityType === "offers") {
          const { error: dbError } = await authedSupabase
            .from("offers")
            .update({
              image_url: uploadedUrl,
            })
            .eq("id", entityId);
          if (dbError) throw dbError;
        } else if (entityType === "reviews") {
          const { error: dbError } = await authedSupabase
            .from("reviews_gallery")
            .update({
              image_url: uploadedUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", entityId);
          if (dbError) throw dbError;
        }
      } catch (dbErr: unknown) {
        const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        console.error("[admin-image-upload] Database update failed:", msg);
        return jsonResponse(
          {
            success: false,
            error: "تم رفع الصورة بنجاح ولكن فشل تحديث قاعدة البيانات: " + msg,
          },
          500,
        );
      }
    }

    // Return only success and image_url to client (no external details leaked)
    return jsonResponse(
      {
        success: true,
        image_url: uploadedUrl,
      },
      200,
    );
  }

  // Map external status codes to user-friendly messages
  if (extResponse.status === 401) {
    return jsonResponse(
      {
        success: false,
        error: "خطأ في مصادقة خدمة الصور، يرجى التحقق من المفتاح السري",
      },
      401,
    );
  }

  if (extResponse.status === 403) {
    return jsonResponse(
      {
        success: false,
        error: "تم استنفاد كوتا رفع الصور المتاحة، يرجى التواصل مع المسؤول",
      },
      403,
    );
  }

  if (extResponse.status === 400) {
    return jsonResponse(
      {
        success: false,
        error: "الملف المرفوع ليس صورة صالحة. الصيغ المقبولة: PNG, JPEG, WEBP, GIF",
      },
      400,
    );
  }

  if (extResponse.status === 413) {
    return jsonResponse(
      {
        success: false,
        error: "حجم الصورة يتجاوز الحد الأقصى المسموح به (25 ميجابايت)",
      },
      413,
    );
  }

  if (extResponse.status === 429) {
    return jsonResponse(
      {
        success: false,
        error: "تم إرسال طلبات كثيرة في وقت قصير، يرجى المحاولة بعد قليل",
      },
      429,
    );
  }

  if (extResponse.status >= 500) {
    return jsonResponse(
      {
        success: false,
        error: "الخدمة غير متاحة حاليًا، حاول مرة أخرى بعد قليل",
      },
      502,
    );
  }

  return jsonResponse(
    {
      success: false,
      error: "الخدمة غير متاحة حاليًا، حاول مرة أخرى بعد قليل",
    },
    extResponse.status || 500,
  );
}

// Backwards compatibility for product image upload
export async function handleAdminProductImageUpload(
  request: Request,
  productId: string,
  envObj?: unknown,
): Promise<Response> {
  return handleAdminImageUpload(request, "products", productId, envObj);
}

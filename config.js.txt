
/*
  إعدادات تطبيق مفضّلتي
  استبدل القيمتين بعد إنشاء مشروع Supabase.
*/

window.MOFADDALATI_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};

window.mofaddalatiSupabase = null;

(function () {
  const config = window.MOFADDALATI_CONFIG;

  if (
    !config ||
    !config.SUPABASE_URL ||
    !config.SUPABASE_ANON_KEY ||
    config.SUPABASE_URL.includes("YOUR_") ||
    config.SUPABASE_ANON_KEY.includes("YOUR_")
  ) {
    console.warn(
      "مفضّلتي: أكمل إعدادات Supabase في config.js أولاً."
    );
    return;
  }

  if (!window.supabase || !window.supabase.createClient) {
    console.error("تعذر تحميل مكتبة Supabase.");
    return;
  }

  window.mofaddalatiSupabase = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY
  );
})();

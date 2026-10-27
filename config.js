
/*
  إعدادات تطبيق مفضّلتي
  مربوط بمشروع Supabase الخاص: mofaddalati.
  ⚠️ هنا المفتاح العام (publishable) بس — لا تحط أبدًا مفتاح secret أو service_role.
*/

window.MOFADDALATI_CONFIG = {
  SUPABASE_URL: "https://cdzuxyseocpkkpwvhvbx.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_lJuRHoPlLi95HkGNIAnNLg_K9vzthJY"
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

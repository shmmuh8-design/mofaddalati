
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const authSection = $("auth-section");
  const appSection = $("app-section");
  const authForm = $("auth-form");
  const bookmarkForm = $("bookmark-form");
  const authMessage = $("auth-message");
  const bookmarkMessage = $("bookmark-message");
  const bookmarksList = $("bookmarks-list");

  let client = null;
  let bookmarks = [];
  let currentUser = null;

  $("current-year").textContent = new Date().getFullYear();

  function message(element, text, error = false) {
    element.textContent = text;
    element.style.color = error ? "#ff8b8b" : "#86efac";
  }

  function getClient() {
    if (client) return client;

    if (!window.mofaddalatiSupabase) {
      throw new Error(
        "يجب إعداد config.js وربط مشروع Supabase أولًا."
      );
    }

    client = window.mofaddalatiSupabase;
    return client;
  }

  function showApp(user) {
    currentUser = user || null;
    authSection.hidden = !!user;
    appSection.hidden = !user;

    if (user) {
      $("user-email").textContent = user.email || "";
      loadBookmarks();
    } else {
      bookmarks = [];
      bookmarksList.replaceChildren();
    }
  }

  function normalizeUrl(value) {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("يُسمح بروابط HTTP وHTTPS فقط.");
    }
    return url.href;
  }

  async function handleAuth(action) {
    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      message(authMessage, "أدخل البريد الإلكتروني وكلمة المرور.", true);
      return;
    }

    try {
      const sb = getClient();
      message(authMessage, "يرجى الانتظار...");

      let result;

      if (action === "signup") {
        result = await sb.auth.signUp({ email, password });
      } else {
        result = await sb.auth.signInWithPassword({ email, password });
      }

      if (result.error) throw result.error;

      if (action === "signup" && !result.data.session) {
        message(
          authMessage,
          "تم إنشاء الطلب. تحقق من بريدك الإلكتروني لتأكيد الحساب."
        );
        return;
      }

      message(authMessage, "تم تسجيل الدخول.");
      showApp(result.data.user);
    } catch (error) {
      message(authMessage, error.message || "تعذرت العملية.", true);
    }
  }

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuth("login");
  });

  $("signup-btn").addEventListener("click", () => {
    handleAuth("signup");
  });

  $("reset-btn").addEventListener("click", async () => {
    const email = $("email").value.trim();

    if (!email) {
      message(authMessage, "أدخل بريدك الإلكتروني أولًا.", true);
      return;
    }

    try {
      const sb = getClient();
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });

      if (error) throw error;

      message(authMessage, "إذا كان البريد مسجلًا، فستصلك تعليمات الاستعادة.");
    } catch (error) {
      message(authMessage, error.message || "تعذرت استعادة كلمة المرور.", true);
    }
  });

  $("logout-btn").addEventListener("click", async () => {
    try {
      const { error } = await getClient().auth.signOut();
      if (error) throw error;
      showApp(null);
      message(authMessage, "تم تسجيل الخروج.");
    } catch (error) {
      message(bookmarkMessage, error.message || "تعذر تسجيل الخروج.", true);
    }
  });

  bookmarkForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) return;

    try {
      const sb = getClient();
      const title = $("bookmark-title").value.trim();
      const url = normalizeUrl($("bookmark-url").value.trim());
      const category = $("bookmark-category").value.trim() || "عام";
      const notes = $("bookmark-notes").value.trim();

      const { error } = await sb.from("bookmarks").insert({
        user_id: currentUser.id,
        title,
        url,
        category,
        notes
      });

      if (error) throw error;

      bookmarkForm.reset();
      message(bookmarkMessage, "تم حفظ الرابط بنجاح.");
      await loadBookmarks();
    } catch (error) {
      message(bookmarkMessage, error.message || "تعذر حفظ الرابط.", true);
    }
  });

  $("search-bookmarks").addEventListener("input", renderBookmarks);

  async function loadBookmarks() {
    if (!currentUser) return;

    bookmarksList.textContent = "جارٍ تحميل الروابط...";

    try {
      const { data, error } = await getClient()
        .from("bookmarks")
        .select("id,title,url,category,notes,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      bookmarks = data || [];
      renderBookmarks();
    } catch (error) {
      bookmarksList.textContent =
        "تعذر تحميل الروابط. تأكد من إعداد قاعدة بيانات Supabase.";
      message(bookmarkMessage, error.message || "حدث خطأ.", true);
    }
  }

  function renderBookmarks() {
    const query = $("search-bookmarks").value.trim().toLowerCase();
    bookmarksList.replaceChildren();

    const filtered = bookmarks.filter((item) =>
      [item.title, item.url, item.category, item.notes]
        .some((value) => (value || "").toLowerCase().includes(query))
    );

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.textContent = "لا توجد روابط مطابقة حتى الآن.";
      bookmarksList.append(empty);
      return;
    }

    for (const item of filtered) {
      const card = document.createElement("article");
      card.className = "bookmark-card";

      const title = document.createElement("h3");
      title.textContent = item.title;

      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.url;

      const category = document.createElement("span");
      category.className = "bookmark-category";
      category.textContent = item.category || "عام";

      card.append(title, link, document.createElement("br"), category);

      if (item.notes) {
        const notes = document.createElement("p");
        notes.className = "bookmark-notes";
        notes.textContent = item.notes;
        card.append(notes);
      }

      const remove = document.createElement("button");
      remove.className = "delete-btn";
      remove.textContent = "حذف الرابط";

      remove.addEventListener("click", async () => {
        if (!confirm("هل تريد حذف هذا الرابط؟")) return;

        try {
          const { error } = await getClient()
            .from("bookmarks")
            .delete()
            .eq("id", item.id)
            .eq("user_id", currentUser.id);

          if (error) throw error;

          message(bookmarkMessage, "تم حذف الرابط.");
          await loadBookmarks();
        } catch (error) {
          message(bookmarkMessage, error.message || "تعذر الحذف.", true);
        }
      });

      card.append(remove);
      bookmarksList.append(card);
    }
  }

  async function initialize() {
    try {
      const sb = getClient();
      const { data, error } = await sb.auth.getSession();

      if (error) throw error;

      showApp(data.session?.user || null);

      sb.auth.onAuthStateChange((_event, session) => {
        showApp(session?.user || null);
      });
    } catch (error) {
      message(
        authMessage,
        error.message || "أكمل إعدادات Supabase لتشغيل التطبيق.",
        true
      );
    }
  }

  initialize();
})();

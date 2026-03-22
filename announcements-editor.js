(function () {
  var DRAFT_KEY = "npw_announcement_draft";
  var PUBLISHED_KEY = "npw_announcement_published";

  var toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "link", "clean"],
  ];

  var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: toolbarOptions,
    },
    placeholder: "Write your official announcement here…",
  });

  var titleEl = document.getElementById("announce-title");
  var statusEl = document.getElementById("announce-status");
  var lastPubEl = document.getElementById("announce-last-published");

  function loadJson(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveJson(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  function loadDraft() {
    var d = loadJson(DRAFT_KEY);
    if (d && d.html) {
      quill.setContents([]);
      quill.clipboard.dangerouslyPasteHTML(0, d.html);
    }
    if (d && d.title) {
      titleEl.value = d.title;
    }
  }

  function getPayload() {
    return {
      title: String(titleEl.value || "").trim(),
      html: quill.root.innerHTML,
      updatedAt: Date.now(),
    };
  }

  function flash(msg) {
    statusEl.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      statusEl.textContent = "";
    }, 5000);
  }

  function updateLastPublishedNote() {
    var pub = loadJson(PUBLISHED_KEY);
    if (!pub || !pub.publishedAt) {
      lastPubEl.textContent = "";
      return;
    }
    var d = new Date(pub.publishedAt);
    lastPubEl.textContent =
      "Last published: " +
      d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }) +
      (pub.title ? ". " + pub.title : "");
  }

  document.getElementById("btn-draft").addEventListener("click", function () {
    var p = getPayload();
    saveJson(DRAFT_KEY, p);
    flash("Draft saved in this browser.");
  });

  document.getElementById("btn-publish").addEventListener("click", function () {
    var p = getPayload();
    if (!p.html || p.html === "<p><br></p>") {
      flash("Add some content before publishing.");
      return;
    }
    var pub = {
      title: p.title || "Official announcement",
      html: p.html,
      publishedAt: Date.now(),
    };
    saveJson(PUBLISHED_KEY, pub);
    saveJson(DRAFT_KEY, p);
    flash("Published. Open the public homepage to see it (same browser).");
    updateLastPublishedNote();
  });

  document.getElementById("btn-clear").addEventListener("click", function () {
    if (!confirm("Clear the headline and editor content? Draft in storage will be removed.")) {
      return;
    }
    titleEl.value = "";
    quill.setContents([]);
    localStorage.removeItem(DRAFT_KEY);
    flash("Editor cleared.");
    updateLastPublishedNote();
  });

  loadDraft();
  updateLastPublishedNote();
})();

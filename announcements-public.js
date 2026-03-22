(function () {
  var PUBLISHED_KEY = "npw_announcement_published";
  var mount = document.getElementById("official-announcements");

  if (!mount) return;

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function loadPublished() {
    try {
      var raw = localStorage.getItem(PUBLISHED_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function render() {
    var pub = loadPublished();
    if (!pub || !pub.html || pub.html === "<p><br></p>") {
      mount.hidden = true;
      mount.innerHTML = "";
      mount.classList.remove("reveal", "is-visible");
      return;
    }

    var clean = window.DOMPurify ? DOMPurify.sanitize(pub.html) : pub.html;

    mount.hidden = false;
    mount.classList.add("reveal", "is-visible");
    mount.innerHTML =
      '<div class="section-inner official-announcements-inner">' +
      '<h2 class="official-announcements-heading" id="official-announcements-heading">Official announcements</h2>' +
      (pub.title
        ? '<p class="official-announcements-title">' +
          escapeHtml(pub.title) +
          "</p>"
        : "") +
      '<div class="official-announcements-body ql-snow">' +
      '<div class="ql-editor announce-rendered">' +
      clean +
      "</div></div>" +
      (pub.publishedAt
        ? '<p class="official-announcements-date">' +
          new Date(pub.publishedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }) +
          "</p>"
        : "") +
      "</div>";
  }

  render();

  window.addEventListener("storage", function (e) {
    if (e.key === PUBLISHED_KEY) render();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });
  window.addEventListener("focus", render);
})();

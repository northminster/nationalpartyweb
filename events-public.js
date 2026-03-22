(function () {
  var KEY = "npw_events_published";
  var listEl = document.getElementById("events-list");
  if (!listEl) return;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function render() {
    var events = load().filter(function (ev) {
      return ev && (String(ev.title || "").trim() || String(ev.meta || "").trim() || String(ev.desc || "").trim());
    });

    listEl.innerHTML = "";

    if (events.length === 0) {
      var empty = document.createElement("li");
      empty.className = "card events-empty";
      empty.textContent =
        "No events listed yet. Staff can add them under Events in the dashboard. Check Discord for informal updates.";
      listEl.appendChild(empty);
      return;
    }

    events.forEach(function (ev, i) {
      var li = document.createElement("li");
      li.className = "card event-card event-card-enter";
      if (ev.id) li.dataset.eventId = ev.id;

      var title = document.createElement("h3");
      title.className = "event-title";
      title.textContent = ev.title || "Untitled";

      li.appendChild(title);

      if (String(ev.meta || "").trim()) {
        var meta = document.createElement("p");
        meta.className = "event-meta";
        meta.textContent = ev.meta;
        li.appendChild(meta);
      }

      if (String(ev.desc || "").trim()) {
        var desc = document.createElement("p");
        desc.className = "event-desc";
        desc.textContent = ev.desc;
        li.appendChild(desc);
      }

      listEl.appendChild(li);
    });
  }

  render();

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) render();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });
  window.addEventListener("focus", render);
})();

(function () {
  var KEY = "npw_events_published";
  var container = document.getElementById("events-rows");
  var statusEl = document.getElementById("events-status");
  if (!container) return;

  var events = [];

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

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function uid() {
    return "e_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function flash(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      statusEl.textContent = "";
    }, 4500);
  }

  function buildRow(ev) {
    var row = document.createElement("div");
    row.className = "event-edit-row card";
    row.dataset.id = ev.id;

    var fields = document.createElement("div");
    fields.className = "event-edit-fields";

    var tLabel = document.createElement("label");
    tLabel.className = "event-edit-label";
    tLabel.textContent = "Title";
    var tIn = document.createElement("input");
    tIn.type = "text";
    tIn.className = "event-in-title";
    tIn.value = ev.title || "";
    tIn.placeholder = "e.g. Westbridge town hall";
    tLabel.appendChild(tIn);
    fields.appendChild(tLabel);

    var mLabel = document.createElement("label");
    mLabel.className = "event-edit-label";
    mLabel.textContent = "Time and place (or online)";
    var mIn = document.createElement("input");
    mIn.type = "text";
    mIn.className = "event-in-meta";
    mIn.value = ev.meta || "";
    mIn.placeholder = "e.g. 19:00 at Civic Centre, or Discord voice";
    mLabel.appendChild(mIn);
    fields.appendChild(mLabel);

    var dLabel = document.createElement("label");
    dLabel.className = "event-edit-label";
    dLabel.textContent = "Description";
    var dIn = document.createElement("textarea");
    dIn.className = "event-in-desc";
    dIn.rows = 3;
    dIn.value = ev.desc || "";
    dIn.placeholder = "What happens and who it’s for.";
    dLabel.appendChild(dIn);
    fields.appendChild(dLabel);

    row.appendChild(fields);

    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn btn-ghost event-remove-btn";
    rm.textContent = "Remove";
    rm.addEventListener("click", function () {
      events = events.filter(function (x) {
        return x.id !== ev.id;
      });
      row.remove();
      flash("Removed from list (publish to update the public page).");
    });
    row.appendChild(rm);

    return row;
  }

  function gatherFromDom() {
    var out = [];
    container.querySelectorAll(".event-edit-row").forEach(function (row) {
      var id = row.dataset.id || uid();
      var title = (row.querySelector(".event-in-title") && row.querySelector(".event-in-title").value) || "";
      var meta = (row.querySelector(".event-in-meta") && row.querySelector(".event-in-meta").value) || "";
      var desc = (row.querySelector(".event-in-desc") && row.querySelector(".event-in-desc").value) || "";
      if (!title.trim() && !meta.trim() && !desc.trim()) return;
      out.push({ id: id, title: title.trim(), meta: meta.trim(), desc: desc.trim() });
    });
    return out;
  }

  function render() {
    container.innerHTML = "";
    events.forEach(function (ev) {
      container.appendChild(buildRow(ev));
    });
  }

  events = load();
  if (events.length === 0) {
    events = [{ id: uid(), title: "", meta: "", desc: "" }];
  }
  render();

  document.getElementById("btn-add-event").addEventListener("click", function () {
    var ev = { id: uid(), title: "", meta: "", desc: "" };
    events.push(ev);
    container.appendChild(buildRow(ev));
    var last = container.lastElementChild;
    var input = last && last.querySelector(".event-in-title");
    if (input) input.focus();
  });

  document.getElementById("btn-publish-events").addEventListener("click", function () {
    var data = gatherFromDom();
    save(data);
    events = data;
    flash("Saved and published to this browser’s public Events section.");
  });

  document.getElementById("btn-clear-events").addEventListener("click", function () {
    if (!confirm("Remove all events from the public site?")) return;
    events = [];
    save([]);
    container.innerHTML = "";
    flash("All events cleared on the public page.");
  });
})();

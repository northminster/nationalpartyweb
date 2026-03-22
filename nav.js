(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  if (!header || !toggle || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav-is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-menu-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("nav-is-open"));
  });

  nav.querySelectorAll("a, button").forEach(function (el) {
    el.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

  var mq = window.matchMedia("(min-width: 961px)");
  function onWide() {
    if (mq.matches) setOpen(false);
  }
  if (mq.addEventListener) {
    mq.addEventListener("change", onWide);
  } else if (mq.addListener) {
    mq.addListener(onWide);
  }
  window.addEventListener("resize", onWide);

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("site-header--scrolled", y > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

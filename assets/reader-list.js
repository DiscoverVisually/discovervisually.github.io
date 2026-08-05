(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("joined") !== "1") return;
  const form = document.querySelector("[data-reader-form]");
  const success = document.querySelector("[data-reader-success]");
  if (!form || !success) return;
  form.hidden = true;
  success.hidden = false;
  success.focus({ preventScroll: true });
  history.replaceState({}, "", "/reader-list/");
})();

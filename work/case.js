/* Going back to the folder: fade the content, then return to the homepage, which shrinks the paper back in */
document.querySelectorAll("a[data-back]").forEach((a) => {
  a.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 200);
  });
});
/* Coming back with the browser's back button can restore a faded page: undo that */
addEventListener("pageshow", () => document.body.classList.remove("leaving"));

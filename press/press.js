const copyToast = document.querySelector(".copy-toast");
let toastTimer;

function showCopyConfirmation(message) {
  if (!copyToast) return;

  copyToast.textContent = message;
  copyToast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => copyToast.classList.remove("visible"), 1800);
}

async function copyText(text, trigger) {
  const originalLabel = trigger.textContent;
  const preserveMarkup = trigger.classList.contains("color-chip");

  try {
    await navigator.clipboard.writeText(text.trim().replace(/\s+/g, " "));
    if (!preserveMarkup) trigger.textContent = "Copied";
    showCopyConfirmation("Copied to clipboard");
  } catch {
    showCopyConfirmation("Select and copy the text manually");
  }

  if (!preserveMarkup) {
    setTimeout(() => {
      trigger.textContent = originalLabel;
    }, 1800);
  }
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (target) copyText(target.textContent, button);
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy, button));
});

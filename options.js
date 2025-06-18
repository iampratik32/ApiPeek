document.addEventListener("DOMContentLoaded", function() {
  const domainInput = document.getElementById("domain");
  const clearOnNavigateCheckbox = document.getElementById("clearOnNavigate");
  const saveButton = document.getElementById("saveButton");

  // Load saved settings
  browser.storage.local.get(["domain", "clearOnNavigate"], function(data) {
    if (data.domain) {
      domainInput.value = data.domain;
    }
    if (data.clearOnNavigate !== undefined) {
      clearOnNavigateCheckbox.checked = data.clearOnNavigate;
    } else {
      clearOnNavigateCheckbox.checked = true; // Default to checked
    }
  });

  // Save settings
  saveButton.addEventListener("click", function() {
    const domain = domainInput.value.trim();
    const clearOnNavigate = clearOnNavigateCheckbox.checked;
    browser.storage.local.set({ domain: domain, clearOnNavigate: clearOnNavigate }, function() {
      alert("Settings Saved");
    });
  });
});
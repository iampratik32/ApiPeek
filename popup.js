document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("searchInput");
  const apiList = document.getElementById("apiList");

  searchInput.value = "";

  function displayApiCalls(filter = "") {
    browser.storage.local.get(["apiCalls", "domain"], function(data) {
      const apiCalls = data.apiCalls || [];
      const userDomain = data.domain || "None";
      
      if (apiCalls.length === 0) {
        apiList.innerHTML = `<p>No API calls recorded for domain: ${userDomain}</p>`;
        return;
      }

      const hasCheckPermission = apiCalls.some(call => call.url.includes("check-permission"));

      const filteredCalls = apiCalls
        .filter(call => {
          const matches = call.url.toLowerCase().includes(filter.toLowerCase());
          console.log(`Filter "${filter}" on ${call.url}: ${matches}`);
          return matches;
        })
        .reverse();

      if (filteredCalls.length === 0) {
        apiList.innerHTML = `<p>No matching API calls found for domain: ${userDomain}</p>`;
        return;
      }

      apiList.innerHTML = "";
      filteredCalls.forEach(call => {
        const entry = document.createElement("div");
        entry.className = "api-entry";
        const localTimestamp = new Date(call.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
        entry.innerHTML = `<strong>${call.method}</strong> ${encodeURI(call.url)}<br><small>${localTimestamp} | Status: ${call.status}</small>`;
        apiList.appendChild(entry);
      });
    });
  }

  searchInput.addEventListener("input", function() {
    displayApiCalls(searchInput.value);
  });

  document.getElementById("clearButton").addEventListener("click", function() {
    browser.storage.local.set({ apiCalls: [] }, function() {
      if (browser.runtime.lastError) {
        console.error(`Clear storage error: ${browser.runtime.lastError.message}`);
      } else {
        console.log("API calls cleared manually");
      }
      displayApiCalls(searchInput.value);
    });
  });

  document.getElementById("copyButton").addEventListener("click", function() {
    browser.storage.local.get(["apiCalls"], function(data) {
      const apiCalls = data.apiCalls || [];
      const filter = searchInput.value.toLowerCase();
      const filteredCalls = filter ? apiCalls.filter(call => call.url.toLowerCase().includes(filter)) : apiCalls;
      const endpoints = filteredCalls.map(call => call.url).reverse().join("\n"); // Reverse to match display order
      navigator.clipboard.writeText(endpoints).then(() => {
        alert(`Copied ${filteredCalls.length} endpoint(s) to clipboard!`);
      }).catch(err => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy endpoints.");
      });
    });
  });

  document.getElementById("refreshButton").addEventListener("click", function() {
    displayApiCalls(searchInput.value);
  });

  document.getElementById("optionsLink").addEventListener("click", function() {
    browser.runtime.openOptionsPage();
  });

  // Debug storage contents
  // document.getElementById("debugButton").addEventListener("click", function() {
  //   browser.storage.local.get(["apiCalls", "domain", "clearOnNavigate"], function(data) {
  //     console.log("Debug Storage Contents:", JSON.stringify(data, null, 2));
  //     const hasCheckPermission = (data.apiCalls || []).some(call => call.url.includes("check-permission"));
  //     alert(`Storage contents logged to console. Contains check-permission: ${hasCheckPermission}`);
  //   });
  // });

  displayApiCalls();
});
let storageQueue = [];
let isProcessingQueue = false;

function processStorageQueue() {
  if (isProcessingQueue || storageQueue.length === 0) return;
  isProcessingQueue = true;
  const { details, resolve, reject } = storageQueue.shift();

  browser.storage.local.get(["domain", "apiCalls"], function(data) {
    const userDomain = data.domain || "";
    if (userDomain && !details.url.includes(userDomain)) {
      isProcessingQueue = false;
      resolve();
      processStorageQueue();
      return;
    }

    let apiCalls = data.apiCalls || [];
    apiCalls.push({
      url: details.url,
      method: details.method,
      timestamp: new Date().toISOString(),
      status: details.statusCode
    });

    browser.storage.local.set({ apiCalls: apiCalls }, function() {
      if (browser.runtime.lastError) {
        console.error(`Storage write error for ${details.url}: ${browser.runtime.lastError.message}`);
        reject(browser.runtime.lastError);
      } else {
        console.log(`Stored API call: ${details.url} (Total stored: ${apiCalls.length})`);
        // Validate storage
        browser.storage.local.get("apiCalls", function(verifyData) {
          if (verifyData.apiCalls && verifyData.apiCalls.some(call => call.url === details.url)) {
            console.log(`Verified storage for: ${details.url}`);
          } else {
            console.error(`Storage verification failed for: ${details.url}`);
          }
          isProcessingQueue = false;
          resolve();
          processStorageQueue();
        });
      }
    });
  });
}

browser.webRequest.onCompleted.addListener(
  function(details) {
    if (details.statusCode === 200) {
      // Queue the storage operation
      return new Promise((resolve, reject) => {
        storageQueue.push({ details, resolve, reject });
        processStorageQueue();
      });
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Clear API calls on page change or reload, based on user preference
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    browser.storage.local.get("clearOnNavigate", function(data) {
      if (data.clearOnNavigate !== false) {
        browser.storage.local.set({ apiCalls: [] }, function() {
        });
      }
    });
  }
});
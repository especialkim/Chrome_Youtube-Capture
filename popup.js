document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('onBtn').addEventListener('click', function() {
    console.log('On button clicked');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'showFloatingButtons' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
          console.log('Response from content script:', response);
        }
      });
    });
  });
});

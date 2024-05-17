document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('captureBtn').addEventListener('click', function() {
    console.log('Button clicked');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      console.log('Current tab info:', tabs);
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'capture' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
          console.log('Response from content script:', response);
          
          if (response && response.success) {
            console.log('Screenshot captured and copied to clipboard');
            alert('Screenshot captured and copied to clipboard!');
          } else {
            console.log('Failed to capture screenshot');
            alert('Failed to capture screenshot.');
          }
        }
      });
    });
  });
});

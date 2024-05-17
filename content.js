chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in content script', request);
  if (request.action === 'capture') {
    const videoElement = document.querySelector('video.html5-main-video');
    if (videoElement) {
      // 탭에 포커스 주기
      window.focus();
      
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function(blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
          console.log('Screenshot captured and copied to clipboard.');
          sendResponse({ success: true });
        }, function(error) {
          console.error('Error copying to clipboard:', error);
          sendResponse({ success: false });
        });
      }, 'image/png');
      return true;
    } else {
      console.log('Video element not found.');
      sendResponse({ success: false });
    }
  }
});

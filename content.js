chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in content script', request);
  if (request.action === 'showFloatingButtons') {
    createFloatingButtons();
    sendResponse({ success: true });
  }
});

function createFloatingButtons() {
  // 기존 floating 요소가 있으면 삭제
  let existingFloating = document.getElementById('floatingCapture');
  if (existingFloating) {
    existingFloating.remove();
  }

  // floating 요소 생성
  const floatingDiv = document.createElement('div');
  floatingDiv.id = 'floatingCapture';
  floatingDiv.style.position = 'fixed';
  floatingDiv.style.top = '10px';
  floatingDiv.style.right = '10px';
  floatingDiv.style.backgroundColor = 'white';
  floatingDiv.style.border = '1px solid black';
  floatingDiv.style.padding = '10px';
  floatingDiv.style.zIndex = 10000;

  // Capture 버튼 생성
  const captureBtn = document.createElement('button');
  captureBtn.innerText = 'Capture';
  captureBtn.style.display = 'block';
  captureBtn.style.marginBottom = '5px';
  captureBtn.addEventListener('click', function() {
    captureScreenshot();
  });

  // OFF 버튼 생성
  const offBtn = document.createElement('button');
  offBtn.innerText = 'OFF';
  offBtn.style.display = 'block';
  offBtn.addEventListener('click', function() {
    floatingDiv.remove();
  });

  // 버튼을 floating 요소에 추가
  floatingDiv.appendChild(captureBtn);
  floatingDiv.appendChild(offBtn);

  // 페이지에 floating 요소 추가
  document.body.appendChild(floatingDiv);
}

function captureScreenshot() {
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
      }, function(error) {
        console.error('Error copying to clipboard:', error);
      });
    }, 'image/png');
  } else {
    console.log('Video element not found.');
  }
}

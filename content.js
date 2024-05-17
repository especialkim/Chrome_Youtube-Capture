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

    // 비디오의 현재 시간 가져오기
    const currentTime = videoElement.currentTime;
    const hours = Math.floor(currentTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((currentTime % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
    const timestamp = `📌 ${hours}:${minutes}:${seconds}`;

    // 타임스탬프 추가
    ctx.font = '60px Arial';
    ctx.textBaseline = 'bottom';
    const textWidth = ctx.measureText(timestamp).width;

    // 글자 영역에만 배경색 추가
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 반투명 검은색 배경
    ctx.fillRect(canvas.width - textWidth - 50, canvas.height - 100, textWidth + 20, 70);

    // 글자 그리기
    ctx.fillStyle = 'white';
    ctx.fillText(timestamp, canvas.width - textWidth - 40, canvas.height - 30);

    canvas.toBlob(function(blob) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
        console.log('Screenshot captured and copied to clipboard.');
        showNotification('Screenshot captured and copied to clipboard.');
      }, function(error) {
        console.error('Error copying to clipboard:', error);
      });
    }, 'image/png');
  } else {
    console.log('Video element not found.');
  }
}


function showNotification(message) {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '10px';
  notification.style.right = '10px';
  notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = 10000;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000); // 3초 후에 알림을 제거
}

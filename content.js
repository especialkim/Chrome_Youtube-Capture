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
  floatingDiv.style.zIndex = '10000';

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

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

function captureScreenshot() {
  const videoElement = document.querySelector('video.html5-main-video');
  const titleElement = document.querySelector('h1.ytd-watch-metadata');
  const channelElement = document.querySelector('ytd-channel-name a');

  if (videoElement && titleElement && channelElement) {
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

    // 채널명과 제목 가져오기
    let title = titleElement.innerText;
    const channelName = `@ ${channelElement.innerText}`;

    // 제목이 50글자보다 길면 뒤를 ...으로 표시
    if (title.length > 50) {
      title = title.substring(0, 50) + '...';
    }

    // 타임스탬프 추가
    ctx.font = '50px Arial';
    ctx.textBaseline = 'bottom';
    let textWidth = ctx.measureText(timestamp).width;

    // 타임스탬프 배경 그리기
    const timestampY = canvas.height - 26;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 반투명 검은색 배경
    roundRect(ctx, canvas.width - textWidth - 50, timestampY - 64, textWidth + 20, 70, 10, true);

    // 타임스탬프 글자 그리기
    ctx.fillStyle = 'white';
    ctx.fillText(timestamp, canvas.width - textWidth - 40, timestampY);

    // 채널명과 제목 추가
    ctx.font = '40px Arial';
    ctx.textBaseline = 'bottom';
    const titleWidth = ctx.measureText(title).width;
    const channelWidth = ctx.measureText(channelName).width;
    const maxWidth = Math.max(titleWidth, channelWidth);

    // 배경 그리기
    const textY = canvas.height - 60; // 오른쪽 타임스탬프와 같은 y 기준으로 설정
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 반투명 검은색 배경
    roundRect(ctx, 20, textY - 70, maxWidth + 40, 110, 10, true); // 둥근 모서리 적용

    // 채널명 그리기
    ctx.fillStyle = 'white';
    ctx.fillText(channelName, 40, textY - 20);

    // 제목 그리기
    ctx.fillStyle = 'white';
    ctx.fillText(title, 40, textY + 25);

    canvas.toBlob(function(blob) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
        console.log('Screenshot captured and copied to clipboard.');
        showNotification('Screenshot captured and copied to clipboard.');
      }, function(error) {
        console.error('Error copying to clipboard:', error);
      });
    }, 'image/png');
  } else {
    console.log('Video element or title or channel not found.');
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '50%';
  notification.style.right = '50%';
  notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 1500); // 1.5초 후에 알림을 제거
}

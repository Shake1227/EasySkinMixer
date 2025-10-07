console.log("EasySkinMixer: スクリプトを読み込みました。");

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    if (!eventId) {
        document.body.innerHTML = '<h1>無効なURLです。企画IDが指定されていません。</h1>';
        return;
    }

    const currentEvent = EVENTS.find(e => e.id === eventId);
    if (!currentEvent) {
        document.body.innerHTML = `<h1>指定された企画 (${eventId}) は見つかりませんでした。</h1>`;
        return;
    }

    initializeMainContent(currentEvent);

    if (currentEvent.lock === true) {
        if (getCookie(`unlocked-${eventId}`) === 'true') {
            startLoadingAnimation();
        } else {
            showLockScreen(currentEvent);
        }
    } else {
        startLoadingAnimation();
    }
});

function showLockScreen(event) {
    const lockScreen = document.getElementById('lock-screen');
    const keyInput = document.getElementById('key-input');
    const unlockButton = document.getElementById('unlock-button');
    const errorMessage = document.getElementById('lock-error-message');
    const lockIcon = document.getElementById('lock-icon');
    const whiteFadeOverlay = document.getElementById('white-fade-overlay');

    lockScreen.style.display = 'flex';
    setTimeout(() => lockScreen.classList.add('visible'), 10);

    unlockButton.onclick = async () => {
        const inputKey = keyInput.value.trim().toUpperCase();
        if (inputKey === event.lockSecret) {
            errorMessage.textContent = '';
            keyInput.disabled = true;
            unlockButton.disabled = true;
            lockIcon.classList.remove('fa-lock');
            lockIcon.classList.add('fa-lock-open');
            await new Promise(resolve => setTimeout(resolve, 600));
            whiteFadeOverlay.classList.add('visible');
            await new Promise(resolve => setTimeout(resolve, 600));
            lockScreen.classList.remove('visible');
            setTimeout(() => lockScreen.style.display = 'none', 500);
            setCookie(`unlocked-${event.id}`, 'true', 365);
            startLoadingAnimation();
            setTimeout(() => whiteFadeOverlay.classList.remove('visible'), 500);
        } else {
            errorMessage.textContent = '暗号キーが正しくありません。';
        }
    };
}

function startLoadingAnimation() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    loadingScreen.style.display = 'block';
    const percentEl = document.getElementById('progress-percent');
    const barEl = document.getElementById('progress-bar');
    const containerEl = document.querySelector('.container');
    const loadingDuration = 3000;
    const startTime = Date.now();
    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function updateProgress() {
        const elapsedTime = Date.now() - startTime;
        const timeFraction = Math.min(1, elapsedTime / loadingDuration);
        const easedProgress = easeInOutCubic(timeFraction);
        const percent = Math.floor(easedProgress * 100);
        percentEl.textContent = `${percent}%`;
        barEl.style.width = `${percent}%`;
        if (timeFraction < 1) { requestAnimationFrame(updateProgress); }
        else { percentEl.textContent = '100%'; barEl.style.width = '100%'; finishLoadingAnimation(); }
    }
    function finishLoadingAnimation() {
        setTimeout(() => {
            loadingScreen.classList.add('loaded');
            setTimeout(() => {
                loadingScreen.classList.add('gate-open');
                containerEl.style.visibility = 'visible';
                document.body.style.overflow = 'auto';
            }, 1200);
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 2200);
        }, 400);
    }
    requestAnimationFrame(updateProgress);
}

function initializeMainContent(currentEvent) {
    const containerEl = document.querySelector('.container');
    const eventNameEl = document.getElementById('event-name');
    const eventLogoEl = document.getElementById('event-logo');
    const descriptionEl = document.getElementById('description');
    const uploader = document.getElementById('user-skin-upload');
    const uploadAreaEl = document.querySelector('.upload-area');
    const fileNameEl = document.getElementById('file-name');
    const colorPicker = document.getElementById('skin-color-picker');
    const previewArea = document.getElementById('preview-area');
    const skinCanvas = document.getElementById('skin-canvas');
    const previewCanvas = document.getElementById('preview-canvas');
    const downloadButton = document.getElementById('download-button');
    const errorMessageEl = document.getElementById('error-message');
    const skinCtx = skinCanvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');
    const loadedFonts = new Set();
    let uploadedUserSkin = null;

    function loadGoogleFont(fontName) {
        if (!fontName || loadedFonts.has(fontName)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
        document.head.appendChild(link);
        loadedFonts.add(fontName);
    }
    
    if (currentEvent.titleFont) {
        loadGoogleFont(currentEvent.titleFont);
        eventNameEl.style.fontFamily = `'${currentEvent.titleFont}', sans-serif`;
    }
    if (currentEvent.descriptionFont) {
        loadGoogleFont(currentEvent.descriptionFont);
        descriptionEl.style.fontFamily = `'${currentEvent.descriptionFont}', sans-serif`;
    }
    if (currentEvent.bgImage) {
        document.body.style.backgroundImage = `url(${currentEvent.bgImage})`;
        containerEl.classList.add('bg-image-mode');
        uploadAreaEl.classList.add('bg-image-mode');
        if (currentEvent.textColor) { containerEl.style.setProperty('--header-color', currentEvent.textColor); }
    } else if (currentEvent.bgColor) {
        document.body.style.backgroundColor = currentEvent.bgColor;
        updateContainerColor(currentEvent.bgColor, currentEvent.textColor);
    }
    
    eventNameEl.textContent = currentEvent.name;
    descriptionEl.textContent = `あなたのスキンをアップロードして、「${currentEvent.name}」限定スキンと合成しよう！`;
    if (currentEvent.logo) { eventLogoEl.src = currentEvent.logo; eventLogoEl.style.display = 'block'; }
    
    const costumeImg = new Image();
    costumeImg.crossOrigin = "anonymous";
    costumeImg.src = currentEvent.skin;
    costumeImg.onload = () => {};
    costumeImg.onerror = () => { showError('企画スキン画像の読み込みに失敗しました。パスが正しいか確認してください。'); };

    uploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileNameEl.textContent = file.name;
        errorMessageEl.textContent = '';
        const reader = new FileReader();
        reader.onload = (event) => {
            const userSkinImg = new Image();
            userSkinImg.onload = () => {
                if (userSkinImg.width !== 64 || userSkinImg.height !== 64) {
                    showError('スキンファイルは 64x64 ピクセルのPNG画像を選択してください。'); return;
                }
                uploadedUserSkin = userSkinImg;
                rerenderSkin();
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    colorPicker.addEventListener('input', () => {
        if (uploadedUserSkin) rerenderSkin();
    });

    function rerenderSkin() {
        mixSkins(uploadedUserSkin, costumeImg);
        drawPreview(skinCanvas);
        previewArea.classList.add('visible');
        setTimeout(() => previewCanvas.classList.add('visible'), 300);
        setTimeout(() => downloadButton.classList.add('visible'), 500);
    }

    function updateContainerColor(hex, textColor) {
        const r=parseInt(hex.substr(1,2),16),g=parseInt(hex.substr(3,2),16),b=parseInt(hex.substr(5,2),16);
        const yiq=((r*299)+(g*587)+(b*114))/1000;
        const finalTextColor=textColor?textColor:(yiq>=128?'#333':'#f8f9fa');
        containerEl.style.setProperty('--header-color',finalTextColor);
        containerEl.style.setProperty('--text-color',finalTextColor);
        if(yiq<128){
            containerEl.style.setProperty('--container-bg','rgba(255,255,255,0.1)');
            containerEl.style.setProperty('--upload-area-bg','rgba(255,255,255,0.05)');
            containerEl.style.setProperty('--upload-area-border','rgba(255,255,255,0.2)');
        }
    }
    
    function mixSkins(userSkin, costume) {
        skinCtx.clearRect(0, 0, 64, 64);
        skinCtx.fillStyle = colorPicker.value;
        skinCtx.fillRect(16, 16, 24, 16); 
        skinCtx.fillRect(40, 16, 16, 16); 
        skinCtx.fillRect(0, 16, 16, 16);  
        if (costume.height === 64) {
             skinCtx.fillRect(16, 48, 16, 16); 
             skinCtx.fillRect(32, 48, 16, 16); 
        }
        skinCtx.drawImage(costume, 0, 16, 64, 48, 0, 16, 64, 48);
        skinCtx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);
        if (currentEvent.useAccessory === true) {
            skinCtx.drawImage(costume, 0, 0, 64, 16, 0, 0, 64, 16);
        }
        const mixedSkinUrl = skinCanvas.toDataURL('image/png');
        downloadButton.href = mixedSkinUrl;
        downloadButton.download = `EasySkinMixer_${currentEvent.id}_skin.png`;
    }
    function drawPreview(sourceCanvas) {
        const scale = 10;
        previewCanvas.width = 16 * scale;
        previewCanvas.height = 32 * scale;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.imageSmoothingEnabled = false;
        const drawPart = (sx, sy, sw, sh, dx, dy) => { previewCtx.drawImage(sourceCanvas, sx, sy, sw, sh, dx * scale, dy * scale, sw * scale, sh * scale); };
        drawPart(4, 20, 4, 12, 8, 20); drawPart(44, 20, 4, 12, 12, 8);
        drawPart(20, 20, 8, 12, 4, 8); drawPart(20, 36, 8, 12, 4, 8);
        drawPart(4, 20, 4, 12, 4, 20); drawPart(4, 36, 4, 12, 4, 20);
        drawPart(44, 20, 4, 12, 0, 8); drawPart(60, 20, 4, 12, 0, 8);
        drawPart(8, 8, 8, 8, 4, 0); drawPart(40, 8, 8, 8, 4, 0);
    }
    
    function showError(message) {
        const mixerUi = document.getElementById('mixer-ui');
        const loadingMsg = document.getElementById('loading-message');
        if(mixerUi) mixerUi.style.display = 'none';
        if(loadingMsg) loadingMsg.style.display = 'none';
        errorMessageEl.textContent = message;
    }
}
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

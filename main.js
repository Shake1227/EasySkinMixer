// ===== ページの読み込み時の処理 =====
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

    if (currentEvent.lock === true) {
        if (getCookie(`unlocked-${eventId}`) === 'true') {
            startLoadingAnimation();
        } else {
            // ロック画面を表示する前に、フェードオーバーレイとローディング画面を非表示に
            document.getElementById('white-fade-overlay').style.opacity = '0';
            document.getElementById('white-fade-overlay').style.visibility = 'hidden';
            document.getElementById('loading-screen').style.display = 'none';
            
            showLockScreen(currentEvent);
        }
    } else {
        startLoadingAnimation();
    }

    initializeMainContent(currentEvent);
});

// ===== ロック画面の制御 (プロダクトキー方式 & アニメーション) =====
function showLockScreen(event) {
    const lockScreen = document.getElementById('lock-screen');
    const keyInput = document.getElementById('key-input');
    const unlockButton = document.getElementById('unlock-button');
    const errorMessage = document.getElementById('lock-error-message');
    const lockIcon = document.getElementById('lock-icon');
    const whiteFadeOverlay = document.getElementById('white-fade-overlay');

    lockScreen.style.display = 'flex';
    lockScreen.classList.add('active'); // フェードイン用
    lockIcon.className = 'fas fa-lock locked'; // 初期状態をロックに設定

    unlockButton.onclick = async () => {
        const inputKey = keyInput.value.trim().toUpperCase();
        if (validateProductKey(inputKey, event.id, event.lockSecret)) {
            errorMessage.textContent = ''; // エラーメッセージをクリア
            keyInput.disabled = true; // キー入力とボタンを無効化
            unlockButton.disabled = true;

            // 1. 南京錠解除アニメーション
            lockIcon.classList.remove('locked');
            lockIcon.classList.add('unlocked');
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // アニメーション待機 (1秒)

            // 2. ロック画面を非表示に
            lockScreen.classList.remove('active');
            lockScreen.style.display = 'none';

            // 3. 白い画面へフェードイン
            whiteFadeOverlay.classList.add('active');
            await new Promise(resolve => setTimeout(resolve, 500)); // フェードイン待機 (0.5秒)

            // 4. Cookieを保存してローディング開始
            setCookie(`unlocked-${event.id}`, 'true', 365);
            whiteFadeOverlay.classList.remove('active'); // 白いオーバーレイを非表示に戻す (Loading画面で隠れるため厳密には不要だが念のため)
            startLoadingAnimation();

        } else {
            errorMessage.textContent = '暗号キーが正しくありません。';
            keyInput.classList.add('shake'); // 揺れるアニメーション
            setTimeout(() => keyInput.classList.remove('shake'), 500);
        }
    };
}

// (以下、前回のコードから変更なし)
// ===== 暗号キーの検証アルゴリズム =====
function validateProductKey(key, eventId, secret) {
    if (!key || !eventId || !secret) return false;
    const parts = key.split('-');
    if (parts.length !== 4) return false;
    const idPart = parts[0];
    const part1 = parts[1];
    const part2 = parts[2];
    const checksum = parts[3];
    if (idPart !== eventId.substring(0, 2).toUpperCase()) return false;
    let hash = 0;
    const combinedString = `${eventId}-${secret}-${part1}-${part2}`;
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    const calculatedChecksum = (hash & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return checksum === calculatedChecksum;
}

// ===== ローディング画面の制御 =====
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

// ===== メインコンテンツの処理 =====
function initializeMainContent(currentEvent) {
    const containerEl = document.querySelector('.container');
    const eventNameEl = document.getElementById('event-name');
    const eventLogoEl = document.getElementById('event-logo');
    const descriptionEl = document.getElementById('description');
    const uploader = document.getElementById('user-skin-upload');
    const uploadAreaEl = document.querySelector('.upload-area');
    const fileNameEl = document.getElementById('file-name');
    const previewArea = document.getElementById('preview-area');
    const skinCanvas = document.getElementById('skin-canvas');
    const previewCanvas = document.getElementById('preview-canvas');
    const downloadButton = document.getElementById('download-button');
    const errorMessageEl = document.getElementById('error-message');
    const mixerUiEl = document.getElementById('mixer-ui');
    const loadingMessageEl = document.getElementById('loading-message');
    const skinCtx = skinCanvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');

    const loadedFonts = new Set();
    function loadGoogleFont(fontName) {
        if (!fontName || loadedFonts.has(fontName)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
        document.head.appendChild(link);
        loadedFonts.add(fontName);
    }
    function applyCustomFonts(event) {
        if (event.titleFont) {
            loadGoogleFont(event.titleFont);
            eventNameEl.style.fontFamily = `'${event.titleFont}', sans-serif`;
        }
        if (event.descriptionFont) {
            loadGoogleFont(event.descriptionFont);
            descriptionEl.style.fontFamily = `'${event.descriptionFont}', sans-serif`;
        }
    }
    applyCustomFonts(currentEvent);

    if (currentEvent.bgImage) {
        document.body.style.backgroundImage = `url(${currentEvent.bgImage})`;
        containerEl.classList.add('bg-image-mode');
        uploadAreaEl.classList.add('bg-image-mode');
        containerEl.style.setProperty('--text-color', '#333');
        if (currentEvent.textColor) { containerEl.style.setProperty('--header-color', currentEvent.textColor); }
        else { containerEl.style.setProperty('--header-color', '#1a73e8'); }
    } else if (currentEvent.bgColor) {
        document.body.style.backgroundColor = currentEvent.bgColor;
        if (currentEvent.textColor) { updateContainerColor(currentEvent.bgColor, currentEvent.textColor); }
        else { updateContainerColor(currentEvent.bgColor); }
    }

    eventNameEl.textContent = currentEvent.name;
    descriptionEl.textContent = `あなたのスキンをアップロードして、「${currentEvent.name}」限定スキンと合成しよう！`;
    if (currentEvent.logo) { eventLogoEl.src = currentEvent.logo; eventLogoEl.style.display = 'block'; }
    
    const costumeImg = new Image();
    costumeImg.crossOrigin = "anonymous";
    costumeImg.src = currentEvent.skin;
    costumeImg.onload = () => { loadingMessageEl.style.display = 'none'; mixerUiEl.style.display = 'block'; };
    costumeImg.onerror = () => { showError('企画スキン画像の読み込みに失敗しました。パスが正しいか確認してください。'); };

    uploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileNameEl.textContent = file.name;
        errorMessageEl.textContent = '';
        previewArea.classList.remove('visible');
        previewCanvas.classList.remove('visible');
        downloadButton.classList.remove('visible');
        previewArea.style.display = 'block';
        const reader = new FileReader();
        reader.onload = (event) => {
            const userSkinImg = new Image();
            userSkinImg.onload = () => {
                if (userSkinImg.width !== 64 || userSkinImg.height !== 64) {
                    showError('スキンファイルは 64x64 ピクセルのPNG画像を選択してください。');
                    previewArea.style.display = 'none';
                    return;
                }
                mixSkins(userSkinImg, costumeImg);
                drawPreview(skinCanvas);
                setTimeout(() => {
                    previewArea.classList.add('visible');
                    setTimeout(() => {
                        previewArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 1000);
                }, 100);
                setTimeout(() => { previewCanvas.classList.add('visible'); }, 1800);
                setTimeout(() => { downloadButton.classList.add('visible'); }, 2200);
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    function updateContainerColor(hexColor, textColor) {
        const r = parseInt(hexColor.substr(1, 2), 16), g = parseInt(hexColor.substr(3, 2), 16), b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const finalTextColor = textColor ? textColor : (yiq >= 128 ? '#333' : '#f8f9fa');
        containerEl.style.setProperty('--header-color', finalTextColor);
        if (yiq >= 128) {
            containerEl.style.setProperty('--container-bg', 'rgba(0, 0, 0, 0.05)');
            containerEl.style.setProperty('--text-color', finalTextColor);
            containerEl.style.setProperty('--upload-area-bg', 'rgba(0, 0, 0, 0.03)');
            containerEl.style.setProperty('--upload-area-border', 'rgba(0, 0, 0, 0.2)');
        } else {
            containerEl.style.setProperty('--container-bg', 'rgba(255, 255, 255, 0.1)');
            containerEl.style.setProperty('--text-color', finalTextColor);
            containerEl.style.setProperty('--upload-area-bg', 'rgba(255, 255, 255, 0.05)');
            containerEl.style.setProperty('--upload-area-border', 'rgba(255, 255, 255, 0.2)');
        }
    }
    function mixSkins(userSkin, costume) {
        skinCtx.clearRect(0, 0, 64, 64);
        skinCtx.drawImage(costume, 0, 0);
        skinCtx.clearRect(0, 0, 64, 16);
        skinCtx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);
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
        drawPart(4, 20, 4, 12, 8, 20); drawPart(44, 20, 4, 12, 12, 8); drawPart(20, 20, 8, 12, 4, 8); drawPart(20, 36, 8, 12, 4, 8);
        drawPart(4, 20, 4, 12, 4, 20); drawPart(4, 36, 4, 12, 4, 20); drawPart(44, 20, 4, 12, 0, 8); drawPart(60, 20, 4, 12, 0, 8);
        drawPart(8, 8, 8, 8, 4, 0); drawPart(40, 8, 8, 8, 4, 0);
    }
    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
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
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
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

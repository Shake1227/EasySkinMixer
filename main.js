// ===== ローディング画面の制御を修正 =====
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const percentEl = document.getElementById('progress-percent');
    const barEl = document.getElementById('progress-bar');
    const containerEl = document.querySelector('.container');

    const loadingDuration = 3000; // 3秒
    const startTime = Date.now();

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function updateProgress() {
        const elapsedTime = Date.now() - startTime;
        const timeFraction = Math.min(1, elapsedTime / loadingDuration);
        const easedProgress = easeInOutCubic(timeFraction);

        const percent = Math.floor(easedProgress * 100);
        percentEl.textContent = `${percent}%`;
        barEl.style.width = `${percent}%`;

        if (timeFraction < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            // 100%になった瞬間にテキストを更新してからアニメーションを完了
            percentEl.textContent = '100%';
            barEl.style.width = '100%';
            finishLoadingAnimation();
        }
    }

    function finishLoadingAnimation() {
        // 100%表示後、少し間を置いて次のアニメーションへ
        setTimeout(() => {
            loadingScreen.classList.add('loaded'); // "Loading!"テキストと数字フェードアウトを開始

            // "Loading!"表示後、ゲートを開く
            setTimeout(() => {
                loadingScreen.classList.add('gate-open');
                containerEl.style.visibility = 'visible';
                document.body.style.overflow = 'auto';
            }, 800); // 0.8秒後

            // ゲートが開き終わったらローディング画面を非表示に
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1800); // 1.8秒後
        }, 100); // 0.1秒の間
    }
    
    requestAnimationFrame(updateProgress);

    initializeMainContent(); 
});


// ===== 元の処理を関数でラップ (変更なし) =====
function initializeMainContent() {
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

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');

    if (!eventId) {
        showError('無効なURLです。企画IDが指定されていません。');
        return;
    }
    const currentEvent = EVENTS.find(e => e.id === eventId);
    if (!currentEvent) {
        showError('指定された企画が見つかりませんでした。');
        return;
    }

    if (currentEvent.bgImage) {
        document.body.style.backgroundImage = `url(${currentEvent.bgImage})`;
        containerEl.classList.add('bg-image-mode');
        uploadAreaEl.classList.add('bg-image-mode');
        containerEl.style.setProperty('--text-color', '#333'); 
        if (currentEvent.textColor) {
            containerEl.style.setProperty('--header-color', currentEvent.textColor);
        } else {
            containerEl.style.setProperty('--header-color', '#1a73e8'); 
        }
    }
    else if (currentEvent.bgColor) {
        document.body.style.backgroundColor = currentEvent.bgColor;
        if (currentEvent.textColor) {
            updateContainerColor(currentEvent.bgColor, currentEvent.textColor);
        } else {
            updateContainerColor(currentEvent.bgColor);
        }
    }

    eventNameEl.textContent = currentEvent.name;
    descriptionEl.textContent = `あなたのスキンをアップロードして、「${currentEvent.name}」限定スキンと合成しよう！`;
    if (currentEvent.logo) {
        eventLogoEl.src = currentEvent.logo;
        eventLogoEl.style.display = 'block';
    }

    const costumeImg = new Image();
    costumeImg.crossOrigin = "anonymous";
    costumeImg.src = currentEvent.skin;

    costumeImg.onload = () => {
        loadingMessageEl.style.display = 'none';
        mixerUiEl.style.display = 'block';
    };
    costumeImg.onerror = () => {
        showError('企画スキン画像の読み込みに失敗しました。パスが正しいか確認してください。');
    };

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
                    showError('スキンファイルは 64x64 ピクセルのPNG画像を選択してください。');
                    previewArea.style.display = 'none';
                    return;
                }
                mixSkins(userSkinImg, costumeImg);
                drawPreview(skinCanvas);
                previewArea.style.display = 'block';
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function updateContainerColor(hexColor, textColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
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
        const drawPart = (sx, sy, sw, sh, dx, dy) => {
            previewCtx.drawImage(sourceCanvas, sx, sy, sw, sh, dx * scale, dy * scale, sw * scale, sh * scale);
        };
        drawPart(4, 20, 4, 12, 8, 20);
        drawPart(44, 20, 4, 12, 12, 8);
        drawPart(20, 20, 8, 12, 4, 8);
        drawPart(20, 36, 8, 12, 4, 8);
        drawPart(4, 20, 4, 12, 4, 20);
        drawPart(4, 36, 4, 12, 4, 20);
        drawPart(44, 20, 4, 12, 0, 8);
        drawPart(60, 20, 4, 12, 0, 8);
        drawPart(8, 8, 8, 8, 4, 0);
        drawPart(40, 8, 8, 8, 4, 0);
    }

    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
        errorMessageEl.textContent = message;
    }
}

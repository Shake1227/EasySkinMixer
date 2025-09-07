// EasySkinMixer - Main Logic (バージョン3.1 - プレビュー表示修正版)
console.log("EasySkinMixer: プレビュー表示を修正したバージョン3.1のスクリプトを読み込みました。");

document.addEventListener('DOMContentLoaded', () => {
    // UI要素の取得
    const eventNameEl = document.getElementById('event-name');
    const eventLogoEl = document.getElementById('event-logo');
    const descriptionEl = document.getElementById('description');
    const uploader = document.getElementById('user-skin-upload');
    const fileNameEl = document.getElementById('file-name');
    const previewArea = document.getElementById('preview-area');
    const skinCanvas = document.getElementById('skin-canvas'); // 合成・DL用 (非表示)
    const previewCanvas = document.getElementById('preview-canvas'); // プレビュー用 (表示)
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
                
                // 1. スキンを合成する
                mixSkins(userSkinImg, costumeImg);

                // 2. 合成したスキンを新しい画像として読み込み、読み込み完了後にプレビューを描画する
                const mixedSkinImage = new Image();
                mixedSkinImage.onload = () => {
                    drawPreview(mixedSkinImage); // 画像の読み込み完了後にプレビューを描画
                };
                mixedSkinImage.src = skinCanvas.toDataURL('image/png'); // 合成後のCanvasをソースに指定
                
                previewArea.style.display = 'block';
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    /**
     * スキンを合成し、ダウンロードリンクを更新する関数
     */
    function mixSkins(userSkin, costume) {
        skinCtx.clearRect(0, 0, 64, 64);
        skinCtx.drawImage(costume, 0, 0);
        skinCtx.clearRect(0, 0, 64, 16);
        skinCtx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);
        
        const mixedSkinUrl = skinCanvas.toDataURL('image/png');
        downloadButton.href = mixedSkinUrl;
        downloadButton.download = `EasySkinMixer_${currentEvent.id}_skin.png`;
    }

    /**
     * 完成スキンからキャラクターのプレビューイラストを描画する関数
     */
    function drawPreview(skinImage) {
        const scale = 10;
        previewCanvas.width = 16 * scale;
        previewCanvas.height = 32 * scale;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        const drawPart = (sx, sy, sw, sh, dx, dy, dw, dh, flip = false) => {
            previewCtx.save();
            previewCtx.imageSmoothingEnabled = false; // アンチエイリアスを無効化してドット絵をくっきり
            if (flip) {
                previewCtx.translate(previewCanvas.width, 0);
                previewCtx.scale(-1, 1);
                previewCtx.drawImage(skinImage, sx, sy, sw, sh, (16 - dx - dw) * scale, dy * scale, dw * scale, dh * scale);
            } else {
                previewCtx.drawImage(skinImage, sx, sy, sw, sh, dx * scale, dy * scale, dw * scale, dh * scale);
            }
            previewCtx.restore();
        };

        drawPart(4, 20, 4, 12, 4, 20, 4, 12);
        drawPart(4, 20, 4, 12, 8, 20, 4, 12, true);
        drawPart(4, 36, 4, 12, 4, 20, 4, 12);
        drawPart(4, 36, 4, 12, 8, 20, 4, 12, true);
        drawPart(44, 20, 4, 12, 0, 8, 4, 12);
        drawPart(44, 20, 4, 12, 12, 8, 4, 12, true);
        drawPart(60, 20, 4, 12, 0, 8, 4, 12);
        drawPart(60, 20, 4, 12, 12, 8, 4, 12, true);
        drawPart(20, 20, 8, 12, 4, 8, 8, 12);
        drawPart(20, 36, 8, 12, 4, 8, 8, 12);
        drawPart(8, 8, 8, 8, 4, 0, 8, 8);
        drawPart(40, 8, 8, 8, 4, 0, 8, 8);
    }

    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
        errorMessageEl.textContent = message;
    }
});

// EasySkinMixer - Main Logic (安定版 - 2Dプレビュー)

document.addEventListener('DOMContentLoaded', () => {
    // UI要素の取得
    const eventNameEl = document.getElementById('event-name');
    const eventLogoEl = document.getElementById('event-logo');
    const descriptionEl = document.getElementById('description');
    const uploader = document.getElementById('user-skin-upload');
    const fileNameEl = document.getElementById('file-name');
    const previewArea = document.getElementById('preview-area');
    const skinCanvas = document.getElementById('skin-canvas');
    const downloadButton = document.getElementById('download-button');
    const errorMessageEl = document.getElementById('error-message');
    const mixerUiEl = document.getElementById('mixer-ui');
    const loadingMessageEl = document.getElementById('loading-message');

    const skinCtx = skinCanvas.getContext('2d');

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
                
                mixSkins(userSkinImg, costumeImg);
                previewArea.style.display = 'block';
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function mixSkins(userSkin, costume) {
        skinCtx.clearRect(0, 0, 64, 64);
        skinCtx.drawImage(costume, 0, 0);
        skinCtx.clearRect(0, 0, 64, 16);
        skinCtx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);
        
        const mixedSkinUrl = skinCanvas.toDataURL('image/png');
        downloadButton.href = mixedSkinUrl;
        downloadButton.download = `EasySkinMixer_${currentEvent.id}_skin.png`;
    }

    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
        errorMessageEl.textContent = message;
    }
});

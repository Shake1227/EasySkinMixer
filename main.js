// EasySkinMixer - Main Logic (with Debugging)
console.log("EasySkinMixer: スクリプト開始");

document.addEventListener('DOMContentLoaded', () => {
    console.log("EasySkinMixer: DOM読み込み完了");

    // 3Dビューワーライブラリの存在チェック
    if (typeof skinview3d === 'undefined') {
        console.error("致命的エラー: skinview3dライブラリが見つかりません。index.htmlのscriptタグを確認してください。");
        alert("エラー: 3Dプレビューライブラリの読み込みに失敗しました。");
        return;
    }
    console.log("EasySkinMixer: skinview3dライブラリを検出");

    // UI要素の取得
    const eventNameEl = document.getElementById('event-name');
    const eventLogoEl = document.getElementById('event-logo');
    const descriptionEl = document.getElementById('description');
    const uploader = document.getElementById('user-skin-upload');
    const fileNameEl = document.getElementById('file-name');
    const previewArea = document.getElementById('preview-area');
    const canvas = document.getElementById('skin-canvas');
    const downloadButton = document.getElementById('download-button');
    const errorMessageEl = document.getElementById('error-message');
    const mixerUiEl = document.getElementById('mixer-ui');
    const loadingMessageEl = document.getElementById('loading-message');

    const ctx = canvas.getContext('2d');
    let skinViewer;

    try {
        skinViewer = new skinview3d.SkinViewer({
            domElement: document.getElementById("skin-viewer-container"),
            width: 280,
            height: 350
        });
        let control = skinview3d.createOrbitControls(skinViewer);
        control.enableRotate = true;
        control.enableZoom = true;
        control.enablePan = false;
        skinViewer.animations.add(skinview3d.WalkingAnimation);
        console.log("EasySkinMixer: 3Dビューワーの初期化成功");
    } catch (e) {
        console.error("EasySkinMixer: 3Dビューワーの初期化中にエラー発生", e);
        showError("3Dプレビューの初期化に失敗しました。");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    console.log(`EasySkinMixer: URLから取得した企画ID: ${eventId}`);

    if (!eventId) {
        showError('無効なURLです。企画IDが指定されていません。');
        return;
    }

    const currentEvent = EVENTS.find(e => e.id === eventId);
    console.log("EasySkinMixer: 該当する企画情報:", currentEvent);

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
    costumeImg.onload = () => {
        console.log(`EasySkinMixer: 企画スキン画像の読み込み成功: ${costumeImg.src}`);
        loadingMessageEl.style.display = 'none';
        mixerUiEl.style.display = 'block';
        try {
            skinViewer.loadSkin(costumeImg.src);
            console.log("EasySkinMixer: 3Dビューワーへのスキン適用成功");
        } catch (e) {
            console.error("EasySkinMixer: 3Dビューワーへのスキン適用中にエラー発生", e);
            showError("3Dプレビューの表示中にエラーが発生しました。");
        }
    };
    costumeImg.onerror = () => {
        console.error(`EasySkinMixer: 企画スキン画像の読み込み失敗。パスを確認してください: ${currentEvent.skin}`);
        showError('企画スキン画像の読み込みに失敗しました。パスが正しいか確認してください。');
    };
    
    console.log(`EasySkinMixer: 企画スキン画像の読み込みを開始: ${currentEvent.skin}`);
    costumeImg.src = currentEvent.skin;

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
        ctx.clearRect(0, 0, 64, 64);
        ctx.drawImage(costume, 0, 0);
        ctx.clearRect(0, 0, 64, 16);
        ctx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);
        const mixedSkinUrl = canvas.toDataURL('image/png');
        skinViewer.loadSkin(mixedSkinUrl);
        downloadButton.href = mixedSkinUrl;
        downloadButton.download = `EasySkinMixer_${currentEvent.id}_skin.png`;
    }

    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
        errorMessageEl.textContent = message;
    }
});

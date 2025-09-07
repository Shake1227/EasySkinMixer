document.addEventListener('DOMContentLoaded', () => {
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

    // URLから企画IDを取得
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');

    if (!eventId) {
        showError('無効なURLです。企画IDが指定されていません。');
        return;
    }

    // 設定から該当する企画を検索
    const currentEvent = EVENTS.find(e => e.id === eventId);

    if (!currentEvent) {
        showError('指定された企画が見つかりませんでした。');
        return;
    }

    // 企画情報をページに反映
    eventNameEl.textContent = currentEvent.name;
    descriptionEl.textContent = `あなたのスキンをアップロードして、「${currentEvent.name}」限定スキンと合成しよう！`;
    if (currentEvent.logo) {
        eventLogoEl.src = currentEvent.logo;
        eventLogoEl.style.display = 'block';
    }

    // 企画スキン画像を読み込み
    const costumeImg = new Image();
    costumeImg.crossOrigin = "anonymous";
    costumeImg.src = currentEvent.skin;
    
    costumeImg.onload = () => {
        // 読み込み完了後、UIを表示
        loadingMessageEl.style.display = 'none';
        mixerUiEl.style.display = 'block';
    };
    costumeImg.onerror = () => {
        showError('企画スキン画像の読み込みに失敗しました。パスが正しいか確認してください。');
    };


    // ファイルアップロード時の処理
    uploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileNameEl.textContent = file.name;
        errorMessageEl.textContent = ''; // エラーメッセージをクリア

        const reader = new FileReader();
        reader.onload = (event) => {
            const userSkinImg = new Image();
            userSkinImg.onload = () => {
                // 画像のサイズチェック
                if (userSkinImg.width !== 64 || userSkinImg.height !== 64) {
                    showError('スキンファイルは 64x64 ピクセルのPNG画像を選択してください。');
                    previewArea.style.display = 'none';
                    return;
                }
                mixSkins(userSkinImg, costumeImg);
                previewArea.style.display = 'block';
            };
            userSkinImg.onerror = () => {
                showError('画像の読み込みに失敗しました。有効なPNGファイルを選択してください。');
            };
            userSkinImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    /**
     * スキンを合成する関数
     * @param {HTMLImageElement} userSkin - ユーザーのスキン画像
     * @param {HTMLImageElement} costume - 企画の服装スキン画像
     */
    function mixSkins(userSkin, costume) {
        // キャンバスをクリア
        ctx.clearRect(0, 0, 64, 64);

        // 1. 服装スキンを全体に描画
        ctx.drawImage(costume, 0, 0);

        // 2. 服装スキンの頭部全体（レイヤー1, 2）を一度透明にする
        ctx.clearRect(0, 0, 64, 16);

        // 3. ユーザースキンの頭部全体（レイヤー1, 2）を描画
        ctx.drawImage(userSkin, 0, 0, 64, 16, 0, 0, 64, 16);

        // 4. ダウンロードリンクを更新
        downloadButton.href = canvas.toDataURL('image/png');
        downloadButton.download = `EasySkinMixer_${currentEvent.id}_skin.png`;
    }

    /**
     * エラーメッセージを表示する関数
     */
    function showError(message) {
        mixerUiEl.style.display = 'none';
        loadingMessageEl.style.display = 'none';
        errorMessageEl.textContent = message;
    }
});

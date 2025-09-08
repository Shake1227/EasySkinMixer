// ====== 管理者用設定ファイル ======
// ここに企画の情報を追加・編集します

const EVENTS = [
    {
        id: 'casino_suit', // 企画のID (URLに使われます。半角英数字で)
        name: 'inメンシ「スーツ」', // 企画名
        logo: 'http://www.floral-village.info/up/1757264384.png', // 企画ロゴのURL (なければ空文字)
        skin: './skins/casino_suit.png', // 服装スキンのファイルパス
        bgColor: '#2c3e50',
        textColor: '#FFFFFF',
        titleFont: 'Kiwi Maru', // タイトル用のフォント
        descriptionFont: 'Yusei Magic', // 説明文用のフォント
    },
    // --- 新しい企画を追加する場合は、この下にコピーして追記 ---
    // {
    //     id: 'new_event',
    //     name: '新しい企画',
    //     logo: '',
    //     skin: './skins/new_skin.png',
    //     bgImage: 'https://example.com/image.jpg',
    //     textColor: '#333',
    //     titleFont: 'DotGothic16',
    //     descriptionFont: 'Kaisei Opti',
    // }
    // ---------------------------------------------------------
];

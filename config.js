// ====== 管理者用設定ファイル ======
// ここに企画の情報を追加・編集します

const EVENTS = [
    {
        id: 'casino_suit', // 企画のID (URLに使われます。半角英数字で)
        name: 'inメンシ「スーツ」', // 企画名
        logo: 'http://www.floral-village.info/up/1757264384.png', // 企画ロゴのURL (なければ空文字)
        skin: './skins/casino_suit.png', // 服装スキンのファイルパス
        bgColor: '#2c3e50', // 背景色を指定する※背景画像がある場合は不要
        textColor: '#FFFFFF' // 背景画像を指定した際の、文字の色
        // bgImage: 'https://example.com/path/to/your/image.jpg' // 背景画像を指定
    },
    // --- 新しい企画を追加する場合は、この下にコピーして追記 ---
    // {
    //     id: 'new_event',
    //     name: '新しい企画',
    //     logo: '',
    //     skin: './skins/new_skin.png',
    //     bgColor: '',
    //     bgImage: '',
    //     textColor: '' // 背景画像時の文字色
    // }
    // ---------------------------------------------------------
];

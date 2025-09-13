// ====== 管理者用設定ファイル ======
// ここで企画の情報を追加・編集します

const EVENTS = [
    {
        id: 'casino_suit', // 企画のID (URLに使われます。半角英数字で)
        name: 'inメンシ「スーツ」', // 企画名
        logo: 'http://www.floral-village.info/up/1757264384.png', // 企画ロゴのURL (なければ空文字)
        skin: './skins/casino_suit.png', // 服装スキンのファイルパス
        bgImage: 'http://www.floral-village.info/up/1757334996.png',
        textColor: '#000000', // タイトルのカラー
        titleFont: 'Kaisei Tokumin', // タイトル用のフォント
        descriptionFont: 'Kaisei HarunoUmi', // 説明文用のフォント
        lock: true, // trueにするとこの企画にロックがかかる
        lockSecret: 'UNLOCK-CASINO-SUIT', //企画ごとに異なる、秘密の言葉を設定
    },
    {
        id: 'casino_bunny', // 企画のID (URLに使われます。半角英数字で)
        name: 'inメンシ「バニー衣装」', // 企画名
        logo: 'http://www.floral-village.info/up/1757264384.png', // 企画ロゴのURL (なければ空文字)
        skin: './skins/image.png', // 服装スキンのファイルパス
        bgImage: 'http://www.floral-village.info/up/1757334996.png',
        textColor: '#ff69b4', // タイトルのカラー
        titleFont: 'Hachi Maru Pop', // タイトル用のフォント
        descriptionFont: 'Kaisei HarunoUmi', // 説明文用のフォント
        lock: true, // trueにするとこの企画にロックがかかる
        lockSecret: 'UNLOCK-CASINO-BUNNY', //企画ごとに異なる、秘密の言葉を設定
    },
    {
        id: 'example', // 企画のID (URLに使われます。半角英数字で)
        name: 'サンプルページ（学校の制服）', // 企画名
        // logo: '', // 企画ロゴのURL (なければ空文字)
        skin: './skins/example.png', // 服装スキンのファイルパス
        bgImage: 'http://www.floral-village.info/up/1757373978.png',
        textColor: '#000000', // タイトルのカラー
        // titleFont: 'Kaisei Tokumin', // タイトル用のフォント
        // descriptionFont: 'Kaisei HarunoUmi', // 説明文用のフォント
        lock: false, // trueにするとこの企画にロックがかかる
        lockSecret: 'UNLOCK-CASINO-SUIT', //企画ごとに異なる、秘密の言葉を設定
    },
    // --- 新しい企画を追加する場合は、この下にコピーして追記 ---
    // {
    //     id: 'new_event',
    //     name: '新しい企画',
    //     logo: '',
    //     skin: './skins/new_skin.png',
    //     bgImage: 'https://example.com/image.jpg',
    //     bgColor: '#000000',
    //     textColor: '#333',
    //     titleFont: 'DotGothic16',
    //     descriptionFont: 'Kaisei Opti',
    //     lock: true,
    //     lockSecret: 'ANOTHER-UNIQUE-SECRET',
    // }
    // ---------------------------------------------------------
];

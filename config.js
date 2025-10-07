// ====== 管理者用設定ファイル ======
// ここで企画の情報を追加・編集します

const EVENTS = [
    {
        id: 'casino_suit', // 企画のID
        name: 'inメンシ「スーツ」', // 企画名
        logo: 'http://www.floral-village.info/up/1757264384.png', // ロゴURL
        skin: './skins/casino_suit.png', // 衣装スキン
        bgImage: 'http://www.floral-village.info/up/1757334996.png', // 背景画像
        textColor: '#000000', // タイトル色
        titleFont: 'Kaisei Tokumin', // タイトルフォント
        descriptionFont: 'Kaisei HarunoUmi', // 説明文フォント
        lock: true, // ロックの有無
        lockSecret: 'UNLOCK-CASINO-SUIT', // 暗号キーの元
        useAccessory: false, // trueにすると衣装の頭パーツを合成する
    },
    {
        id: 'casino_bunny',
        name: 'inメンシ「バニー衣装」',
        logo: 'http://www.floral-village.info/up/1757264384.png',
        skin: './skins/image.png',
        bgImage: 'http://www.floral-village.info/up/1757334996.png',
        textColor: '#ff69b4',
        titleFont: 'Hachi Maru Pop',
        descriptionFont: 'Kaisei HarunoUmi',
        lock: true,
        lockSecret: 'UNLOCK-CASINO-BUNNY',
        useAccessory: false,
    },
    {
        id: 'cave_explorer',
        name: '洞窟しかない世界で全員集合',
        skin: './skins/cave_explorer.png',
        bgImage: 'http://www.floral-village.info/up/1757373978.png',
        textColor: '#000000',
        lock: false,
        lockSecret: 'UNLOCK-CASINO-SUIT',
        useAccessory: true,
    },
    {
        id: 'example',
        name: 'サンプルページ（学校の制服）',
        skin: './skins/example.png',
        bgImage: 'http://www.floral-village.info/up/1757373978.png',
        textColor: '#000000',
        lock: false,
        lockSecret: 'UNLOCK-CASINO-SUIT',
        useAccessory: false,
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
    //     useAccessory: false // trueにすると衣装の頭パーツを合成する
    // }
    // ---------------------------------------------------------
];

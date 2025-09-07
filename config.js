// ====== 管理者用設定ファイル ======
// ここに企画の情報を追加・編集します

const EVENTS = [
    {
        id: 'casino', // 企画のID (URLに使われます。半角英数字で)
        name: 'カジノ企画', // 企画名
        logo: '', // 企画ロゴのURL (なければ空文字)
        skin: './skins/casino_suit.png' // 服装スキンのファイルパス
    },
    {
        id: 'summer_fes',
        name: '夏祭り企画',
        logo: './path/to/your/logo.png', // ロゴ画像のパスを指定
        skin: './skins/yukata.png' // (例) 浴衣スキンのパス
    },
    // --- 新しい企画を追加する場合は、この下にコピーして追記 ---
    // {
    //     id: 'new_event',
    //     name: '新しい企画',
    //     logo: '',
    //     skin: './skins/new_skin.png'
    // }
    // ---------------------------------------------------------
];

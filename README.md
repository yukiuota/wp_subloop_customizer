# WordPress サブループ作成ツール

WordPressの投稿・カスタム投稿のサブループを簡単に作成できるWebベースのツールです。

## 機能

- **投稿タイプ選択**: 通常投稿、固定ページ、カスタム投稿タイプに対応
- **詳細なフィルタリング**: カテゴリー、タグ、カスタムタクソノミー、カスタムフィールドでの絞り込み
- **柔軟な並び順設定**: 投稿日、更新日、タイトル、メニューオーダー、ランダム、カスタムフィールド値での並び替え
- **カスタマイズ可能な表示項目**: タイトル、本文、抜粋、投稿日、投稿者、アイキャッチ画像、カテゴリー、タグなど
- **PHPコード自動生成**: 設定に基づいて完全なPHPコードを生成
- **コピー＆ダウンロード**: 生成されたコードをクリップボードにコピーまたはファイルとしてダウンロード

### 3. フォームの入力

#### 基本設定
- **投稿タイプ**: 通常投稿、固定ページ、またはカスタム投稿タイプを選択
- **表示件数**: 表示する投稿数を指定（1-100）
- **並び順**: 昇順または降順
- **並び基準**: 投稿日、更新日、タイトルなど

#### フィルタリング
- **カテゴリー指定**: カテゴリーIDまたはスラッグで絞り込み
- **タグ指定**: タグIDまたはスラッグで絞り込み
- **カスタムタクソノミー**: 独自のタクソノミーで絞り込み
- **カスタムフィールド条件**: メタデータでの条件付き絞り込み
- **除外するカテゴリー**: 特定のカテゴリーIDまたはスラッグを除外
- **除外する投稿**: 特定の投稿IDを除外

#### 表示設定
- **表示項目**: タイトル、本文、抜粋、投稿日、投稿者、アイキャッチ画像、カテゴリー、タグから選択
- **アイキャッチ画像サイズ**: サムネイル、中サイズ、大サイズ、フルサイズから選択
- **抜粋文字数**: 抜粋の文字数制限

#### HTMLマークアップ
- **CSSクラス名**: コンテナとアイテムのクラス名を指定
- **メッセージ設定**: 投稿が見つからない場合のメッセージ

### 4. PHPコードの生成

フォームを送信すると、設定に基づいたPHPコードが自動生成されます。

### 5. コードの使用

生成されたコードを以下の方法で使用できます：

- **コピー**: クリップボードにコピーしてテーマファイルに貼り付け
- **ダウンロード**: PHPファイルとしてダウンロードしてアップロード

## 生成されるコードの例

```php
<?php
/**
 * WordPress サブループ
 */

// WP_Queryの引数を設定
$args = array(
    'post_type' => 'news',
    'posts_per_page' => 5,
    'post_status' => 'publish',
    'order' => 'DESC',
    'orderby' => 'date',
);

// サブクエリを実行
$subloop_query = new WP_Query($args);

// 結果を表示
if ($subloop_query->have_posts()) : ?>
    <div class="subloop-container">
        <?php while ($subloop_query->have_posts()) : $subloop_query->the_post(); ?>
            <div class="subloop-item">
                <h3 class="post-title">
                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                </h3>
                <div class="post-date">
                    <time datetime="<?php echo get_the_date('Y-m-d'); ?>">
                        <?php echo get_the_date(); ?>
                    </time>
                </div>
            </div>
        <?php endwhile; ?>
    </div>
<?php else : ?>
    <p class="no-posts-message">投稿が見つかりませんでした。</p>
<?php endif;

// グローバルな$postデータをリセット
wp_reset_postdata();
?>
```

## ファイル構成

```
subloop_customizer/
├── index.html          # メインのHTMLファイル
├── style.css           # スタイルシート
├── script.js           # JavaScript（フォーム処理・コード生成）
└── README.md           # このファイル
```

## 技術仕様

- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、モダンなUI
- **Vanilla JavaScript**: 外部ライブラリ不要
- **WordPress**: WP_Query API準拠

## ブラウザ対応

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## カスタマイズ

### CSSのカスタマイズ

`style.css`を編集してデザインをカスタマイズできます：

```css
/* テーマカラーの変更 */
:root {
    --primary-color: #0073aa;
    --secondary-color: #005a87;
    --background-color: #f5f5f5;
}
```

### 新しい表示項目の追加

`script.js`の`buildPHPCode`関数で新しい表示項目を追加できます：

```javascript
case 'custom-field':
    code += `\n                <div class="custom-field">
        <?php echo get_post_meta(get_the_ID(), 'your_meta_key', true); ?>
    </div>`;
    break;
```

## トラブルシューティング

### よくある問題

1. **カスタム投稿タイプが表示されない**
   - カスタム投稿タイプ名が正しいか確認
   - `public => true`または`publicly_queryable => true`が設定されているか確認

2. **カスタムフィールドでの並び替えが動作しない**
   - メタキーが正しく入力されているか確認
   - カスタムフィールドに値が保存されているか確認

3. **タクソノミーフィルターが動作しない**
   - タクソノミー名とターム名が正しいか確認
   - ターム名はスラッグを使用

## ライセンス

MIT License

## 貢献

バグ報告や機能要望は、GitHubのIssuesにお願いします。

## 更新履歴

- **v1.0.0** (2025/8/3): 初回リリース
  - 基本的なサブループ生成機能
  - レスポンシブデザイン
  - コピー・ダウンロード機能

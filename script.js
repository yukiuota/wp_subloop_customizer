document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('subloop-form');
    const postTypeSelect = document.getElementById('post-type');
    const customPostTypeGroup = document.getElementById('custom-post-type-group');
    const orderbySelect = document.getElementById('orderby');
    const metaKeyGroup = document.getElementById('meta-key-group');
    const outputSection = document.getElementById('output-section');
    const generatedCode = document.getElementById('generated-code');
    const copyButton = document.getElementById('copy-code');
    const downloadButton = document.getElementById('download-code');
    const resetButton = document.getElementById('reset-form');

    // カスタム投稿タイプの表示/非表示切り替え
    postTypeSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customPostTypeGroup.style.display = 'block';
            document.getElementById('custom-post-type').required = true;
        } else {
            customPostTypeGroup.style.display = 'none';
            document.getElementById('custom-post-type').required = false;
        }
    });

    // orderbyでmeta_valueが選択された時のmeta_key表示
    orderbySelect.addEventListener('change', function () {
        if (this.value === 'meta_value') {
            metaKeyGroup.style.display = 'block';
            document.getElementById('meta-key').required = true;
        } else {
            metaKeyGroup.style.display = 'none';
            document.getElementById('meta-key').required = false;
        }
    });

    // フォーム送信処理
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        generatePHPCode();
    });

    // コピーボタン
    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(generatedCode.textContent).then(function () {
            showSuccessMessage('コードをクリップボードにコピーしました！');
        }).catch(function () {
            // フォールバック
            const textArea = document.createElement('textarea');
            textArea.value = generatedCode.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccessMessage('コードをクリップボードにコピーしました！');
        });
    });

    // ダウンロードボタン
    downloadButton.addEventListener('click', function () {
        const blob = new Blob([generatedCode.textContent], {
            type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wordpress-subloop.php';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccessMessage('PHPファイルをダウンロードしました！');
    });

    // リセットボタン
    resetButton.addEventListener('click', function () {
        if (confirm('フォームをリセットしますか？入力内容が削除されます。')) {
            form.reset();
            customPostTypeGroup.style.display = 'none';
            metaKeyGroup.style.display = 'none';
            outputSection.style.display = 'none';
        }
    });

    function generatePHPCode() {
        const formData = new FormData(form);
        const data = {
            postType: formData.get('post-type'),
            customPostType: formData.get('custom-post-type'),
            postsPerPage: parseInt(formData.get('posts-per-page')),
            order: formData.get('order'),
            orderby: formData.get('orderby'),
            metaKey: formData.get('meta-key'),
            category: formData.get('category'),
            tag: formData.get('tag'),
            taxonomy: formData.get('taxonomy'),
            taxonomyTerms: formData.get('taxonomy-terms'),
            metaQueryKey: formData.get('meta-query-key'),
            metaQueryCompare: formData.get('meta-query-compare'),
            metaQueryValue: formData.get('meta-query-value'),
            excludeCategories: formData.get('exclude-categories'),
            excludePosts: formData.get('exclude-posts'),
            displayItems: formData.getAll('display-items'),
            thumbnailSize: formData.get('thumbnail-size'),
            excerptLength: parseInt(formData.get('excerpt-length')),
            containerClass: formData.get('container-class'),
            itemClass: formData.get('item-class'),
            noPostsMessage: formData.get('no-posts-message')
        };

        const phpCode = buildPHPCode(data);
        generatedCode.textContent = phpCode;
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({
            behavior: 'smooth'
        });
    }

    function buildPHPCode(data) {
        let code = `<?php

// WP_Queryの引数を設定
$args = array(`;

        // 基本設定
        if (data.postType === 'custom' && data.customPostType) {
            code += `\n    'post_type' => '${data.customPostType}',`;
        } else if (data.postType && data.postType !== 'custom') {
            code += `\n    'post_type' => '${data.postType}',`;
        }

        code += `\n    'posts_per_page' => ${data.postsPerPage},`;
        code += `\n    'post_status' => 'publish',`;
        code += `\n    'order' => '${data.order}',`;
        code += `\n    'orderby' => '${data.orderby}',`;

        if (data.orderby === 'meta_value' && data.metaKey) {
            code += `\n    'meta_key' => '${data.metaKey}',`;
        }

        // フィルタリング条件
        if (data.category) {
            const categories = data.category.split(',').map(cat => cat.trim());
            if (categories.length === 1) {
                code += `\n    'cat' => ${isNaN(categories[0]) ? `'${categories[0]}'` : categories[0]},`;
            } else {
                code += `\n    'category_name' => '${categories.join(',')}',`;
            }
        }

        if (data.tag) {
            const tags = data.tag.split(',').map(tag => tag.trim());
            code += `\n    'tag' => '${tags.join(',')}',`;
        }

        // カスタムタクソノミーと除外するカテゴリーのtax_query処理
        let taxQueryArray = [];

        // カスタムタクソノミー
        if (data.taxonomy && data.taxonomyTerms) {
            const terms = data.taxonomyTerms.split(',').map(term => term.trim());

            // 全てが数値かどうかをチェック
            const allNumeric = terms.every(term => !isNaN(term) && term !== '');
            const field = allNumeric ? 'term_id' : 'slug';

            // 数値の場合は配列形式、文字列の場合はクォート付き配列形式
            const termsArray = allNumeric ?
                terms.join(', ') :
                `'${terms.join("', '")}'`;

            taxQueryArray.push(`        array(
            'taxonomy' => '${data.taxonomy}',
            'field'    => '${field}',
            'terms'    => array(${termsArray}),
        )`);
        }

        // 除外するカテゴリー（スラッグの場合）
        if (data.excludeCategories) {
            const excludeCategories = data.excludeCategories.split(',').map(cat => cat.trim());
            const categorySlugs = excludeCategories.filter(cat => isNaN(cat));

            if (categorySlugs.length > 0) {
                taxQueryArray.push(`        array(
            'taxonomy' => 'category',
            'field'    => 'slug',
            'terms'    => array('${categorySlugs.join("', '")}'),
            'operator' => 'NOT IN',
        )`);
            }
        }

        // tax_queryを出力
        if (taxQueryArray.length > 0) {
            code += `\n    'tax_query' => array(`;
            if (taxQueryArray.length > 1) {
                code += `\n        'relation' => 'AND',`;
            }
            code += `\n${taxQueryArray.join(',\n')}\n    ),`;
        }

        // カスタムフィールドクエリ
        if (data.metaQueryKey && data.metaQueryValue) {
            code += `\n    'meta_query' => array(
        array(
            'key'     => '${data.metaQueryKey}',
            'value'   => '${data.metaQueryValue}',
            'compare' => '${data.metaQueryCompare}',
        ),
    ),`;
        } else if (data.metaQueryKey && (data.metaQueryCompare === 'EXISTS' || data.metaQueryCompare === 'NOT EXISTS')) {
            code += `\n    'meta_query' => array(
        array(
            'key'     => '${data.metaQueryKey}',
            'compare' => '${data.metaQueryCompare}',
        ),
    ),`;
        }

        // 除外するカテゴリー（IDの場合）
        if (data.excludeCategories) {
            const excludeCategories = data.excludeCategories.split(',').map(cat => cat.trim());
            const categoryIds = excludeCategories.filter(cat => !isNaN(cat));

            if (categoryIds.length > 0) {
                code += `\n    'category__not_in' => array(${categoryIds.join(', ')}),`;
            }
        }

        // 除外する投稿
        if (data.excludePosts) {
            const excludeIds = data.excludePosts.split(',').map(id => id.trim()).filter(id => !isNaN(id));
            if (excludeIds.length > 0) {
                code += `\n    'post__not_in' => array(${excludeIds.join(', ')}),`;
            }
        }

        code += `\n);

// サブクエリを実行
$subloop_query = new WP_Query($args);

// 結果を表示
if ($subloop_query->have_posts()) : ?>
    <div class="${data.containerClass}">`;

        code += `\n        <?php while ($subloop_query->have_posts()) : $subloop_query->the_post(); ?>
            <div class="${data.itemClass}">`;

        // 表示項目の生成
        data.displayItems.forEach(item => {
            switch (item) {
                case 'title':
                    code += `\n                <h3 class="post-title">
                    <?php if (${data.displayItems.includes('permalink') ? 'true' : 'false'}) : ?>
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    <?php else : ?>
                        <?php the_title(); ?>
                    <?php endif; ?>
                </h3>`;
                    break;
                case 'content':
                    code += `\n                <div class="post-content">
                    <?php the_content(); ?>
                </div>`;
                    break;
                case 'excerpt':
                    code += `\n                <div class="post-excerpt">
                    <?php
                    $excerpt = get_the_excerpt();
                    if (mb_strlen($excerpt) > ${data.excerptLength}) {
                        $excerpt = mb_substr($excerpt, 0, ${data.excerptLength}) . '...';
                    }
                    echo $excerpt;
                    ?>
                </div>`;
                    break;
                case 'date':
                    code += `\n                <div class="post-date">
                    <time datetime="<?php echo get_the_date('Y-m-d'); ?>">
                        <?php echo get_the_date(); ?>
                    </time>
                </div>`;
                    break;
                case 'author':
                    code += `\n                <div class="post-author">
                    投稿者: <?php the_author(); ?>
                </div>`;
                    break;
                case 'thumbnail':
                    code += `\n                <?php if (has_post_thumbnail()) : ?>
                    <div class="post-thumbnail">
                        <?php if (${data.displayItems.includes('permalink') ? 'true' : 'false'}) : ?>
                            <a href="<?php the_permalink(); ?>">
                                <?php the_post_thumbnail('${data.thumbnailSize}'); ?>
                            </a>
                        <?php else : ?>
                            <?php the_post_thumbnail('${data.thumbnailSize}'); ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>`;
                    break;
                case 'categories':
                    code += `\n                <div class="post-categories">
                    <?php
                    $categories = get_the_category();
                    if (!empty($categories)) {
                        echo 'カテゴリー: ';
                        $cat_links = array();
                        foreach ($categories as $category) {
                            $cat_links[] = '<a href="' . get_category_link($category->term_id) . '">' . $category->name . '</a>';
                        }
                        echo implode(', ', $cat_links);
                    }
                    ?>
                </div>`;
                    break;
                case 'tags':
                    code += `\n                <div class="post-tags">
                    <?php
                    $tags = get_the_tags();
                    if (!empty($tags)) {
                        echo 'タグ: ';
                        $tag_links = array();
                        foreach ($tags as $tag) {
                            $tag_links[] = '<a href="' . get_tag_link($tag->term_id) . '">' . $tag->name . '</a>';
                        }
                        echo implode(', ', $tag_links);
                    }
                    ?>
                </div>`;
                    break;
            }
        });

        code += `\n            </div>
        <?php endwhile; ?>
    </div>

<?php else : ?>
    <p class="no-posts-message">${data.noPostsMessage}</p>
<?php endif;

// グローバルな$postデータをリセット
wp_reset_postdata();
?>`;

        return code;
    }

    function showSuccessMessage(message) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 新しいメッセージを作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;

        // outputSectionの前に挿入
        outputSection.parentNode.insertBefore(messageDiv, outputSection);

        // 3秒後に自動削除
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    function showErrorMessage(message) {
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'error-message';
        messageDiv.textContent = message;

        outputSection.parentNode.insertBefore(messageDiv, outputSection);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});
/**
 * ファイル管理クラス
 * CSVファイルのアップロードと解析を担当
 */
class FileManager {
    constructor() {
        this.allData = [];
        this.fileMetadata = [];
    }

    /**
     * CSVファイルを処理
     * @param {string} csv - CSV内容
     * @param {string} fileName - ファイル名
     * @returns {number} 読み込んだデータ件数
     */
    parseCSV(csv, fileName) {
        const lines = csv.trim().split('\n');
        let itemCount = 0;

        lines.forEach((line, index) => {
            if (index === 0) return; // ヘッダー行をスキップ

            const parts = line.split(',').map(p => p.trim());

            if (parts.length >= 2) {
                const kanji = parts[0];
                const yomi = parts.length >= 3 ? parts[1] : '';
                const number = parts[parts.length - 1];

                if (kanji && number) {
                    this.allData.push({
                        kanji,
                        yomi,
                        number,
                        source: fileName
                    });
                    itemCount++;
                }
            }
        });

        if (itemCount > 0) {
            this.fileMetadata.push({
                name: fileName,
                count: itemCount
            });
        }

        return itemCount;
    }

    /**
     * ファイルを削除
     * @param {number} index - ファイルメタデータのインデックス
     */
    removeFile(index) {
        const fileName = this.fileMetadata[index].name;
        this.allData = this.allData.filter(item => item.source !== fileName);
        this.fileMetadata.splice(index, 1);
    }

    /**
     * すべてのファイルをクリア
     */
    clearAllFiles() {
        this.allData = [];
        this.fileMetadata = [];
    }

    /**
     * データを取得
     * @returns {Array} 全データ
     */
    getData() {
        return this.allData;
    }

    /**
     * ファイルメタデータを取得
     * @returns {Array} ファイルメタデータ
     */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /**
     * データ件数を取得
     * @returns {number} データ件数
     */
    getDataCount() {
        return this.allData.length;
    }
}

/**
 * 検索管理クラス
 * 検索処理と結果の絞り込みを担当
 */
class SearchManager {
    constructor(fileManager) {
        this.fileManager = fileManager;
        this.searchDebounceTimer = null;
        this.debounceDelay = 300; // ミリ秒
    }

    /**
     * 検索を実行（デバウンス処理あり）
     * @param {string} query - 検索クエリ
     * @param {Function} callback - 検索完了時のコールバック
     */
    performSearch(query, callback) {
        clearTimeout(this.searchDebounceTimer);

        this.searchDebounceTimer = setTimeout(() => {
            const results = this.search(query);
            callback(results);
        }, this.debounceDelay);
    }

    /**
     * 検索を実行
     * @param {string} query - 検索クエリ
     * @returns {Array} 検索結果
     */
    search(query) {
        if (!query || !query.trim()) {
            return [];
        }

        const normalizedQuery = query.trim().toLowerCase();
        const data = this.fileManager.getData();

        return data.filter(item =>
            item.kanji.toLowerCase().includes(normalizedQuery) ||
            item.yomi.toLowerCase().includes(normalizedQuery) ||
            item.number.toLowerCase().includes(normalizedQuery)
        );
    }

    /**
     * 検索結果を分割
     * @param {Array} results - 検索結果
     * @param {number} itemsPerPage - 1ページあたりのアイテム数
     * @returns {Array} 分割されたページ
     */
    paginateResults(results, itemsPerPage = 20) {
        const pages = [];
        for (let i = 0; i < results.length; i += itemsPerPage) {
            pages.push(results.slice(i, i + itemsPerPage));
        }
        return pages.length > 0 ? pages : [[]];
    }
}

/**
 * UI制御クラス
 * 画面表示の更新を担当
 */
class UIController {
    constructor(fileManager, options = {}) {
        this.fileManager = fileManager;
        this.fileStatus = options.fileStatus || document.getElementById('fileStatus');
        this.fileList = options.fileList || document.getElementById('fileList');
        this.searchInput = options.searchInput || document.getElementById('searchInput');
        this.resultsSection = options.resultsSection || document.getElementById('resultsSection');
        this.stats = options.stats || document.getElementById('stats');
        this.fileListContainer = options.fileListContainer || document.getElementById('fileList');
        this.currentPage = 0;
        this.totalPages = 1;
        this.currentResults = [];
    }

    /**
     * ファイル一覧を更新
     */
    updateFileList() {
        const metadata = this.fileManager.getFileMetadata();

        if (metadata.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        this.fileList.innerHTML = metadata.map((file, index) => `
            <div class="file-item">
                <div class="file-item-name">${this.escapeHtml(file.name)}</div>
                <div class="file-item-count">${file.count}</div>
                <button class="file-item-remove" onclick="app.removeFile(${index})">削除</button>
            </div>
        `).join('');
    }

    /**
     * ファイル読み込み成功時のUI更新
     */
    updateFileStatus() {
        const count = this.fileManager.getDataCount();

        if (count === 0) {
            this.fileStatus.textContent = '✗ データが見つかりません';
            this.fileStatus.classList.remove('success');
            return;
        }

        this.fileStatus.innerHTML = `✓ ${count}件のデータを読み込みました`;
        this.fileStatus.classList.add('success');
        this.searchInput.disabled = false;
        this.searchInput.focus();
        this.updateStats();
        this.updateFileList();
    }

    /**
     * 検索結果を表示
     * @param {Array} results - 検索結果
     * @param {Array} paginatedPages - ページネーション済みの結果
     */
    displayResults(results, paginatedPages) {
        if (results.length === 0) {
            this.resultsSection.innerHTML = '<div class="no-results">⚠️ 見つかりませんでした</div>';
            this.stats.innerHTML = '';
            return;
        }

        this.currentResults = paginatedPages;
        this.totalPages = paginatedPages.length;
        this.currentPage = 0;
        this.showPage(0);

        // 結果セクションにフォーカス
        setTimeout(() => this.resultsSection.focus(), 100);
    }

    /**
     * 指定ページを表示
     * @param {number} pageIndex - ページインデックス
     */
    showPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.currentResults.length) {
            return;
        }

        this.currentPage = pageIndex;
        const pageResults = this.currentResults[pageIndex];

        this.resultsSection.innerHTML = pageResults
            .map(item => `
                <div class="result-item">
                    <div class="result-number">${this.escapeHtml(item.number)}</div>
                    <div class="result-info">
                        <div class="result-kanji">${this.escapeHtml(item.kanji)}</div>
                        ${item.yomi ? `<div class="result-yomi">${this.escapeHtml(item.yomi)}</div>` : ''}
                        <div class="result-source">${this.escapeHtml(item.source)}</div>
                    </div>
                </div>
            `).join('');

        this.updatePaginationUI();
    }

    /**
     * ページネーションUIを更新
     */
    updatePaginationUI() {
        const totalResults = this.currentResults.reduce((sum, page) => sum + page.length, 0);
        const startItem = this.currentPage * 20 + 1;
        const endItem = Math.min((this.currentPage + 1) * 20, totalResults);

        if (this.totalPages <= 1) {
            // ページネーション不要
            this.stats.innerHTML = `<div class="stats">${totalResults}件の検索結果</div>`;
        } else {
            const paginationHTML = `
                <div class="stats with-pagination">
                    <div class="pagination-info">${startItem}～${endItem} / ${totalResults}件</div>
                    <div class="pagination">
                        <button class="pagination-btn" onclick="app.previousPage()" ${this.currentPage === 0 ? 'disabled' : ''}>← 前へ</button>
                        <span class="pagination-info" style="font-size: var(--font-size-sm);">${this.currentPage + 1} / ${this.totalPages}</span>
                        <button class="pagination-btn" onclick="app.nextPage()" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''}>次へ →</button>
                    </div>
                </div>
            `;
            this.stats.innerHTML = paginationHTML;
        }
    }

    /**
     * 統計情報を更新
     */
    updateStats() {
        const count = this.fileManager.getDataCount();
        if (count > 0) {
            this.stats.innerHTML = `<div class="stats">${count}件のデータを読み込みました</div>`;
        }
    }

    /**
     * 空状態を表示
     */
    showEmptyState() {
        this.resultsSection.innerHTML = '<div class="empty-state">ファイルを選択してください</div>';
        this.stats.innerHTML = '';
    }

    /**
     * 検索待機状態を表示
     */
    showSearchPrompt() {
        this.resultsSection.innerHTML = '<div class="empty-state">検索キーワードを入力してください</div>';
    }

    /**
     * HTML特殊文字をエスケープ
     * @param {string} text - テキスト
     * @returns {string} エスケープされたテキスト
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * メインアプリケーションクラス
 * 全体の統合と制御を担当
 */
class KanjiSearchApp {
    constructor(options = {}) {
        this.fileManager = new FileManager();
        this.searchManager = new SearchManager(this.fileManager);
        this.uiController = new UIController(this.fileManager, options);
        this.csvFile = options.csvFile || document.getElementById('csvFile');
        this.searchInput = options.searchInput || document.getElementById('searchInput');
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.setupEventListeners();
        this.uiController.showEmptyState();
    }

    /**
     * イベントリスナーのセットアップ
     */
    setupEventListeners() {
        if (this.csvFile) {
            this.csvFile.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.performSearch());
        }

        // ドラッグ&ドロップ対応
        const fileInputLabel = document.querySelector('.file-input-label');
        if (fileInputLabel) {
            fileInputLabel.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileInputLabel.classList.add('drag-over');
            });

            fileInputLabel.addEventListener('dragleave', () => {
                fileInputLabel.classList.remove('drag-over');
            });

            fileInputLabel.addEventListener('drop', (e) => {
                e.preventDefault();
                fileInputLabel.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.csvFile.files = files;
                    this.handleFileUpload({ target: { files } });
                }
            });
        }
    }

    /**
     * ファイルアップロード処理
     * @param {Event} event - ファイルイベント
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('CSVファイルを選択してください');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const count = this.fileManager.parseCSV(csv, file.name);

                if (count > 0) {
                    this.uiController.updateFileStatus();
                    this.csvFile.value = '';
                } else {
                    alert('有効なデータが見つかりませんでした');
                }
            } catch (error) {
                console.error('ファイル読み込みエラー:', error);
                alert(`ファイルの読み込みに失敗しました: ${file.name}`);
            }
        };

        reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました');
        };

        reader.readAsText(file);
    }

    /**
     * 検索を実行
     */
    performSearch() {
        const query = this.searchInput.value;

        if (!query.trim()) {
            this.uiController.showSearchPrompt();
            return;
        }

        this.searchManager.performSearch(query, (results) => {
            const paginatedPages = this.searchManager.paginateResults(results);
            this.uiController.displayResults(results, paginatedPages);
        });
    }

    /**
     * ファイルを削除
     * @param {number} index - ファイルインデックス
     */
    removeFile(index) {
        this.fileManager.removeFile(index);
        this.uiController.updateFileStatus();

        if (this.searchInput.value) {
            this.performSearch();
        }
    }

    /**
     * すべてのファイルをクリア
     */
    clearAllFiles() {
        if (!confirm('すべてのファイルを削除しますか？')) {
            return;
        }

        this.fileManager.clearAllFiles();
        this.uiController.fileStatus.innerHTML = '';
        this.uiController.fileStatus.classList.remove('success');
        this.uiController.fileList.innerHTML = '';
        this.searchInput.disabled = true;
        this.searchInput.value = '';
        this.uiController.showEmptyState();
    }

    /**
     * 次ページへ
     */
    nextPage() {
        if (this.uiController.currentPage < this.uiController.totalPages - 1) {
            this.uiController.showPage(this.uiController.currentPage + 1);
        }
    }

    /**
     * 前ページへ
     */
    previousPage() {
        if (this.uiController.currentPage > 0) {
            this.uiController.showPage(this.uiController.currentPage - 1);
        }
    }

    /**
     * 検索フィールドをクリア
     */
    clearSearch() {
        this.searchInput.value = '';
        this.uiController.showSearchPrompt();
    }
}

// グローバルインスタンス
let app;

// DOMContentLoaded時にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    app = new KanjiSearchApp();
});

/**
 * 認証管理クラス
 * パスワード検証とハッシュ化を担当
 */
class AuthManager {
    constructor(passwordHash, options = {}) {
        this.passwordHash = passwordHash;
        this.passwordScreen = options.passwordScreen || document.getElementById('passwordScreen');
        this.mainScreen = options.mainScreen || document.getElementById('mainScreen');
        this.passwordInput = options.passwordInput || document.getElementById('passwordInput');
        this.passwordError = options.passwordError || document.getElementById('passwordError');
        this.storageKey = 'kanji_search_authenticated';
        this.init();
    }

    /**
     * 初期化処理
     */
    init() {
        // 既に認証済みかチェック
        if (this.isAuthenticated()) {
            // 認証済み：メイン画面を表示
            this.showMainScreen();
        } else {
            // 未認証：パスワード画面を表示
            this.showPasswordScreen();
            this.setupEventListeners();
        }
    }

    /**
     * 認証済みかチェック（SessionStorage確認）
     * @returns {boolean} 認証済みならtrue
     */
    isAuthenticated() {
        return sessionStorage.getItem(this.storageKey) === 'true';
    }

    /**
     * イベントリスナーのセットアップ
     */
    setupEventListeners() {
        if (this.passwordInput) {
            this.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkPassword();
                }
            });
        }
    }

    /**
     * SHA-256ハッシュ関数
     * @param {string} message - ハッシュ化する文字列
     * @returns {Promise<string>} ハッシュ値
     */
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * パスワードの正誤判定
     */
    async checkPassword() {
        const input = this.passwordInput.value;

        if (!input) {
            this.showError('パスワードを入力してください');
            return;
        }

        const inputHash = await this.sha256(input);

        if (inputHash === this.passwordHash) {
            this.authenticate();
        } else {
            this.showError('✗ パスワードが異なります');
            this.passwordInput.value = '';
            this.passwordInput.focus();
        }
    }

    /**
     * 認証成功時の処理
     */
    authenticate() {
        // SessionStorageに認証状態を保存
        sessionStorage.setItem(this.storageKey, 'true');
        this.showMainScreen();
    }

    /**
     * メイン画面を表示
     */
    showMainScreen() {
        this.passwordScreen.classList.add('hidden');
        this.mainScreen.classList.remove('hidden');
        this.hideError();
    }

    /**
     * パスワード画面を表示
     */
    showPasswordScreen() {
        this.mainScreen.classList.add('hidden');
        this.passwordScreen.classList.remove('hidden');
        this.hideError();
    }

    /**
     * エラーメッセージの表示
     * @param {string} message - エラーメッセージ
     */
    showError(message) {
        if (this.passwordError) {
            this.passwordError.textContent = message;
            this.passwordError.classList.add('show');
        }
    }

    /**
     * エラーメッセージの非表示
     */
    hideError() {
        if (this.passwordError) {
            this.passwordError.classList.remove('show');
        }
    }

    /**
     * ログアウト処理
     */
    logout() {
        sessionStorage.removeItem(this.storageKey);
        this.passwordInput.value = '';
        this.mainScreen.classList.add('hidden');
        this.passwordScreen.classList.remove('hidden');
        this.hideError();
        this.passwordInput.focus();
    }
}

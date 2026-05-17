#!/usr/bin/env python3
"""
簡易HTTPサーバー
ローカル開発用のサーバー

使用方法:
    python server.py

ブラウザで以下にアクセス:
    http://localhost:8000
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# サーバーのポート
PORT = 8000

# スクリプトのディレクトリに移動
script_dir = Path(__file__).parent
os.chdir(script_dir)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """カスタムHTTPリクエストハンドラー"""

    def end_headers(self):
        """レスポンスヘッダーにキャッシュ制御を追加"""
        # ブラウザキャッシュを無効化（開発用）
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        """ログメッセージのフォーマット"""
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

def run_server():
    """サーバーを起動"""
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 60)
            print("📡 ローカルサーバーを起動しました")
            print("=" * 60)
            print(f"URL: {url}")
            print(f"ポート: {PORT}")
            print("")
            print("ブラウザでアクセスしてください:")
            print(f"  🔗 {url}")
            print("")
            print("サーバーを停止するには Ctrl+C を押してください")
            print("=" * 60)
            print("")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nサーバーを停止しました")
        sys.exit(0)
    except OSError as e:
        print(f"❌ エラー: {e}")
        print(f"ポート {PORT} は既に使用されているか、アクセス権がありません")
        sys.exit(1)

if __name__ == "__main__":
    run_server()

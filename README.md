# tweet-s2luv

#### これは何?  
自分がtwitterでfavorite(love)したツイートをspreadsheetに列挙し、画像・動画をdriveに保存します  
このrepositoryをForkし必要な`Token`を`Settings > Secrets`に登録すれば自動で収集する様になっています

## Setup
### ※注意
_導入はかなり面倒くさいです_

### 準備
1. GCP Service Account を作成します (https://console.cloud.google.com/)
1.  `Drive API` と`Sheets API` を有効化し、`JSON` タイプのキーを作成し、保存しておきます
    1. `Drive API` と`Sheets API` を有効化します (https://console.cloud.google.com/apis/library)
    1. 作成したサービスアカウントを選択肢、`JSON` タイプのキーを作成し、保存しておきます (https://console.cloud.google.com/iam-admin/serviceaccounts)
1. ファイルリストを保存する為に、`Google Spreadsheets` に新しいシートを作ります (https://docs.google.com/spreadsheets)
    1. そのIDとシートの名前をコピーしておきます
    1. そのシートに上記で作成したサービスアカウントに共有設定します
1. ファイルを保存する為に、`Google Drive` にフォルダを作ります (https://drive.google.com/drive)
    1. そのIDをコピーしておきます
    1. そのフォルダに上記で作成したサービスアカウントに共有設定します
1. Twitter Developers ページで、任意のアカウントでログインします (https://developer.twitter.com/en/apps/)
   1. 新しいApp を作成するために開発者申請をします
   1. 新しいApp を作成し、Bearer Token を作成し、それをコピーしておきます
1. 利用したいTwitter Account のID をコピーしておきます

### 始めるために
1. このrepository をFork します
1. `.github/workflows/schedule.yml` の[環境変数](https://github.com/ivgtr/tweet-s2luv/blob/master/.github/workflows/schedule.yml#L24-L31) を編集します:
   - **TWITTER_ID:** 利用するTwitter のID
   - **SHEET_NAME:** 利用するSpreadsheets の名前 (Sheet1/シート1)
1. repository のSettings > Secrets へ行きます
1. 以下の環境変数を追加します:
   - **TWITTER_TOKEN:** 上記で生成された Twitter のBearer Token
   - **SHEET_NAME:** 利用するSpreadsheets のシートID: `https://docs.google.com/spreadsheets/d/`**`xxxxxxxxxxxxxxxxxxxx`**`/edit`.
   - **DRIVE_FOLDER_ID:** 利用するDrive のシートID: `https://drive.google.com/drive/folders/`**`xxxxxxxxxxxxxxxxxxxx`**.
   - **SERVICE_CLIENT_EMAIL:** 上記で保存したサービスアカウントの`JSON` 鍵の`client_email` 部分
   - **SERVICE_PRIVATE_KEY:** 上記で保存したサービスアカウントの`JSON` 鍵の`private_key` 部分
     - 改行コードが含まれていると上手く動かないので除去し、改行する
     - `$ echo "実際のkey"` などすると良い感じ出力される

## 進捗
- [x] ツイートを取得
- [x] 取得したツイートとスプレッドシートを比較
- [x] スプレッドシートにツイートを整形し、保存
- [x] ツイートの画像・動画をドライヴに保存
- [x] ドライヴに保存中、エラーが起きた際のハンドリング
- [x] CIの設定
- [ ] CIのエラーハンドリング(何故かエラーでも正常と処理されてる)
## License
MIT ©[ivgtr](https://github.com/ivgtr)


[![Twitter Follow](https://img.shields.io/twitter/follow/mawaru_hana?style=social)](https://twitter.com/mawaru_hana) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE) [![Donate](https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square)](https://www.buymeacoffee.com/ivgtr)  
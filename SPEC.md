Vite + React + TypeScript の既存プロジェクトに、漫画ネーム用の静的UIモックを作成してください。

目的：
まずは一切動かなくてよいので、画面構造とCSS設計だけを整えます。機能実装、保存、ドラッグ、クリックイベント、ページめくり、入力処理はまだ不要です。ダミーデータ表示のみで構いません。

画面仕様：

* 白または暗色ベースの作業ツールUI
* 上部ヘッダー
* メイン領域は左フレーム、中央フレーム、右フレーム、サブフレームで構成
* デフォルト配置：

  * 左：ツール・作品情報・ページ操作・登場人物
  * 中央：見開き漫画ページ
  * 右：2ページ分のト書き / コマ内容
  * サブ：見開きページのリストまたはサムネイル
* 中央フレームは、現時点では白紙の漫画ページ2枚だけでよい
* 各ページには「仕上がり枠」と「内枠 / 基本枠」を表示する
* 1ページ目は扉ページ想定の表示ブロックを用意するが、まだ動作は不要
* スマホ対応は軽くでよいが、狭い画面では縦に積まれても破綻しないCSSにする

CSS設計：
Phaināの反省としてCSSを増やしすぎない方針にしたいです。以下のCSSファイルに分けてください。

src/styles/reset.css
src/styles/tokens.css
src/styles/typography.css
src/styles/layout.css
src/styles/components.css

方針：

* 色、余白、角丸、フォントサイズ、境界線、影は tokens.css のCSS変数に集約
* 文字系は typography.css に統一
* 本文、項目タイトル、補助テキスト、登場人物チップ、コマNo.などの共通クラスを作る
* ボタン、入力欄風の表示、チップ、カード、セクションなどは components.css にまとめる
* layout.css はアプリ全体、ペイン配置、中央キャンバス、漫画ページ配置に限定する
* コンポーネント内に個別の見た目CSSを増やしすぎない

ファイル構成：
以下のように、フレームと機能を分けてください。

src/layout/AppShell.tsx
src/layout/PaneLayout.tsx
src/layout/LeftPane.tsx
src/layout/CenterPane.tsx
src/layout/RightPane.tsx
src/layout/SubPane.tsx

src/features/project/ProjectInfoBlock.tsx
src/features/tools/PageControlBlock.tsx
src/features/tools/ToolBlock.tsx
src/features/characters/CharacterBlock.tsx
src/features/canvas/SpreadCanvas.tsx
src/features/canvas/MangaPage.tsx
src/features/canvas/PageFrame.tsx
src/features/script/ScriptBlock.tsx
src/features/script/ScriptBeatItem.tsx
src/features/navigator/SpreadNavigator.tsx

命名ルール：

* Pane = アプリのフレーム
* Page = 漫画の1ページ
* Spread = 見開き
* Panel = 漫画のコマ
* Beat = ト書き / コマ内容1セット
* Character = 登場人物

UI内容：
左フレーム：

* 作品情報
* プロジェクト名のダミー表示
* 「1ページ目を扉にする」のチェック風UI。デフォルトONに見える状態
* ページ操作：◀ ▶、ページ削除用の入力欄風UI
* ツール：コマ追加、選択、ナイフ、削除などのボタン風UI
* 登場人物：色付きタグチップを数個表示

中央フレーム：

* 見開きページ2枚
* 白紙ページ
* 仕上がり枠
* 内枠 / 基本枠
* ページ番号表示
* ダミーのコマはまだ不要。入れる場合もごく薄いサンプル程度にする

右フレーム：

* 「コマ内容」セクション
* 「コマ番号自動入力」のチェック風UI
* コマNo. + 内容のダミーセットを3件程度表示
* 各セットはカード風にする

サブフレーム：

* p.1 扉
* p.2-3
* p.4-5
* p.6-7
  のようなリストまたは小さいサムネイル風カードを横または縦に表示
* スクロールバーは目立たせない

実装上の注意：

* まだ状態管理は最小限でよい
* ボタンにonClickは不要
* 入力欄は実際に入力可能でなくてもよい
* まずは見た目の完成度を優先
* App.tsxはAppShellを呼ぶだけに近い構成にする
* TypeScriptエラーが出ないようにする
* npm run build が通る状態にする
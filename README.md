# Sound Recorder - Powered by Haxe
PC のマイクから録音した音声データを再生する swf モジュールです。


## Description
Web Audio 非対応ブラウザに向けた音声録音モジュールを生成するためのプロジェクトです。ソースコードはマルチパラダイムプログラミング言語である [HAXE](https://haxe.org/) で書かれており、そこから swf ファイルを生成します。


## Requirement
- Haxe v3.2.1
- Node.js v7.3.0
  - npm v4.0.5
  - yarn v0.18.1

## Usage

### How to use the DEMO

1. `npm`コマンドを実行します。
	```console
	$ npm run watch
	```

### How to build

1. `npm run build` コマンドを実行します。
	```console
	$ npm run build
	```
	`./dist` ディレクトリに `avm.swf` が生成されます。

## Installation
1. Haxe コンパイラをインストールします。
	```console
	$ brew install haxe
	```
1. Haxe の IntelliJ 用プラグインをインストールします。
    1. [Haxe Foundation の公式リポジトリ](https://github.com/HaxeFoundation/intellij-haxe/releases)から Latest release 版の `jar` をダウンロード
    2. IntelliJ の `Preference` > `Plugins` を開き、 `Install from disk...` からダウンロードした jar ファイルを選択してインストール
1. ビルドに必要な Node モジュールをインストールします
	```console
	$ yarn install
	```

## Author
@wakamsha

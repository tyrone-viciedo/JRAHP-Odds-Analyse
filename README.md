# 中央競馬(JRA)のオッズ取得するプログラム
このソースコードは中央競馬のHP、すなわちJRAのホームページからオッズを取得するプログラムになっています。
Googleの無料で使えるPaaSのGoogle Apps Script(GAS)を用いているので、環境構築などの準備はほぼ不要です。
また、定期実行なども行えるので使いやすいプログラムとなっております。

# プログラムの説明
このプログラムはJRAのHPからオッズを取得し、スプレッドシートに書き込むGoogle Apps Scriptのソースコードです。

# ソースの説明
JRAのHPでは、URLをGETしただけではオッズページにたどり着くことはできないです。
指定のURLに対して、payloadパラメータ（**cname**とよびます）を指定してPOSTすることで、オッズページでたどり着くことでできます。

このソースのざっくりな構成として

- 今週行われる全レースのcnameパラメータを取得し、スプレッドシートへ書き込む
- cnameパラメータを送信し、オッズページの解析を行いスプレッドシートへ書き込む

のが書き込み操作の主な機能です

そして、オッズの読み取りは
- 軸を2頭選んで、3連単の合成オッズ、3連複のオッズ、ワイドのオッズを算出

という機能だけ搭載しています。

また、オッズはJRAHPの左上から順番に取得します。

現段階のソースコードでは、オッズの読み取りは、cnameパラメータを取得できたレースのみ取得できます。

使える機能は適宜改変して使ってもらえればと思います。
オッズページの解析を行って、スプレッドシートへ書き込むソースは汎用的に使えると思います。

**main.js上部のfunction Test()に書かれたソースコードを1つずつ実行してみてください。**

# 環境
Google Apps Scriptを用意してください。
ライブラリはCherrioのみ使っています。HTML解析用のライブラリです。以下のIDで指定してください。バージョンは16です。
1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0



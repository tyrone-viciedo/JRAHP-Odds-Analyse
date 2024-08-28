// @ts-nocheck
//読込フラグ
const RL = 10000; //DBにオッズが存在するレースリスト
const PL = 20000; //パラメータリスト
//
const AllMethod = 101;
//扱うデータの種類

//shift+Alt+Fで自動でインデント揃えます

//Cherrioライブラリ
//1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0

function Test() {
  //この関数で今週行われる全レースの各オッズへ遷移するパラメータを取得
  //https://www.jra.go.jp/ -> オッズ -> ここのページで表示されてる開催日のレースのパラメータはすべて保存されます
  writeParameterCnameList();

  //ここであるレースの全オッズをスプレッドシートへ書き込む
  //console.log(main("書込\n8月28日（日曜）2回札幌6日,11レース"));

  //スプレッドシートにオッズパラメータがあるレースをすべて表示
  // console.log(main("読込\nパラメータリスト"));

  //ここでどのレースの全オッズを書き込むかを選択
  //スプレッドシートに保存してあるデータがある場合に実行される
  // console.log(main("書込\n8月25日（日曜）2回札幌6日,11レース"))
  //レース名でも検索可能
  // console.log(main("書込\nキーンランド"))

  //3連単、3連複、ワイドのオッズと合成オッズを比較する
  // console.log(main("読込\n8月25日（日曜）2回札幌6日,11レース\n2頭軸\n3-15"))
  // console.log(main("読込\nキーンランド\n2頭軸\n3-15"))
}

//文字列で返却すること
function main(MMMM) {
  let dao;
  const Message = MMMM.split("\n");
  //try {
  //----------------------------------書込処理------------------------------------------------------
  if (Message[0].match(/書込/)) {
    let A = Message[1].split(",");
    let info = A[0];
    let raceno = A[1];
    dao = new Dao([info, raceno]);
    const kaisaiInfo = dao.setData();

    return kaisaiInfo + "\nの読込に成功しました";
  }
  //----------------------------------書込処理------------------------------------------------------

  //----------------------------------読込処理------------------------------------------------------
  else if (Message[0].match(/読込/)) {
    //--------------------------------パラメータリストを返す-----------------------------------------
    if (Message[1].match("パラメータリスト")) {
      dao = new Dao([""]);
      return ListToString(dao.getParameterList());
    }
    //--------------------------------パラメータリストを返す------------------------------------------

    //----------------------------------読込処理の初期設定-------------------------------------------
    let A = Message[1].split(",");
    //レース名が入力
    if (A.length == 1) {
      let raneName = A[0];
      dao = new Dao([raneName]);
    }
    //レース情報とレース番号が入力
    else if (A.length == 2) {
      let A = Message[1].split(",");
      let info = A[0];
      let raceno = A[1];
      dao = new Dao([info, raceno]);
    } else {
      throw Error("レース名の入力に誤りがあります" + Message[1]);
    }
    dao.decideRace();
    //----------------------------------読込処理の初期設定-------------------------------------------

    //--------------------------------読込モードの各処理を記述----------------------------------------

    //--------------------------------3連複3連単ワイド比較モード--------------------------------------
    if (Message[2].match("2頭軸")) {
      raceResult = Message[3].split("-");
      if (raceResult.length == 3) {
        return ListToString(get2wheel(dao, Number(raceResult[0]), Number(raceResult[1]), Number(raceResult[2])));
      } else if (raceResult.length == 2) {
        return ListToString(get2wheel(dao, Number(raceResult[0]), Number(raceResult[1])));
      } else {
        throw Error("(馬番)-(馬番)-(基準オッズ)で入力してください\n" + "入力された文字" + Message[2]);
      }
    }
    //--------------------------------3連複3連単ワイド比較モード--------------------------------------

    //--------------------------------読込モードの各処理を記述----------------------------------------
  }

  //-----------------------------書込・読込処理にもあたらないとき--------------------------------------
  else {
    return ["読込\n7月10日（日曜）2回福島4日,11レース\n2頭軸\n5-7-1000"];
  }

  //}
  //----------------------------------読込処理------------------------------------------------------
  /*catch (e) {
    return e.message;
  }*/
}

//リストを文字列に直す
function ListToString(List) {
  var Ret = "";
  for (let i = 0; i < List.length; i++) {
    if (i == List.lenfth - 1) {
      Ret += List[i];
    } else {
      Ret += List[i] + "\n";
    }
  }
  return Ret;
}

//参照のコピーではなく、値のコピーを行う
function deepCopy(src) {
  let ret = [];
  for (var i of src) {
    ret.push(i);
  }
  return ret;
}

//2頭軸を指定し3連複と3連単の合成オッズを比較
//そのあとにワイドと3フクの合成オッズ、3タンの合成オッズを比較
function get2wheel(dao, I, II, BaseOdds = 0) {
  let umaban = [];
  let sanfuku = [];
  let santan = [];
  let Ret = deepCopy(dao.getRaceName());
  Ret.push("1頭目***" + dao.getUmaban([I]).pop() + ":" + dao.getBamei([I]).pop());
  Ret.push("2頭目***" + dao.getUmaban([II]).pop() + ":" + dao.getBamei([II]).pop());
  let Ret_Kijun_Sanfuku = ["３連複を買うリスト"];
  let Ret_Kijun_Santan = ["３連単を買うリスト"];
  const horsenum = Number(dao.getHorsenum()[0]);
  let goseiSantan = 0.0;
  let goseiSanfuku = 0.0;

  for (var i = 1; i <= horsenum; i++) {
    if (i == I || i == II) {
      continue;
    } else {
      umaban.push(Utilities.formatString("%2d", I) + "-" + Utilities.formatString("%2d", II) + "-" + Utilities.formatString("%2d", i));
      sanfuku.push([i, I, II]);
      santan.push([i, I, II]);
      santan.push([i, II, I]);
      santan.push([I, i, II]);
      santan.push([I, II, i]);
      santan.push([II, I, i]);
      santan.push([II, i, I]);
    }
  }
  //3連複のオッズが格納
  const sanfukuOddsList = deepCopy(dao.getSanfuku(sanfuku));
  //3連単のオッズが格納
  const santanOddsList = deepCopy(dao.getSantan(santan));

  Ret.push("組み合わせ:::　　　3連複:　　　3連単");
  let santanConvertsanfuku = 0;

  for (var i in umaban) {
    //取消馬の確認
    if (santanOddsList[i * 6] == "取消" || santanOddsList[i * 6 + 1] == "取消" || santanOddsList[i * 6 + 2] == "取消" || santanOddsList[i * 6 + 3] == "取消" || santanOddsList[i * 6 + 4] == "取消" || santanOddsList[i * 6 + 5] == "取消" || sanfukuOddsList[i] == "取消") {
      Ret.push(umaban[i] + ":::--------取消--------");
    } else {
      goseiSanfuku += 1 / sanfukuOddsList[i];
      goseiSantan += 1 / santanOddsList[i * 6] + 1 / santanOddsList[i * 6 + 1] + 1 / santanOddsList[i * 6 + 2] + 1 / santanOddsList[i * 6 + 3] + 1 / santanOddsList[i * 6 + 4] + 1 / santanOddsList[i * 6 + 5];
      santanConvertsanfuku = 1 / (1 / santanOddsList[i * 6] + 1 / santanOddsList[i * 6 + 1] + 1 / santanOddsList[i * 6 + 2] + 1 / santanOddsList[i * 6 + 3] + 1 / santanOddsList[i * 6 + 4] + 1 / santanOddsList[i * 6 + 5]);
      //-------------------基準オッズがあるときは基準以上のオッズだけリストへ追加----------------------------
      if (BaseOdds == 0) {
        Ret.push(umaban[i] + ":::" + Utilities.formatString("%9.1f", sanfukuOddsList[i]) + "倍:::" + Utilities.formatString("%9.1f", santanConvertsanfuku) + "倍");
      } else {
        if (sanfukuOddsList[i] > BaseOdds || santanConvertsanfuku > santanConvertsanfuku) {
          Ret.push(umaban[i] + ":::" + Utilities.formatString("%9.1f", sanfukuOddsList[i]) + "倍:::" + Utilities.formatString("%9.1f", santanConvertsanfuku) + "倍");

          if (santanConvertsanfuku > sanfukuOddsList[i]) {
            Ret_Kijun_Santan.push(umaban[i] + ":::" + Utilities.formatString("%9.1f", santanConvertsanfuku) + "倍");
          } else {
            Ret_Kijun_Sanfuku.push(umaban[i] + ":::" + Utilities.formatString("%9.1f", sanfukuOddsList[i]) + "倍");
          }
        }
      }
    }
    //-------------------基準オッズがあるときは基準以上のオッズだけリストへ追加----------------------------
  }

  Ret.push("ワイド　　::　　" + dao.getWide([[I, II]])[0] + "倍");

  if (goseiSanfuku != 0.0 && goseiSantan != 0.0) {
    goseiSantan = 1 / goseiSantan;
    goseiSanfuku = 1 / goseiSanfuku;
  }

  Ret.push("３連単合成::" + Utilities.formatString("%9.1f", goseiSantan) + "倍");
  Ret.push("３連複合成::" + Utilities.formatString("%9.1f", goseiSanfuku) + "倍");

  if (BaseOdds != 0) {
    Ret.push("基準オッズ:" + BaseOdds + "倍以上");
    for (var i of Ret_Kijun_Santan) {
      Ret.push(i);
    }
    for (var i of Ret_Kijun_Sanfuku) {
      Ret.push(i);
    }
  }

  return Ret;
}

//配列で結果を返す
//[3連単合成オッズ、3連複オッズ]
function Get_2wheel_culc(horsenum, I, II, BaseOdds = 0) {
  var A = 0;
  var B = 0;
  var Ret = [];
  const Syutuba = GetHorseName();
  Ret.push(String(I) + "番:" + Syutuba[I - 1]);
  Ret.push(String(II) + "番:" + Syutuba[II - 1]);

  if (BaseOdds == 0) {
    Ret.push("馬番の組  :::    3連単合成:::     3連複");
    for (var i = 1; i <= this.horsenum; i++) {
      if (I == i || II == i) {
        continue;
      } else {
        A = 1 / (1 / GetOdds(santan, Get3tan_order(this.horsenum, I, II, i)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, I, i, II)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, II, I, i)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, II, i, I)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, i, I, II)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, i, II, I)));
        B = GetOdds(sanfuku, Get3fuku_order(this.horsenum, I, II, i));
        Ret.push(Utilities.formatString("%2d", I) + "-" + Utilities.formatString("%2d", II) + "-" + Utilities.formatString("%2d", i) + " ::: " + Utilities.formatString("%9.1f", A) + "倍:::" + Utilities.formatString("%9.1f", B) + "倍");
      }
    }
  } else {
    let SANTAN = [];
    let SANFUKU = [];
    Ret.push("基準オッズ::: " + Utilities.formatString("%9d", BaseOdds) + "倍");
    for (var i = 1; i <= this.horsenum; i++) {
      if (I == i || II == i) {
        continue;
      } else {
        A = 1 / (1 / GetOdds(santan, Get3tan_order(this.horsenum, I, II, i)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, I, i, II)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, II, I, i)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, II, i, I)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, i, I, II)) + 1 / GetOdds(santan, Get3tan_order(this.horsenum, i, II, I)));
        B = GetOdds(sanfuku, Get3fuku_order(this.horsenum, I, II, i));
        if (A > BaseOdds || B > BaseOdds) {
          if (A / KIJUN > B) {
            SANTAN.push(Utilities.formatString("%2d", I) + "-" + Utilities.formatString("%2d", II) + "-" + Utilities.formatString("%2d", i) + " ::: " + Utilities.formatString("%9.1f", A) + "倍");
          } else {
            SANFUKU.push(Utilities.formatString("%2d", I) + "-" + Utilities.formatString("%2d", II) + "-" + Utilities.formatString("%2d", i) + " ::: " + Utilities.formatString("%9.1f", B) + "倍");
          }
        }
      }
    }
    Ret.push("3連単を買う買い目");
    for (var i = 0; i < SANTAN.length; i++) {
      Ret.push(SANTAN[i]);
    }
    Ret.push("3連複を買う買い目");
    for (var i = 0; i < SANFUKU.length; i++) {
      Ret.push(SANFUKU[i]);
    }
  }

  return Ret;
}

//０が二つ入らないようにするための条件は呼び出し元で実行済み
//全式別のオッズを返す
function allMethod(I, II, III) {
  const raCeName = GetRaceName().pop();
  const horselist = GetHorseName();
  const horse_1 = horselist[I - 1];
  const horse_2 = horselist[II - 1];
  const hores_3 = horselist[III - 1];
  const tan_3 = GetOdds(santan, Get3tan_order(this.horsenum, I, II, III));
  const tan_uma = GetOdds(umatan, Getumatan_order(this.horsenum, I, II));
  const tan = GetOdds(win, I - 1);
  var ss = Sort(I, II, III);
  const sI = ss[0];
  const sII = ss[1];
  const sIII = ss[2];
  var s2 = Sort(I, II);
  const uI = s2[0];
  const uII = s2[1];
  const wide_1 = GetOdds(wide, Getumaren_order(this.horsenum, sI, sII));
  const wide_2 = GetOdds(wide, Getumaren_order(this.horsenum, sI, sIII));
  const wide_3 = GetOdds(wide, Getumaren_order(this.horsenum, sII, sIII));
  const ren_uma = GetOdds(umaren, Getumaren_order(this.horsenum, uI, uII));
  const fuku_3 = GetOdds(sanfuku, Get3fuku_order(this.horsenum, sI, sII, sIII));
  const place_1 = GetOdds(place, sI - 1);
  const place_2 = GetOdds(place, sII - 1);
  const place_3 = GetOdds(place, sIII - 1);

  const Ret = [
    "レース名：" + raCeName,
    "1着馬番" + Utilities.formatString("%2d", I) + " :" + horse_1,
    "2着馬番" + Utilities.formatString("%2d", II) + " :" + horse_2,
    "3着馬番" + Utilities.formatString("%2d", III) + " :" + hores_3,
    "単勝　:" + Utilities.formatString("%2d", I) + "  " + (tan * 100).toLocaleString() + "円",
    "複勝　:" + Utilities.formatString("%2d", sI) + ":   " + place_1 + "倍",
    "　　　 " + Utilities.formatString("%2d", sII) + ":   " + place_2 + "倍",
    "　　　 " + Utilities.formatString("%2d", sIII) + ":   " + place_3 + "倍",
    "ワイド:" + Utilities.formatString("%2d", sI) + "-" + Utilities.formatString("%2d", sII) + ":   " + wide_1 + "倍",
    "　　　 " + Utilities.formatString("%2d", sI) + "-" + Utilities.formatString("%2d", sIII) + ":   " + wide_2 + "倍",
    "　　　 " + Utilities.formatString("%2d", sII) + "-" + Utilities.formatString("%2d", sIII) + ":   " + wide_3 + "倍",
    "馬単　:" + Utilities.formatString("%2d", I) + "->" + Utilities.formatString("%2d", II) + "  " + (tan_uma * 100).toLocaleString() + "円",
    "馬連　:" + Utilities.formatString("%2d", uI) + "- " + Utilities.formatString("%2d", uII) + "  " + (ren_uma * 100).toLocaleString() + "円",
    "3連単 :" + Utilities.formatString("%2d", I) + "->" + Utilities.formatString("%2d", II) + "->" + Utilities.formatString("%2d", III) + "  " + (tan_3 * 100).toLocaleString() + "円",
    "3連複 :" + Utilities.formatString("%2d", sI) + "- " + Utilities.formatString("%2d", sII) + "-" + Utilities.formatString("%2d", sIII) + "  " + (fuku_3 * 100).toLocaleString() + "円",
  ];
  return Ret;
}

//-----------------------------DBとやりとりするクラス--------------------------
//3連単2->3->4のオッズが欲しいときgetSantan([[2,3,4]])でゲットできます
//出力(getXXXXXXオッズはthis.resultでお願いします。すべての出力はthis.resultでやりとりしてください
//getXXXXX()は引数とるときはリスト[1着馬,2着馬(,3着馬)](数値型)で記入
class Dao {
  constructor(targetrace) {
    this.load = 1000;
    this.write = 2000;
    this.santan = 1;
    this.sanfuku = 2;
    this.umatan = 3;
    this.umaren = 4;
    this.wide = 5;
    this.win = 6;
    this.place = 7;
    this.wakuren = 8;
    this.bamei = 10;
    this.umaban = 11;
    this.cname = 20;
    this.racename = 12;
    this.horsenum_flag = 13;
    this.kaisaiinfo = 14;
    this.bamei_all = 15;
    this.kaisailist = 16;
    this.racelist = 17;
    this.raceno = 18;

    this.cnameParameter = 90;
    this.search = 100;
    this.parameterRow = 0;

    this.targetrace = deepCopy(targetrace);
    this.result = []; //結果を返すリスト
    this.rowPointer = 6; //スタート行は上から何行目を指しているか
    this.colPointer = 10; //スタート列は上から何行目を指しているか
    this.offSet = 5; //1レースにつき何列使うか
    this.Sheet = SpreadsheetApp.getActiveSheet();
    this.racePointer = 0;
    this.horsenum = 0;
  }

  //読込モードで起動する
  //どのレースかを選択します
  decideRace() {
    if (this.isExistOdds()) {
      let A = [];
      for (let i of this.result) {
        //レースキーとレース情報が入ってます
        A.push(i);
      }

      this.raceInfo(this.load, this.horsenum_flag);
      this.horsenum = this.result[0]; //出走頭数を代入
      return A; //レース情報とレース番号が入ってます
    } else {
      throw Error("読込レースが見つかりません\n入力されたレース\n" + this.targetrace);
    }
  }

  getRaceName() {
    this.raceInfo(this.load, this.racename);
    return this.result;
  }

  //9と13の単勝オッズがほしいときはorder = [9,13]
  getWin(order) {
    this.isUmabanCheck(order);
    for (let i in order) {
      order[i] = order[i] - 1;
    }
    this.raceInfo(this.load, this.win, order);
    return this.result;
  }

  //9と13の複勝オッズがほしいときはorder = [9,13]
  getPlace(order) {
    this.isUmabanCheck(order);
    for (let i in order) {
      order[i] = order[i] - 1;
    }
    this.raceInfo(this.load, this.place, order);
    return this.result;
  }

  //5-13のワイドオッズがほしいときorder = [[5,13]]([[13,5]]でも同じ結果が返ってくる)
  getWide(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getUmarenOrder(i[0], i[1]));
    }
    this.raceInfo(this.load, this.wide, A);
    return this.result;
  }

  //5-8の枠連オッズがほしいときorder = [[5,8]]([[8,5]]でも同じ結果が返ってくる)
  getWakuren(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getWakurenOrder(i[0], i[1]));
    }
    this.raceInfo(this.load, this.wakuren, A);
    return this.result;
  }

  //5-13の馬連オッズがほしいときorder = [[5,13]]([[13,5]]でも同じ結果が返ってくる)
  getUmaren(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getUmarenOrder(i[0], i[1]));
    }
    this.raceInfo(this.load, this.umaren, A);
    return this.result;
  }

  //5->13の馬単オッズがほしいときorder = [[5,13]]
  getUmatan(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getUmatanOrder(i[0], i[1]));
    }
    this.raceInfo(this.load, this.umatan, A);
    return this.result;
  }

  //5->13->12の3連単オッズがほしいときorder = [[5,13,12]]
  getSantan(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getSantanOrder(i[0], i[1], i[2]));
    }
    this.raceInfo(this.load, this.santan, A);
    return this.result;
  }

  //5-12-13の3連複オッズがほしいときorder = [[5,13,12]]([[13,5,12]]でも同じ結果が返ってくる)
  getSanfuku(order) {
    let A = [];
    for (let i of order) {
      this.isUmabanCheck(i);
      A.push(this.getSanfukuOrder(i[0], i[1], i[2]));
    }
    this.raceInfo(this.load, this.sanfuku, A);
    return this.result;
  }

  getUmaban(order) {
    this.isUmabanCheck(order);
    for (let i in order) {
      order[i] = order[i] - 1;
    }
    this.raceInfo(this.load, this.umaban, order);
    return this.result;
  }

  getHorsenum() {
    this.raceInfo(this.load, this.horsenum_flag);
    return this.result;
  }

  getBamei(order) {
    this.isUmabanCheck(order);
    for (let i in order) {
      order[i] = order[i] - 1;
    }
    this.raceInfo(this.load, this.bamei, order);
    return this.result;
  }

  getRaceKey() {
    this.raceInfo(this.load, this.racekey);
    return this.result;
  }

  //読込時にどのレースを
  //オッズが書いてあるレースを取得
  getOddsExistList() {
    let BBBB = this.Sheet.getLastColumn();
    for (let i = this.colPointer; i <= BBBB; i = i * this.offSet) {
      if (!this.Sheet.getRange(i, 3).isBlank()) {
        this.result.push(this.Sheet.getRange(i, 3).getValue());
      }
    }
    return this.result;
  }

  //パラメータがあるレースのレース情報を取得する
  //上からセルを見ていき、セルが存在した次の行からデータを取得
  getParameterList() {
    let A = this.Sheet.getRange(1, 1);
    let B = [];

    //上から見ていきセルにデータが入ってればループから抜け出す
    while (true) {
      if (!A.isBlank()) {
        A = A.offset(-1, 0);
        break;
      }
      A = A.offset(1, 0);
    }

    //データを取得していく
    this.result.length = 0;
    do {
      A = A.offset(1, 0);
      this.result.push(A.getValue() + "," + A.offset(0, 1).getValue());
    } while (!A.offset(1, 0).isBlank());

    return this.result;
  }

  //DBにオッズがあるか調べる
  //入力はレースキー
  //出力はboolでtrueならレースポインター設置とthis.resultにレースキーとレース情報を設置
  //falseならなにもしない
  isExistOdds() {
    const LastColumn = this.Sheet.getLastColumn();

    //レース名で検索するとき
    if (this.targetrace.length == 1) {
      let keyword = new RegExp(this.targetrace[0]);

      for (let i = this.colPointer; i <= LastColumn; i += this.offSet) {
        let AA = this.Sheet.getRange(3, i);
        let A = AA.getValue();

        if (A.match(keyword)) {
          //レースキーを入れる
          this.result.push(AA.offset(-1, 0).getValue());
          //レース名を入れる
          this.result.push(A);

          return true;
        }

        this.racePointer++;
      }
    }

    //レースキーで検索するとき
    else if (this.targetrace.length == 2) {
      for (let i = this.colPointer; i <= LastColumn; i += this.offSet) {
        let range = this.Sheet.getRange(2, i);
        const kaisai = range.getValue();
        const race = range.offset(0, 1).getValue();

        if (kaisai.match(this.targetrace[0]) && race.match(this.targetrace[1])) {
          //レースキーを入れる
          this.result.push(kaisai + race);
          //レース名を入れる
          this.result.push(range.offset(0, 1).getValue());
          return true;
        }
        this.racePointer++;
      }
    }
    return false;
  }

  isUmabanCheck(UmabanList) {
    for (var i of UmabanList) {
      if (isNaN(i)) {
        throw Error("入力馬番:" + i + "は数字ではありません");
      }
      if (i > this.horsenum || i < 1) {
        throw Error("入力馬番:" + i + "は出走頭数の範囲から外れています");
      }
    }
  }

  setData() {
    try {
      var R = 0;
      var kaisaiInfo = "";
      var raceNo = "";
      let cname_list = [];

      do {
        kaisaiInfo = this.Sheet.getRange(4 + R, 1).getValue();
        raceNo = this.Sheet.getRange(4 + R, 2).getValue();
        if (this.targetrace[0] == kaisaiInfo && this.targetrace[1] == raceNo) {
          for (let i = 3; i <= 9; i++) {
            //[0:単複パラメータ、1:枠連パラメータ,2:馬連パラメータ,3:ワイドパラメータ,4:馬単パラメータ,5:3連複パラメータ,6:3連単パラメータ]の順に格納
            cname_list.push(this.Sheet.getRange(4 + R, i).getValue());
          }
          break;
        }
        R++;
      } while (!this.Sheet.getRange(4 + R, 1).isBlank());
      this.racePointer = R;

      if (cname_list.length == 0) {
        throw Error("レースキーから該当レースを見つけることができませんでした\n入力されたのは\n");
      } else {
        //[0:単複パラメータ、1:枠連パラメータ,2:馬連パラメータ,3:ワイドパラメータ,4:馬単パラメータ,5:3連複パラメータ,6:3連単パラメータ]
        const A = new ScrapingOdds(cname_list);

        //[[出走頭数][レース名][馬番][馬名1,馬名2,馬名3,馬名4....],[単勝オッズ][複勝オッズ][枠連][馬連][ワイド][馬単][3連複][3連単]]
        const oddsList = A.getResult();

        this.raceInfo(this.write, this.horsenum_flag, oddsList[0]);
        this.raceInfo(this.write, this.racename, oddsList[1]);
        this.raceInfo(this.write, this.umaban, oddsList[2]);
        this.raceInfo(this.write, this.bamei, oddsList[3]);
        this.raceInfo(this.write, this.win, oddsList[4]);
        this.raceInfo(this.write, this.place, oddsList[5]);
        this.raceInfo(this.write, this.wakuren, oddsList[6]);
        this.raceInfo(this.write, this.umaren, oddsList[7]);
        this.raceInfo(this.write, this.wide, oddsList[8]);
        this.raceInfo(this.write, this.umatan, oddsList[9]);
        this.raceInfo(this.write, this.sanfuku, oddsList[10]);
        this.raceInfo(this.write, this.santan, oddsList[11]);
        this.raceInfo(this.write, this.kaisaiinfo, [kaisaiInfo]);
        this.raceInfo(this.write, this.raceno, [raceNo]);
        this.result.push(kaisaiInfo + raceNo);
        return this.result;
      }
    } catch (e) {
      throw e;
    }
  }

  //パラメータを刻む
  writeParameter() {
    try {
      var A = new ScrapingParam();
      const Paralist = A.getCname();
      this.Sheet.clearContents(); // データのみを削除します。フォーマットやメモはそのまま

      this.Sheet.getRange(5, 1, Paralist.length, Paralist[0].length).setValues(Paralist);
    } catch (e) {
      throw e;
    }
  }

  //各種レース情報を得るときにつかう
  //入力(読込,式別,データ(一重リスト))
  //getならthis.resultにデータを格納します。
  //読込のときはDataは何番目のオッズかを示す
  raceInfo(flag, method, Data = []) {
    let range;

    if (method == this.santan) {
      range = this.Sheet.getRange(this.rowPointer + 20, this.colPointer + this.racePointer * this.offSet + 4);
    }
    //3連複
    else if (method == this.sanfuku) {
      range = this.Sheet.getRange(this.rowPointer + 20, this.colPointer + this.racePointer * this.offSet + 3);
    }
    //馬単
    else if (method == this.umatan) {
      range = this.Sheet.getRange(this.rowPointer + 20, this.colPointer + this.racePointer * this.offSet + 1);
    }
    //馬連
    else if (method == this.umaren) {
      range = this.Sheet.getRange(this.rowPointer + 20, this.colPointer + this.racePointer * this.offSet + 2);
    }
    //ワイド
    else if (method == this.wide) {
      range = this.Sheet.getRange(this.rowPointer + 200, this.colPointer + this.racePointer * this.offSet + 2);
    }
    //単勝
    else if (method == this.win) {
      range = this.Sheet.getRange(this.rowPointer, this.colPointer + this.racePointer * this.offSet + 2);
    }
    //複勝
    else if (method == this.place) {
      range = this.Sheet.getRange(this.rowPointer, this.colPointer + this.racePointer * this.offSet + 3);
    }
    //馬名
    else if (method == this.bamei) {
      range = this.Sheet.getRange(this.rowPointer, this.colPointer + this.racePointer * this.offSet + 1);
    }
    //馬番
    else if (method == this.umaban) {
      range = this.Sheet.getRange(this.rowPointer, this.colPointer + this.racePointer * this.offSet);
    }
    //出走頭数
    else if (method == this.horsenum_flag) {
      range = this.Sheet.getRange(this.rowPointer + 20, this.colPointer + this.racePointer * this.offSet);
    }
    //レース名
    else if (method == this.racename) {
      range = this.Sheet.getRange(3, this.colPointer + this.racePointer * this.offSet);
    }
    //開催情報
    else if (method == this.kaisaiinfo) {
      range = this.Sheet.getRange(2, this.colPointer + this.racePointer * this.offSet);
    }
    //レース番号
    else if (method == this.raceno) {
      range = this.Sheet.getRange(2, this.colPointer + this.racePointer * this.offSet + 1);
    }
    //JRAHPのオッズ取得時に必要なパラメータcname
    else {
      return;
    }

    if (flag == this.write) {
      //二重リストにして代入
      const A = Data.length;
      let B = [];
      for (let i of Data) {
        B.push([i]);
      }
      range.offset(0, 0, A).setValues(B);
    }

    //読込時の挙動
    else {
      //配列を空にします
      this.result.length = 0;
      //パラメータがないとき
      if (Data.length == 0) {
        const A = range.getValue();
        this.result.push(A);
      } else {
        for (let i of Data) {
          this.result.push(range.offset(i, 0).getValue());
        }
      }
    }
  }

  //----------賭け式での順番を求める関数--------------
  //この関数で3連単の順番を出す
  //着順の組み合わせで3連単のオッズの順番を算出
  getSantanOrder(I, II, III) {
    if (I == II || II == III || I == II) {
      return -1;
    } else {
      if (I < II) var j = this.horsenum - 2;
      else var j = 0;

      if (I < III) var k = 1;
      else var k = 0;

      if (II < III) var l = 1;
      else var l = 0;

      return (this.horsenum - 1) * (this.horsenum - 2) * (I - 1) + (this.horsenum - 2) * (II - 1) + (III - 1) - j - k - l;
    }
  }

  //この関数で3連複の順番を出す
  //着順の組み合わせで3連複のオッズの順番を算出
  getSanfukuOrder(I, II, III) {
    if (I == II || II == III || I == III) {
      return -1;
    } else {
      //min < mid < max
      let L = this.sort(I, II, III);

      I = L[0];
      II = L[1];
      III = L[2];

      var sum_I = 0;
      var sum_II = 0;

      for (var i = 1; i < I; i++) {
        sum_I += ((Math.abs(this.horsenum - 2 - i) + 1) / 2) * (this.horsenum - i);
      }
      for (var i = 0; i < II - I - 1; i++) {
        sum_II = sum_II + this.horsenum - I - 1 - i;
      }

      return sum_I + sum_II + (III - II) - 1;
    }
  }

  //馬単の順番を返す
  getUmatanOrder(I, II) {
    if (I == II) {
      return -1;
    }
    var Ret = this.horsenum * (I - 1);
    if (II > I) {
      Ret += II - I;
    } else {
      Ret += II;
    }

    return Ret;
  }

  //枠連の順番を返す
  getWakurenOrder(I, II) {
    if (I == II) {
      return -1;
    } else if (I > II) {
      let A = II;
      II = I;
      I = A;
    } else;
    var Ret = 0;
    for (var i = 1; i < I; i++) {
      Ret += 8 - i;
    }
    Ret += II - I - 1;
    return Ret;
  }

  //馬連の順番を返す
  getUmarenOrder(I, II) {
    if (I == II) {
      return -1;
    } else if (I > II) {
      let A = II;
      II = I;
      I = A;
    } else;
    var Ret = 0;
    for (var i = 1; i < I; i++) {
      Ret += this.horsenum - i;
    }
    Ret += II - I - 1;
    return Ret;
  }

  //３連複馬連ワイドの馬番を整理する
  //例えば[13->2->5]できまったときに、[2,5,13]という昇順で返す
  //[2->5]なら[2,5,100]
  sort(I, II, III = 100) {
    let min = I;
    if (min > II) {
      min = II;
    }

    if (min > III) {
      min = III;
    }

    let max = III;

    if (max < I) {
      max = I;
    }

    if (max < II) {
      max = II;
    }

    let mid = I;
    if (min < I && max > I) {
      mid = I;
    } else if (min < II && max > II) {
      mid = II;
    } else {
      mid = III;
    }
    return [min, mid, max];
  }

  clearAllDB() {
    var sh = ss.getSheetByName(SheetName);
    //シートのすべてをクリアする
    sh.clear();
  }
}

//-----------------------オッズをスクレイピングするクラス----------------------------------------
//入力(インスタンス生成時）はパラメータの集合[0:単複パラメータ、1:枠連パラメータ,2:馬連パラメータ,3:ワイドパラメータ,4:馬単パラメータ,5:3連複パラメータ,6:3連単パラメータ]
//出力(getResult()):[[出走頭数][レース名][馬番][馬名1,馬名2,馬名3,馬名4....],[単勝オッズ][複勝オッズ][枠連][馬連][ワイド][馬単][3連複][3連単]]
class ScrapingOdds {
  constructor(cname_list) {
    this.cname_list = cname_list;
    this.racename;
    this.runhorsenum;
    this.umaban;
    this.horsename;
    this.win;
    this.place;
    this.waku;
    this.umaren;
    this.wide;
    this.umatan;
    this.sanfuku;
    this.santan;

    this.Load_odds_Wide();
    this.Load_Syutuba();
    this.Load_odds();
    this.result = [this.runhorsenum, this.racename, this.umaban, this.horsename, this.win, this.place, this.waku, this.umaren, this.wide, this.umatan, this.sanfuku, this.santan];
  }

  getResult() {
    return this.result;
  }

  //3連系
  //二重リストで作ってね,じゃないとスプレッドシートが読み込めません
  //[[300][400]....]
  Load_odds() {
    const staySecond = 1;
    const URL = "https://www.jra.go.jp/JRADB/accessO.html";
    //枠連,馬連,馬単,3連複,3連単
    for (var i of [1, 2, 4, 5, 6]) {
      const headers = { method: "POST" };
      const payload = { cname: this.cname_list[i] };
      let paraM = {
        headers: headers,
        payload: payload,
        muteHttpExceptions: true,
      };

      let Ret = [];
      //枠連馬連がない場合
      let res = UrlFetchApp.fetch(URL, paraM).getContentText("cp932");

      const $ = Cheerio.load(res);

      if (i == 5 || i == 6) {
        var odds_list = $("#odds_list").find("div").find("ul").find("li").find("table").find("tbody").find("tr").find("td");
      } else {
        var odds_list = $("#odds_list").find("ul").find("li").find("table").find("tbody").find("tr").find("td");
      }

      odds_list.each(function (j, element) {
        let b = $(element).text();

        if (b.match(/\d+\.[0-9]/)) {
          Ret.push(b);
        } else if (b.match(/取消/)) {
          Ret.push("取消");
        } else if (b.match(/票数無し/)) {
          Ret.push("99999.9");
        }
      });

      switch (i) {
        case 1:
          this.waku = Ret;
        case 2:
          this.umaren = Ret;
        case 4:
          this.umatan = Ret;
        case 5:
          this.sanfuku = Ret;
        case 6:
          this.santan = Ret;
      }
    }
  }

  //ワイドのオッズ集合を返す
  Load_odds_Wide() {
    const URL = "https://www.jra.go.jp/JRADB/accessO.html";
    const headers = { method: "POST" };
    const payload = { cname: this.cname_list[3] };
    let paraM = {
      headers: headers,
      payload: payload,
      muteHttpExceptions: true,
    };

    var A = [];
    let res = UrlFetchApp.fetch(URL, paraM).getContentText("cp932");
    const $ = Cheerio.load(res); //function(String)

    const horse = $("#odds_list").find("tr").find("td");

    horse.each(function (i, element) {
      A.push($(element).text());
    });
    this.wide = A;
  }

  //出馬表をJRAホームページからDBへ書き込む関数
  //馬番と馬名とレース情報と単複オッズを出馬表に送る
  Load_Syutuba() {
    const URL = "https://www.jra.go.jp/JRADB/accessO.html";
    const headers = {
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
    };
    const payload = { cname: this.cname_list[0] };
    let paraM = {
      headers: headers,
      payload: payload,
      muteHttpExceptions: true,
    };

    let res = UrlFetchApp.fetch(URL, paraM).getContentText("cp932");

    //出走馬を取得する
    const $ = Cheerio.load(res); //function(String)
    var T = $(".race_title").find(".txt").text(); //String
    let TT = T.replace(/\n/g, "");
    let TTT = TT.replace(/ /g, "");
    let TTTT = TTT.trim();
    this.racename = [];
    this.racename.push(TTTT);
    const horse = $("#odds_list").find("tbody").find("tr").find("td").not(".waku");

    let A = [];
    let B = [];
    let C = [];
    let D = [];

    horse.each(function (i, element) {
      //馬番号の取得
      if (i % 9 == 0) {
        A.push($(element).text());
      }
      //馬名
      else if (i % 9 == 1) {
        B.push($(element).text());
      }
      //単勝オッズ
      else if (i % 9 == 2) {
        if ($(element).text().match(/取消/)) {
          A.pop();
          A.puch("取消");
          C.push("取消");
        } else {
          C.push($(element).text());
        }
      }
      //複勝オッズ
      else if (i % 9 == 3) {
        D.push($(element).text());
      }
    });

    this.umaban = A;
    this.horsename = B;
    this.win = C;
    this.place = D;

    let E = [];
    E.push(this.place.length);
    this.runhorsenum = E;
  }
}

function writeParameterCnameList() {
  var A = new Dao("");
  A.writeParameter();
}
/*[ '9月3日（土曜）3回新潟7日',
   '12レース',
   'pw151ouS304202203071220220903Z/43',
   'pw153ouS304202203071220220903Z/4B',
   'pw154ouS304202203071220220903Z/CF',
   'pw155ouS304202203071220220903Z/53',
   'pw156ouS304202203071220220903Z/D7',
   'pw157ouS304202203071220220903Z99/BD',
   'pw158ouS304202203071220220903Z/DF' ],*/
class ScrapingParam {
  constructor() {
    this.result = [];

    let res = UrlFetchApp.fetch("https://www.jra.go.jp/").getContentText("cp932");
    const $ = Cheerio.load(res); //(String)

    const horse = $("#quick_menu").find("div").find("ul").find("li").find("a");

    const Odds = horse[2].attribs.onclick; //string型
    //今週行われるレースのページ
    const cname = this.convertParam(Odds);
    //1つの競馬場の全レースのオッズページへ行くための全パラメータが書かれたHTMLを取得
    const thisweek_HTML = this.loadNewPage(cname);

    //オッズページへ行くための全パラメータをHTML解析しリストで取得
    //[[8月27日（土曜）3回新潟5日,'pw15orl00102022040620220828/D1'],[8月27日（土曜）3回中山5日,'pw15orl00102022040620220828/D1']・・・]
    var thisWeekRaceParamList = this.thisWeekRace(thisweek_HTML);

    for (var i = 0; i < thisWeekRaceParamList.length; i++) {
      let raceInfo = thisWeekRaceParamList[i][0]; //8月27日（土曜）3回新潟5日
      //各レースのオッズページを取得する、
      //このページは1つのレースの全オッズが見れ、単勝などをクリックする単勝オッズがみれるページです
      //ここにあるレースのすべてのオッズのパラメータが存在
      //thisWeekRaceParamList[i][1]='pw15orl00102022040620220828/D1'
      //[[レース番号,単勝複勝,枠連,馬連,ワイド,馬単,3連複,3連単]....]
      var oddsParamList = this.getParameter(this.loadNewPage(thisWeekRaceParamList[i][1]));

      for (var ii = 0; ii < oddsParamList.length; ii++) {
        let ret_1 = [];
        ret_1.push(raceInfo);
        for (var iii of oddsParamList[ii]) {
          ret_1.push(iii);
        }
        this.result.push(ret_1);
      }
    }
  }

  getCname() {
    if (this.result.length == 0) {
      throw Error("オッズのデータが取得できませんでした。オッズページがまだ更新されてない可能性があります");
    }
    return this.result;
  }

  //入力=>"doAction('/JRADB/accessO.html','pw15oli00/6D');return false;"
  //出力=>pw15oli00/6D
  convertParam(Odds) {
    let regex = new RegExp(/,'.*'/);
    let r = Odds.match(regex);
    const A = r[0].replace(",'", "");
    const AA = A.replace("'", "");

    return AA;
  }

  //ここでオッズのページを取得する
  loadNewPage(cname) {
    const URL = "https://www.jra.go.jp/JRADB/accessO.html";
    const headers = { method: "POST" };
    const payload = { cname: cname };
    let paraM = {
      headers: headers,
      payload: payload,
      muteHttpExceptions: true,
    };
    return UrlFetchApp.fetch(URL, paraM).getContentText("cp932");
  }

  //入力:今週のオッズのレースのHTMLテキストをお送りいたします。
  //出力:[[8月27日（土曜）3回新潟5日,'pw15orl00102022040620220828/D1'],[8月27日（土曜）3回中山5日,'pw15orl00102022040620220828/D1']・・・]
  thisWeekRace(HTML_thisweek) {
    const Ret = [];

    const $1 = Cheerio.load(HTML_thisweek);
    const mmddww = $1(".thisweek").find("div").find(".sub_header");

    mmddww.each(function (i, element) {
      const XXYYWW = $1(element)[0].children[0].data; //8月27日（土曜）
      const ppp = $1(element).parent().find("div").find("div").find("div").find("a");
      ppp.each(function (j, j_element) {
        var Ret_1 = [];
        Ret_1.push(XXYYWW + $1(j_element)[0].children[1].data); //8月27日（土曜）3回新潟5日
        let A = $1(j_element)[0].attribs.onclick; //return doAction('/JRADB/accessO.html','pw15orl00102022040620220828/D1');
        A = A.replace(/ /g, "");

        let regex = new RegExp(/,'.*'/);
        let r = A.match(regex);
        A = r[0].replace(",'", "");
        A = A.replace("'", "");

        Ret_1.push(A);
        Ret.push(Ret_1);
      });
    });

    return Ret;
  }

  getParameter(HTML) {
    let Ret = [];
    const $ = Cheerio.load(HTML);
    const oddaPage_1 = $("tbody").find("tr");

    oddaPage_1.each(function (i, element) {
      var Ret_1 = [];
      Ret_1.push($(element).find("th").find("a").find("img")[0].attribs.alt); //レース番号
      var A = $(element).find(".odds").find("div").find("div").find("a"); //パラメータ
      A.each(function (j, j_element) {
        var B = $(j_element)[0].attribs.onclick.replace(/ /g, "");

        let regex = new RegExp(/,'.*'/);
        let r = B.match(regex);
        B = r[0].replace(",'", "");
        B = B.replace("'", "");
        Ret_1.push(B);
      });
      /*length==8
      [1]'12レース',
      [2]'pw151ouS304202203071220220903Z/43'"単勝複勝"
      [3]'pw153ouS304202203071220220903Z/4B'"枠連"
      [4]'pw154ouS304202203071220220903Z/CF'"馬連"
      [5]'pw155ouS304202203071220220903Z/53'"ワイド"
      [6]'pw156ouS304202203071220220903Z/D7'"馬単"
      [7]'pw157ouS304202203071220220903Z99/BD'"3連複"
      [8]'pw158ouS304202203071220220903Z/DF' "3連単"
      */
      if (Ret_1.length == 7) {
        //5-8頭の出走
        let stack = [];
        for (var i = Ret_1.length - 1; i >= 2; i--) {
          stack.push(Ret_1.pop());
        }
        Ret_1.push(""); //枠連を空文字にする
        for (var i of stack.reverse()) {
          Ret_1.push(i);
        }
        console.log(Ret_1);
      }
      Ret.push(Ret_1);
    });
    return Ret;
  }
}

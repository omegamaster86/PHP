◇目次
このドキュメントはlaravelでの開発にあたり、コーディングルールを記載します。

◇コーディングルール
§Controllerからbladeに複数のデータを渡す方法
・引数を極力少なくして渡す。（≒多数の引数を羅列して渡すことはしない）
(ex.)
public function create(): View
{
	//DBからデータを取得
    $retrive_player_ID = DB::select('select * from t_player where userId = ?', [Auth::user()->userId]);
    //ID最大値のプレイヤー情報を$retrive_player_IDから取得する
    $playerInfo = $retrive_player_ID[count($retrive_player_ID)-1];
    //取得したプレイヤー情報をフロント側に渡す。
    return view('player.register-confirm',["pageMode"=>"delete","playerInfo"=>$playerInfo]);
}

§JavaScript
・1つのbladeに対して1つの.jsを作成する。

・必ずfunctionで関数を作る。

・関数名はcamelCaseで記述する。

§css
・同じ処理はカンマ区切りで記載する。（記載できる）

・極力idごとでcssを作成しないようにする。（#で始まる名称で作成しない）
　クラスで作成する。（.で始まる名称で作成）

§データの取得
・bladeとcontrollerの両方でデータを取得しない。
　→データ取得はcontroller、データの表示はbladeのように役割を分け明確化する。

§フロントエンド
・三項演算子(?)とnull合体演算子(??)は極力使用しない。

・演算子の前後には半角スペースを付与する。

・条件1つにつきカッコを付与する。
(ex.)
@if((ConditionA) and (ConditionB))

・1行で長くなりすぎるようなら変数を使って見やすくする。

§Controller
・1画面に対して1つのControllerとする。
　1つのbladeで複数の画面を表現する場合（1つのbladeでregisterとupdate)、function名で分けてそれぞれの画面での動作を制御する。

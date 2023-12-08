$acting_manager_add_count = 0; //監督代理を追加した数
const acting_manager_add_count_max = 2; //監督代理を追加できる最大数

function todayGet() {
    var today = new Date();
    today.setDate(today.getDate());
    var yyyy = today.getFullYear();
    var mm = ("0"+(today.getMonth()+1)).slice(-2);
    var dd = ("0"+today.getDate()).slice(-2);
    document.getElementById("today").value=yyyy+'-'+mm+'-'+dd;
}

//監督代理のユーザID追加ボタンをクリック
function actingManagerAddButtonClick(){
    let elements = document.getElementById("target");
    let actingManager = document.getElementById("actingManagerUser");
    let copied = elements.cloneNode(true);

    if($acting_manager_add_count < acting_manager_add_count_max){
        actingManager.appendChild(copied);        
        $acting_manager_add_count++;
    }
}

//郵便番号から住所を取得する
function getAddressFromPostCode(){

    // 住所検索ボタンを押すと外部apiを叩く処理が走る。
    $.getJSON('http://zipcloud.ibsnet.co.jp/api/search?callback=?',
        {
            zipcode: ($('#postCodeUpper').val() + $('#postCodeLower').val())
        }
    )
    .done(function(data) {
        if (!data.results) {
            alert('該当の住所がありません');
        } else {
            let result = data.results[0];
            $('#prefecture').val(result.prefcode);
            $('#address1').val(result.address2 + result.address3);
        }
    }).fail(function(){
        alert('入力値を確認してください。');
    })
}
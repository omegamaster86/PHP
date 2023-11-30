function todayGet() {
    var today = new Date();
    today.setDate(today.getDate());
    var yyyy = today.getFullYear();
    var mm = ("0"+(today.getMonth()+1)).slice(-2);
    var dd = ("0"+today.getDate()).slice(-2);
    document.getElementById("today").value=yyyy+'-'+mm+'-'+dd;
}

$add_acting_manager_count = 0;
//監督代理のユーザID追加ボタンをクリック
function actingManagerAddButtonClick(){
    let elements = document.getElementById("target");
    let copied = elements.lastElementChild.cloneNode(true);

    if($add_acting_manager_count < 2){
        elements.appendChild(copied);
        $add_acting_manager_count++;
    }
}

//確認ボタンをクリック
function confirmButtonClick(){

}
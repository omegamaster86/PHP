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

//確認ボタンをクリック
function confirmButtonClick(){

}
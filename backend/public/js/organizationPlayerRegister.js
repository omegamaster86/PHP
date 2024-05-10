
var dropZone = document.getElementById('drop_zone');
var fileInput = document.getElementById('input_file');

function dropHandler(ev) {
    //console.log("File(s) dropped");
    ev.preventDefault();
}

function dragOverHandler(ev) {
    //alert("File(s) in drop zone");
    ev.preventDefault();// 既定の動作で防ぐ（ファイルが開かれないようにする）
}

function clickHoge() {
    //ボタンへのクリックをinput[type="file"]へ送る
    fileInput.click();
}

//ファイル情報を表示する関数
function filesInformation(files) {
    if (files.length === 0) {
        return;
    }
    document.getElementById("dropItemName").textContent = files[0].name;
}
//参照ファイルが変更された場合のイベントをinputタグに追加
fileInput.addEventListener('change', e => { filesInformation(e.target.files); });
dropZone.addEventListener('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; //ドロップしたファイルを取得
    if (files.length > 1) {
        return alert('アップロードできるファイルは1つだけです。');
    }
    document.getElementById("dropItemName").textContent = files[0].name;
    fileInput.files = files; //inputのvalueをドラッグしたファイルに置き換える。
    previewFile(files[0]);
}, false);


// 全選択
function allChecked() {
    checkList = checkList.replace('[', '').replace(']', '');
    var splitData = checkList.split(',');

    var tagElements = document.getElementsByClassName("checkval");
    var isRenkei = document.getElementsByClassName("renkei");
    if (!tagElements) {
        return false;
    }

    // for (var i = 0; i < tagElements.length; i++) {
    //     if (isRenkei[i].innerText == "登録待ち") {
    //         tagElements[i].checked = true;
    //         splitData[i] = 1;
    //         document.getElementById('alignmentButton').disabled = false;
    //     } else if (isRenkei[i].innerText == "登録可能") {
    //         tagElements[i].checked = true;
    //         splitData[i] = 2;
    //         document.getElementById('alignmentButton').disabled = false;
    //     }
    // }

    checkList = splitData.join(); //切り出した文字列を結合する
    document.getElementById("Flag01").value = checkList;
    //console.log(checkList);
}

// 全選択解除
function allUnChecked() {
    checkList = checkList.replace('[', '').replace(']', '');
    var splitData = checkList.split(',');

    var tagElements = document.getElementsByTagName("input");
    if (!tagElements)
        return false;

    // <input type="text" id="txtN">
    // for (var i = 0; i < tagElements.length; i++) {
    //     if (tagElements[i].className.match("checkval")) {
    //         tagElements[i].checked = false;
    //         document.getElementById('alignmentButton').disabled = true;
    //     }
    // }

    for (var i = 0; i < splitData.length; i++) {
        splitData[i] = 0;
    }
    checkList = splitData.join(); //切り出した文字列を結合する
    document.getElementById("Flag01").value = checkList;
    //console.log(checkList);
}

//チェックボックス変更イベント
function checkChange(e) {
    checkList = checkList.replace('[', '').replace(']', '');
    var splitData = checkList.split(',');
    //console.log(checkList);
    var isRenkei = document.getElementsByClassName("renkei");
    if (!isRenkei) {
        return false;
    }

    if (e.target.checked && isRenkei[Number(e.target.name)].innerText == "登録待ち") {
        splitData[Number(e.target.name)] = 1;
    } else if (e.target.checked && isRenkei[Number(e.target.name)].innerText == "登録可能") {
        splitData[Number(e.target.name)] = 2;
    } else {
        splitData[Number(e.target.name)] = 0;
    }
    checkList = splitData.join(); //切り出した文字列を結合する
    document.getElementById("Flag01").value = checkList;
    // if (checkList.includes("1") || checkList.includes("2")) {
    //     document.getElementById('alignmentButton').disabled = false;
    // } else {
    //     document.getElementById('alignmentButton').disabled = true;
    // }
    //console.log(checkList);
}
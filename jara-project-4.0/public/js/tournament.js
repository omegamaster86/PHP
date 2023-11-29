
// テーブルに行を追加 大会登録用
function appendRow()
{
    var objTBL = document.getElementById("tbl");
    if (!objTBL)
        return;
    
    var count = objTBL.rows.length;
    
    // 最終行に新しい行を追加
    var row = objTBL.insertRow(count);

    // 列の追加
    var c1 = row.insertCell(0);
    var c2 = row.insertCell(1);
    var c3 = row.insertCell(2);
    var c4 = row.insertCell(3);
    var c5 = row.insertCell(4);
    var c6 = row.insertCell(5);
    var c7 = row.insertCell(6);
    var c8 = row.insertCell(7);

    // 各列にスタイルを設定
    // c1.style.cssText = "text-align:right; width:40px;";
    // c2.style.cssText = "";
    // c3.style.cssText = "background-color: green; width:40px;";
    // c4.style.cssText = "background-color: red; width:40px;";
    
    // 各列に表示内容を設定
    c1.innerHTML = '<input type="button" value="削除" onclick="deleteRow(this)">';
    c2.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c3.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c4.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c5.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c6.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c7.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c8.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    // c3.innerHTML = '<input class="edtbtn" type="button" id="edtBtn' + count + '" value="確定" onclick="editRow(this)">';
    // c4.innerHTML = '<input class="delbtn" type="button" id="delBtn' + count + '" value="削除" onclick="deleteRow(this)">';
    
    // // 追加した行の入力フィールドへフォーカスを設定
    // var objInp = document.getElementById("txt" + count);
    // if (objInp){
    //     objInp.focus();
    // }  
}

// 行の削除
function deleteRow(obj)
{
    // 確認
    if (!confirm("この行を削除しますか？")){
        return;
    }

    if (!obj){
        return;
    }

    var objTR = obj.parentNode.parentNode;
    var objTBL = objTR.parentNode;
    
    if (objTBL){
        objTBL.deleteRow(objTR.sectionRowIndex);
    }

    // id/name ふり直し
    var tagElements = document.getElementsByTagName("input");
    if (!tagElements)
        return false;

    // <input type="text" id="txtN">
    var seq = 1;
    for (var i = 0; i < tagElements.length; i++)
    {
        if (tagElements[i].className.match("inpval"))
        {
            tagElements[i].setAttribute("id", "txt" + seq);
            tagElements[i].setAttribute("name", "txt" + seq);
            tagElements[i].setAttribute("value", seq);
            ++seq;
        }
    }
}

// テーブルに行を追加 大会情報更新用
function appendRow2()
{
    var objTBL = document.getElementById("tb2");
    if (!objTBL)
        return;
    
    var count = objTBL.rows.length;
    
    // 最終行に新しい行を追加
    var row = objTBL.insertRow(count);

    // 列の追加
    var c1 = row.insertCell(0);
    var c2 = row.insertCell(1);
    var c3 = row.insertCell(2);
    var c4 = row.insertCell(3);
    var c5 = row.insertCell(4);
    var c6 = row.insertCell(5);
    var c7 = row.insertCell(6);
    var c8 = row.insertCell(7);
    var c9 = row.insertCell(7);
    
    // 各列に表示内容を設定
    c1.innerHTML = '<input class="checkval" type="checkbox">';
    c2.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c3.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c4.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c5.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c6.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c7.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c8.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
    c9.innerHTML = '<input class="inpval" type="text" id="txt' + count + '" name="txt' + count + '" value="" size="4" style="border:1px solid #888;">';
}

// 全選択
function allChecked()
{
    // id/name ふり直し
    var tagElements = document.getElementsByTagName("input");
    if (!tagElements)
        return false;

    // <input type="text" id="txtN">
    for (var i = 0; i < tagElements.length; i++)
    {
        if (tagElements[i].className.match("checkval"))
        {
            tagElements[i].checked = true;
        }
    }
}

// 全選択解除
function allUnChecked()
{
    // id/name ふり直し
    var tagElements = document.getElementsByTagName("input");
    if (!tagElements)
        return false;

    // <input type="text" id="txtN">
    for (var i = 0; i < tagElements.length; i++)
    {
        if (tagElements[i].className.match("checkval"))
        {
            tagElements[i].checked = false;
        }
    }
}

// 開催場所入力欄表示切替
function venueTxtVisibilityChange(){
    if(document.getElementById('venueSelect')){
        var id = document.getElementById('venueSelect').value;
        if(id == 'その他'){
            document.getElementById('venueTxt').style.display = "";
        }else{
            document.getElementById('venueTxt').style.display = "none";
        }
    }
}



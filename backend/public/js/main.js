/*************************************************************************
 *  Project name: JARA
 *  File name: main.js
 *  File extension: .js
 *  Description: This is the main custom javascript file
 *************************************************************************
 *  Author: DEY PRASHANTA KUMAR
 *  Created At: 2023/11/02
 *  Updated At: 2023/11/30
 *************************************************************************
 *
 *  Copyright 2023 by DPT INC.
 *
 ************************************************************************/
//

//  Drag and drop start
const el_input_file_03 = document.getElementById('input-file-03');
const bt_file_03 = document.getElementById('bt-file-03');
const el_dropzone_03 = document.getElementById('dropzone-03');
const el_output_03 = document.getElementById('output-03');



const photo = document.getElementById('photo');
const mailAddressStatus = document.getElementById("mailAddressStatus");
const prefectures = document.getElementById("prefectures");
const prefecture = document.getElementById("prefecture");
const country = document.getElementById("country");
const birthCountry = document.getElementById("birthCountry");
const birthPrefectures = document.getElementById("birthPrefectures");
const birthPrefecture = document.getElementById("birthPrefecture");
const residenceCountry = document.getElementById("residenceCountry");
const residencePrefectures = document.getElementById("residencePrefectures");
const residencePrefecture = document.getElementById("residencePrefecture");





//ボタンへのクリックをinput[type="file"]へ送る。
if(bt_file_03){
    bt_file_03.addEventListener('click',()=>{
        el_input_file_03.click();
    })
}

//ボタンへのdragenter
if(bt_file_03){
    bt_file_03.addEventListener('dragenter',()=>{
        bt_file_03.classList.add('s-dragover');
    });
}
//ボタンへのdragover
if(bt_file_03){
    bt_file_03.addEventListener('dragover',e=>{
        e.preventDefault();
    });
}

//ボタンからのdragleave
if(bt_file_03){
    bt_file_03.addEventListener('dragleave',()=>{
        bt_file_03.classList.remove('s-dragover');
    });
}

//ボタンへのdrop => ファイル処理
if(bt_file_03){
    bt_file_03.addEventListener('drop',e=>{
        e.preventDefault();
        bt_file_03.classList.remove('s-dragover');
        const files = e.dataTransfer.files;
        filesInformation(files);
    });
}

//ボタンクリック => ファイル処理
if(el_input_file_03){
    el_input_file_03.addEventListener('change',e=>{
        const files = e.target.files;
        filesInformation(files);
    });
}

//ファイル情報を表示する関数
function filesInformation(files){
if(files.length===0) return;
const array_output = [
    //escHtml(str)はエスケープ処理をする関数
    // 'name: ' + escHtml(files[0].name),
    'name: ' + files[0].name,
    'type: ' + files[0].type,
    'size: ' + files[0].size + 'byte'
];
    document.getElementById("deleteUploadedPhoto").style.display = "inline";
    el_output_03.innerHTML = array_output.join('<br>');
}

//※ドロップゾーンに関する処理　ボタンへの処理と同じ
//ドロップゾーンへのdragenter
if(el_dropzone_03){
    el_dropzone_03.addEventListener('dragenter',()=>{
    el_dropzone_03.classList.add('s-dragover');
    });
}
//ドロップゾーンへのdragover
if(el_dropzone_03) {
    el_dropzone_03.addEventListener('dragover',e=>{
        e.preventDefault();
    });
}

//ドロップゾーンからのdragleave
if(el_dropzone_03) {
    el_dropzone_03.addEventListener('dragleave',()=>{
        el_dropzone_03.classList.remove('s-dragover');
    });
}

//ドロップゾーンへのdrop => ファイル処理
if(el_dropzone_03) {
    el_dropzone_03.addEventListener('drop',e=>{
        e.preventDefault();
        el_input_file_03.files = e.dataTransfer.files;
        el_dropzone_03.classList.remove('s-dragover');
        const files = e.dataTransfer.files;
        filesInformation(files);
    });
}


// Drag and Drop end

//This function will show or hide the details after button is clicked
function details($idName) {
    let el = document.getElementById($idName);
    if(el.style.display==='none' || el.style.display===''){
        el.style.display='block';
    }
    else{
        el.style.display='none';
    }
    
}

function deleteUploadedPhoto() {
    document.getElementById("input-file-03").value= null;
    // document.getElementById("photoFileName").innerText= "　　　";
    document.getElementById("deleteUploadedPhoto").style.display = "none";
    document.getElementById("output-03").innerText = "";
}
if(photo) {
    photo.addEventListener('change', function() {
        let file = document.getElementById("photo").files[0];
        document.getElementById("photoFileName").innerText = file.name;
        document.getElementById("deleteUploadedPhoto").style.display = "inline";
        const statusElement = document.getElementById('photoStatus');
        const maxFileSizeInKB = 1024 * 1024 ;
        if (file.size > maxFileSizeInKB) {
            statusElement.innerHTML = "Please select a photo less than 1MB.";
            statusElement.style.color = "red";
            statusElement.style.fontWeight = "bold";
            document.getElementById("photoDeleteButton").style.display = "none";
        } else {
            statusElement.innerHTML = 'Photo uploaded successfully!';
            document.getElementById("photoDeleteButton").style.display = "inline";
            statusElement.style.color = "green";
            statusElement.style.fontWeight = "bold";
        }
    });
}
if(mailAddressStatus) {
    if(mailAddressStatus.value==="1"){
        let emailChangeBox = document.getElementById("emailChangeBox");
        let emailChangeButton = document.getElementById("emailChangeButton");
        let emailChange = document.getElementById("emailChange");
        emailChangeBox.style.display='block';
        emailChangeButton.style.display='none';
        emailChange.style.display='none';
    }
}


//This function will show or hide the email change box after email change button is clicked in the user-edit page
function emailChangeBox() {
    let emailChangeBox = document.getElementById("emailChangeBox");
    let emailChangeButton = document.getElementById("emailChangeButton");
    let emailChange = document.getElementById("emailChange");
    let mailAddressStatus = document.getElementById("mailAddressStatus");
    let emailStatus = document.getElementById("emailStatus");
    let confirmEmailStatus = document.getElementById("confirmEmailStatus");
    if(emailChangeBox.style.display==='none' || emailChangeBox.style.display===''){
        emailChangeBox.style.display='block';
        emailChangeButton.style.display='none';
        emailChange.style.display='none';
        mailAddressStatus.value="1";
    }
    else{
        document.getElementById("mailAddress").value="";
        document.getElementById("confirm_email").value="";
        emailChangeBox.style.display='none';
        emailChangeButton.style.display='block';
        emailChange.style.display='inline';
        mailAddressStatus.value="0";
        confirmEmailStatus.style.display='none';
        emailStatus.style.display='none';
    }
    
}

//This function will show the prefectures input option if the country is  after email change button is clicked in the user-edit page

setTimeout(() => {
    if(country) {
        if(country.value==="112"){
        
            prefectures.style.display='flex';
        }
        else{
            prefectures.style.display='none';
            prefecture.value='';
        }
    }
}, "10");

setTimeout(() => {
    if(birthCountry) {
        if(birthCountry.value==="112"){
            birthPrefectures.style.display='flex';
        }
        else{
            birthPrefectures.style.display='none';
        }
    }
}, "10");

if(birthCountry){
    birthCountry.addEventListener('change', function() {
        let birthCountry = document.getElementById("birthCountry");
        let birthPrefecture = document.getElementById("birthPrefectures");
        if(birthCountry.value==="112"){
            birthPrefecture.style.display='flex'
        }
        else{
            birthPrefecture.style.display='none';
            document.getElementById("birthPrefecture").value='';
        }
    });
}

if(country) {
    country.addEventListener('change', function() {
        let country = document.getElementById("country");
        let prefecture = document.getElementById("prefectures");
        if(country.value==="112"){
            prefecture.style.display='flex'
        }
        else{
            prefecture.style.display='none';
            document.getElementById("prefecture").value='';
        }
    });
}

setTimeout(() => {
    if(residenceCountry){
        if(residenceCountry.value==="112"){
            residencePrefectures.style.display='block';
        }
        else{
            residencePrefectures.style.display='none';
        }
    }
}, "10");


if(residenceCountry) {
    residenceCountry.addEventListener('change', function() {
        console.log(residenceCountry.value);
        let country = document.getElementById("residenceCountry");
        let prefecture = document.getElementById("residencePrefectures");
        if(country.value==="112"){
            prefecture.style.display='block';
        }
        else{
            prefecture.style.display='none';
            document.getElementById("residencePrefecture").value='';
        }
    });
    
}

function changeConfirm($message,$page){
    let text = $message;
    if (confirm(text) === true) {
        window.location.replace($page);
    } 

}

function playerPictureDelete(){
    document.getElementById('playerPicture').src = 'http://127.0.0.1:8000/images/no-image.png';
    document.getElementById('playerPictureStatus').value = "delete";
    document.getElementById('playerPictureDeleteButton').style.display = "none";
}
function userPictureDelete(){
    document.getElementById('userPicture').src = 'http://127.0.0.1:8000/images/no-image.png';
    document.getElementById('userPictureStatus').value = "delete";
    document.getElementById('userPictureDeleteButton').style.display = "none";
}

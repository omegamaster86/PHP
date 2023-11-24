/*************************************************************************
 *  Project name: JARA
 *  File name: main.js
 *  File extension: .js
 *  Description: This is the main custom javascript file
 *************************************************************************
 *  Author: DEY PRASHANTA KUMAR
 *  Created At: 2023/11/02
 *  Updated At: 2023/11/09
 *************************************************************************
 *
 *  Copyright 2023 by DPT INC.
 *
 ************************************************************************/


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
function photoDelete(){
    document.getElementById("photo").value= null;
    document.getElementById("photoFileName").value= "";
    document.getElementById('photoStatus').innerHTML="";
    document.getElementById("photoDeleteButton").style.display = "none";
}

document.getElementById('photo').addEventListener('change', function() {
    let file = document.getElementById("photo").files[0];
    document.getElementById("photoFileName").value = file.name;
    const statusElement = document.getElementById('photoStatus');
    // const maxFileSizeInMB = 1;
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

        // upload file to remote server here
    }
    // if(photoEl.files[0].name){
        
    // } 
});
window.addEventListener('load', (event) => {

    if(document.getElementById("mailAddressStatus").value==="1"){
        let emailChangeBox = document.getElementById("emailChangeBox");
        let emailChangeButton = document.getElementById("emailChangeButton");
        let emailChange = document.getElementById("emailChange");
        emailChangeBox.style.display='block';
        emailChangeButton.style.display='none';
        emailChange.style.display='none';
    }
    
});


//This function will show or hide the email change box after email change button is clicked in the profile-edit page
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

//This function will show the prefectures input option if the country is  after email change button is clicked in the profile-edit page

if(document.getElementById("country").value==="日本"){
    document.getElementById("prefectures").style.display='flex';
}
else{
    document.getElementById("prefectures").style.display='none';
    document.getElementById("prefecture").value='';
}
if(document.getElementById("birthCountry").value==="日本"){
    document.getElementById("birthPrefectures").style.display='flex';
}
else{
    document.getElementById("birthPrefectures").style.display='none';
    document.getElementById("birthPrefecture").value='';
}

document.getElementById('birthCountry').addEventListener('change', function() {
    let birthCountry = document.getElementById("birthCountry");
    let birthPrefecture = document.getElementById("birthPrefectures");
    if(birthCountry.value==="日本"){
        birthPrefecture.style.display='flex'
    }
    else{
        birthPrefecture.style.display='none';
        document.getElementById("birthPrefecture").value='';
    }
});
document.getElementById('country').addEventListener('change', function() {
    let country = document.getElementById("country");
    let prefecture = document.getElementById("prefectures");
    if(country.value==="日本"){
        prefecture.style.display='flex'
    }
    else{
        prefecture.style.display='none';
        document.getElementById("prefecture").value='';
    }
});


if(document.getElementById("residenceCountry").value==="日本"){
    document.getElementById("residencePrefectures").style.display='none';
}
else{
    document.getElementById("residencePrefectures").style.display='none';
    document.getElementById("residencePrefecture").value='';
}
document.getElementById('residenceCountry').addEventListener('change', function() {
    console.log(document.getElementById("residenceCountry").value)
    let country = document.getElementById("residenceCountry");
    let prefecture = document.getElementById("residencePrefectures");
    if(country.value==="日本"){
        prefecture.style.display='block'
    }
    else{
        prefecture.style.display='none';
        document.getElementById("residencePrefecture").value='';
    }
});


// function passwordChangeConfirm(){
//     // let passwordChangeButtonEl = document.getElementById("passwordChangeButton");
//     let text = "パスワードを変更しますか?";
//     if (confirm(text) == true) {
//         window.location.replace('./dashboard');
//     } 

// }
// function clickThenSubmit(form) {

//     document.getElementById("verificationCodeSend").click();
//     return true;
// }
function changeConfirm($message,$page){
    // let passwordChangeButtonEl = document.getElementById("passwordChangeButton");
    let text = $message;
    if (confirm(text) === true) {
        window.location.replace($page);
    } 

}
// function clickThenSubmit(form) {

//     document.getElementById("verificationCodeSend").click();
//     return true;
// }

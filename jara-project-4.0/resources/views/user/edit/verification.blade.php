{{--*************************************************************************
* Project name: JARA
* File name: verification.blade.php
* File extension: .blade.php
* Description: This is the ui of user edit page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/14
* Updated At: 2023/11/14
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>User Edit Verification</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
        integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">

    <link rel="stylesheet" type="text/css" href="{{ asset('/font-awesome/css/font-awesome.min.css') }}">

    <link rel="stylesheet" type="text/css" href="{{ asset('css/user-edit.css') }}">

    {{-- Date Picker --}}
    <link rel="stylesheet" href="https://unpkg.com/flatpickr/dist/flatpickr.min.css">

</head>

<body>
    <div class="container bootstrap snippets bootdey">
        <h1 class="text-center">認証番号</h1>
        <hr>

        <form action="{{route('user.edit.verification')}}" method="POST">
            @csrf
            <div class="form-group" style="text-align: center">
                <label for="certificationNumber">受信したメールに記載されているコードを入力してください。</label>

                @if ($errors->has('verification_error'))
                <p style="margin: 1rem; font-weight:bold; color:red;text-align:center">{{
                    $errors->first('verification_error') }}</p>
                @endif
                <input type="text" maxlength="6" name="certificationNumber" class="form-control"
                    id="certificationNumber" required>
            </div>
            {{-- {{ ((session('message')['status'] ?? '') === 'success') ? 'done' : '' . isActive(
            'admin.installer.complete' ) }} --}}
            <input name="photo"  type="hidden"
                value="{{ session()->get('userInfo')['photo'] ??'' }}">
            <input name="userName" type="hidden"
                value="{{ session()->get('userInfo')['userName'] ?? '' }}">
            <input name="mailAddressStatus" type="hidden"
                value="{{ session()->get('userInfo')['mailAddressStatus'] ?? '' }}">
            <input name="mailAddress" type="hidden"
                value="{{ session()->get('userInfo')['mailAddress'] ?? '' }}">
            <input name="sex" type="hidden"
                value="{{ session()->get('userInfo')['sex'] ?? '' }}">
            <input name="dateOfBirth" type="hidden"
                value="{{ session()->get('userInfo')['dateOfBirth'] ?? '' }}">
            <input name="residenceCountry" class="form-control" type="hidden"
                value="{{  session()->get('userInfo')['residenceCountry'] ?? '' }}">
            <input name="residencePrefecture" class="form-control" type="hidden"
                value="{{ session()->get('userInfo')['residencePrefecture'] ?? '' }}">
            <input name="height" class="form-control" type="hidden"
                value="{{ session()->get('userInfo')['height'] ?? '' }}">
            <input name="weight" class="form-control" type="hidden"
                value="{{ session()->get('userInfo')['weight'] ?? '' }}">


            <div class="form-group" style="display: flex; margin-top:2rem;gap: 4rem;">
                <div class="col-lg-5" style="text-align: right">
                    <button type="submit" class=" btn btn-success btn-lg btn-block " data-toggle="modal"
                        data-target="#confirmModalOne">
                        {{ __('送信') }}
                    </button>
                </div>
                <div class="col-lg-5" style="text-align: right">
                    <a class="btn btn-danger btn-lg btn-block" href={{route('user.edit')}} role="button">Cancel</a>
                </div>
            </div>
        </form>
    </div>
    <hr>
    <script src="{{ asset('js/main.js') }}"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous">
    </script>
    {{-- Date Picker Start --}}
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://unpkg.com/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>

    <script>
        // date Picker
        $(".lib-flatpickr3").flatpickr({
            "locale": "ja",
            dateFormat: 'Y/m/d',
        });
    </script>
    {{-- Date Picker End --}}
    {{-- <script>
        // Get the modal
        var modal = document.getElementById('id01');
        
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
    </script> --}}
</body>

</html>
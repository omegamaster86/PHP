{{--*************************************************************************
* Project name: JARA
* File name: password-reset.blade.php
* File extension: .blade.php
* Description: This is the ui of password reset page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/01/10
* Updated At: 2023/01/10
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}


<x-guest-layout>
    <div>
        <h1 style="text-align:center;font-weight:bold;font-size:24px">パスワード再発行</h1>

        {{-- @if ($errors->has('terms_of_service'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">    
                {!!$errors->first('terms_of_service') !!}
            </p>
        @else
            @if ($errors->has('datachecked_error'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">
                    {!!$errors->first('datachecked_error') !!}
                </p>
            @endif
        @endif --}}
        @if ($errors->has('datachecked_error'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">
                {!!$errors->first('datachecked_error') !!}
            </p>
        @endif
        @if(session('status'))
            <p  class="error-css " style="color: green; background-color:lightgreen ; margin:1.25rem 0rem 0rem 0rem">
                {!!session('status')!!}
            </p>
        @endif
    </div>
    <form method="POST" action="{{ route('password-reset') }}">
        @csrf
        <!-- Email Address -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label onclick="details('emailInfo')" for="mailaddress" :value="__('登録済みメールアドレス')" style="display: inline;" />
                {{-- <i onclick="details('emailInfo')" class="fa fa-question-circle" aria-hidden="true"></i> --}}
                <x-text-input id="mailaddress" style="display: inline; width:55%; margin-left: 2%" class="mt-1 " name="mailaddress" :value="old('mailaddress')" />
            </div>
            {{-- <div id="emailInfo" style="margin-left: 15%">あああああああああああああああああああ</div> --}}
            
            @if ($errors->has('mailaddress'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('mailaddress') !!}</p>
            @endif
        </div>

        <!-- Confirm Email -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label style="display: inline;" for="confirm_email" :value="__('メールアドレス（確認用）')" />

                <x-text-input id="confirm_email" style="display: inline; width:55%; margin-left: 2%" class="mt-1 " name="confirm_email" :value="old('confirm_email')" />
            </div>

            @if ($errors->has('confirm_email'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('confirm_email') !!}</p>
            @endif
        </div>
        
        <div style="margin-top: 20px; margin-left:10px">
            <p style="font-size:12px">
                登録済みメールアドレスに仮パスワードを記載したメールが送付されます。
                「xxx@xxxx.xx」からのメールが受信出来るように受信設定をしてください。
            </p>
        </div>
        <div class=" items-center mt-4 " style=" text-align: center;">

            <x-primary-button class=" items-center">
                {{ __('送信') }}
            </x-primary-button>
        </div>

    </form>
    <div class=" items-center mt-4 " style=" text-align: right;">
        <a href="{{ route('login') }}">
            <x-primary-button>
                キャンセル
            </x-primary-button>
        </a>
    </div>

</x-guest-layout>
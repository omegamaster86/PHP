{{--*************************************************************************
* Project name: JARA
* File name: register.blade.php
* File extension: .blade.php
* Description: This is the ui of register page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/05
* Updated At: 2023/11/09
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<x-guest-layout>
    <div>
        <h1 style="text-align:center;font-weight:bold;font-size:24px">仮登録</h1>

        @if ($errors->has('terms_of_service'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!!$errors->first('terms_of_service') !!}</p>
        @else
            @if ($errors->has('datachecked_error'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!!$errors->first('datachecked_error') !!}</p>
            @endif
            {{-- <x-input-error :messages="$errors->get('datachecked_error')" class="mt-2" /> --}}
        @endif
        {{-- <x-input-error :messages="$errors->get('status')" class="mt-2" style="color: green;font-weight:bold;" /> --}}
        

        {{-- <x-input-error style="text-align: right" :messages="$errors->first('terms_of_service')" class="mt-2" /> --}}
        <br />
    </div>
    {{-- @dd(old('userName')) --}}
    <form method="POST" action="{{ route('register') }}">
        @csrf

        <!-- Name -->
        <div>
            <div style="text-align: right;">

                <x-input-label for="name" :value="__('ユーザー名')" onclick="details ('userInfo')"
                    style="display: inline;" />
                <i onclick="details('userInfo')" class="fa fa-question-circle " aria-hidden="true"></i>
                <input style="display: inline; width:55%; margin-left: 2%;" id="name" class="border-gray-300
                dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600
                focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm mt-1 " type="text" maxLength="32" name="userName" value="{{old('userName')}}"  />
            </div>
            <div id="userInfo" style="margin-left: 15%">あああああああああああああああああああ</div>

            @if ($errors->has('userName'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('userName') !!}</p>
            @endif
            {{-- <x-input-error :messages="$errors->get('userName')" class="mt-2" style="text-align: right" /> --}}
        </div>

        <!-- Email Address -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label onclick="details('emailInfo')" for="email" :value="__('メールアドレス')" style="display: inline;" />
                <i onclick="details('emailInfo')" class="fa fa-question-circle" aria-hidden="true"></i>
                <x-text-input id="email" style="display: inline; width:55%; margin-left: 2%" class="mt-1 "
                    name="mailAddress" :value="old('mailAddress')" />
            </div>
            <div id="emailInfo" style="margin-left: 15%">あああああああああああああああああああ</div>
            
            @if ($errors->has('mailAddress'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('mailAddress') !!}</p>
            @endif
            {{-- <x-input-error :messages="$errors->get('mailAddress')" class="mt-2" /> --}}
        </div>

        

        <!-- Confirm Email -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label style="display: inline;" name="confirm_email" for="confirm_email"
                :value="__('メールアドレスの確認入力')" />

                <x-text-input id="confirm_email" style="display: inline; width:55%; margin-left: 2%" class="mt-1 "
                    name="confirm_email" :value="old('confirm_email')" />
            </div>

            @if ($errors->has('confirm_email'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('confirm_email') !!}</p>
            @endif
            {{-- <x-input-error :messages="$errors->get('confirm_email')" class="mt-2" /> --}}
        </div>

        <!-- Confirm Password -->
        {{-- <div class="mt-4">
            <x-input-label for="password_confirmation" :value="__('パスワード確認')" />

            <x-text-input id="password_confirmation" class="block mt-1 w-full" type="password"
                name="password_confirmation" required autocomplete="new-password" />

            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div> --}}

        <div>
            <br />
            <h2 style="text-align:center;font-weight:regular;margin-bottom:5px">利用規約</h2>
        </div>
        <div>
            <textarea style="resize: none;" rows="5"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">人マ夏養受法フイねク準要ろび間発ぼ府自83駒ぱかがじ橋受ハケコ行進ハツネ往葉じひド力雇ませほ。集ニ選違的すぶぽぴ由禁サコホ言無ネエ属茨みフぞ盛9藤イ済食むえ面購ナテソシ行融ひゅど集変みなぶよ教帯人マ夏養受法フイねク準要ろび間発ぼ府自83駒ぱかがじ橋受ハケコ行進ハツネ往
            </textarea>
        </div>
        {{-- <a
            class="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            href="{{ route('login') }}">
            {{ __('Already registered?') }}
        </a> --}}
        <div style="margin: 5px 0px 10px 0px; text-align:center ">
            <input id="link-checkbox" name="terms_of_service" type="checkbox" @if(old('terms_of_service')) checked
                @endif value="1"
                class=" w-4 h-4 text-blue-600  rounded focus:outline-none focus-visible:outline-none focus:ring-transparent">
            <label for="link-checkbox"
                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">利用規約に同意する</label>
        </div>
        <div style="margin-top: 20px; margin-left:10px">
            <p style="font-size:12px">
                本登録までの説明文<br />
                メール受信＝＞メール本文に記載されているパスワードで本システムにログイン＝＞パスワード変更とユーザー情報を入力
            </p>
        </div>
        <div class=" items-center mt-4 " style=" text-align: center;">

            <x-primary-button class=" items-center">
                {{ __('仮登録') }}
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
{{--*************************************************************************
* Project name: JARA
* File name: login.blade.php
* File extension: .blade.php
* Description: This is the ui of login page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/02
* Updated At: 2023/11/09
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<x-guest-layout>
    <div>
        <h1 style="text-align:center;font-weight:bold;font-size:24px">ログイン</h1>

        @if ($errors->has('datachecked_error'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('datachecked_error') !!}</p>
        @endif
        {{-- <x-input-error :messages="$errors->get('datachecked_error')" style="font-weight: bold" class="mt-2" /> --}}
        <br />
    </div>
    <form method="POST" action="{{ route('login') }}" 
        class="px-4 py-2 font-semibold text-sm bg-white text-slate-700 dark:bg-slate-700 dark:text-white rounded-md shadow-sm ring-1 ring-black border-black dark:border-black border-2 border-solid">
        @csrf

        

        <div>
            <x-input-label for="mailAddress" :value="__('メールアドレス')" />
            <x-text-input id="mailAddress" class="block mt-1 w-full" name="mailAddress" :value="old('mailAddress')"
                autofocus />
            @if ($errors->has('mailAddress'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('mailAddress') !!}</p>
            @endif
        </div>




        <div class="mt-4">
            <x-input-label for="password" :value="__('パスワード')" />

            <x-text-input id="password" class="block mt-1 w-full" type="password" name="password" maxLength="32" value="{{old('password')}}" />
            @if ($errors->has('password'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('password') !!}</p>
            @endif
            
        </div>

        <div class="items-center  mt-4" style=" text-align: center;">
            
            <x-primary-button class="ml-3">
                {{ __('ログイン') }}
            </x-primary-button>
        </div>
    </form>

    <div class="items-center mt-4 " style="
        text-align: center;">
        <a href="#" 
            class="underline py-2 pl-2 font-mono text-xs text-indigo-600 whitespace-pre dark:text-indigo-300  ">
            {{ __('パスワードをお忘れるの場合') }}
        </a>
    </div>
    <div class=" items-center mt-4 " style=" text-align: center;">
        <a href="{{ route('register') }}">
            <x-primary-button class="ml-3 ">
                {{ __('新規登録') }}
            </x-primary-button>
        </a>
    </div>

    <div>
        <br />
        <p style="text-align:center;font-size:14px">
            日本ローイング協会　サポートデスク<br />
            <a href="#" 
                class="underline py-2 pl-2 font-mono text-xs text-indigo-600 whitespace-pre dark:text-indigo-300  ">
                お問い合わせはこちらへ
            </a><br />
            営業時間　：土・日・祝日・弊社休業日を除く<br />
            月曜～金曜 9：00～12：00　13：00～17：00
        </p>
    </div>
</x-guest-layout>
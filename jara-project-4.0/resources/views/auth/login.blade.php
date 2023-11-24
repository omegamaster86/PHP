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
    <!-- Session Status -->
    <p class="font-medium text-sm text-green-600 dark:text-green-400">{!! Session::get('status') !!}</p>
    <div>
        <h1 style="text-align:center;font-weight:bold;font-size:24px">ログイン</h1>

        <x-input-error :messages="$errors->get('datachecked_error')" style="font-weight: bold" class="mt-2" />
        <br />
    </div>
    <form method="POST" action="{{ route('login') }}"
        class="px-4 py-2 font-semibold text-sm bg-white text-slate-700 dark:bg-slate-700 dark:text-white rounded-md shadow-sm ring-1 ring-black border-black dark:border-black border-2 border-solid">
        @csrf

        <!-- Email Address -->
        {{-- Change Start --}}
        {{-- <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required
                autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div> --}}

        <div>
            <x-input-label for="mailAddress" :value="__('メールアドレス')" />
            <x-text-input id="mailAddress" class="block mt-1 w-full" name="mailAddress" :value="old('mailAddress')"
                autofocus />
            <x-input-error :messages="$errors->get('mailAddress')" class="mt-2" />
        </div>



        <!-- Password -->
        {{-- <div class="mt-4">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full" type="password" name="password" required
                autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div> --}}
        <div class="mt-4">
            <x-input-label for="password" :value="__('パスワード')" />

            <x-text-input id="password" class="block mt-1 w-full" type="password" name="password"
                :value="old('password')" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>


        <!-- Remember Me -->
        {{-- <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox"
                    class="rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                    name="remember">
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ __('Remember me') }}</span>
            </label>
        </div> --}}


        <div class="items-center  mt-4" style=" text-align: center;">
            {{-- @if (Route::has('password.request'))
            <a class=" underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100
            rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            dark:focus:ring-offset-gray-800" href="{{ route('password.request') }}">
                {{ __('Forgot your password?') }}
            </a>
            @endif --}}


            {{-- <x-primary-button class=" ml-3">
                {{ __('Log in') }}
            </x-primary-button> --}}
            <x-primary-button class="ml-3">
                {{ __('ログイン') }}
            </x-primary-button>
        </div>
        {{-- Change End --}}
    </form>

    <div class="items-center mt-4 " style="
        text-align: center;">
        <a href="https://www.jara.or.jp/index.html" target="_blank"
            class="underline py-2 pl-2 font-mono text-xs text-indigo-600 whitespace-pre dark:text-indigo-300  ">
            {{ __('パスワードをお忘れるの場合') }}
        </a>
    </div>
    <div class=" items-center mt-4 " style=" text-align: center;">
        <a href="{{ route('register') }}">
            <x-primary-button class="ml-3 ">
                {{ __('新登録') }}
            </x-primary-button>
        </a>
    </div>

    <div>
        <br />
        <p style="text-align:center;font-size:14px">
            日本ロイング協会　サポートデスク<br />
            <a href="https://www.jara.or.jp/index.html" target="_blank"
                class="underline py-2 pl-2 font-mono text-xs text-indigo-600 whitespace-pre dark:text-indigo-300  ">
                お問い合わせはこちらへ
            </a><br />
            営業時間　：土・日・祝日・弊社休業日を除く<br />
            月曜～金曜 9：00～12：00　13：00～17：00
        </p>
    </div>
</x-guest-layout>
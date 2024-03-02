{{--*************************************************************************
* Project name: JARA
* File name: contact-us-confirm.blade.php
* File extension: .blade.php
* Description: This is the confirmation page of contact-us info
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/01/16
* Updated At: 2023/01/18
*************************************************************************
*
* Copyright 2024 by DPT INC.
*
************************************************************************--}}
<x-guest-layout>
    @if ($errors->has('mail_sent_error'))      
        @dd($errors->first('mail_sent_error'))
    @endif
    <div>
        <h1 style="text-align:center;font-weight:bold;font-size:24px">お問い合わせ</h1>
        @if ($errors->has('mail_sent_error'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">
                {!!$errors->first('mail_sent_error') !!}
            </p>
        @endif
        <br />
    </div>

    <form method="POST" action="{{ route('contact-us-confirm') }}">
        @csrf

        <!-- Name -->
        <div>
            <div style="text-align: right;">

                <x-input-label for="user_name" :value="__('＊ユーザー名')" style="display: inline;" />
                <p style="display: inline; width:55%; margin-left: 26%;" class=" dark:bg-gray-900 dark:text-gray-300 mt-1 ">{{$user->user_name}}</p>
                <input  id="user_name"  type="hidden" maxLength="32" name="user_name" value="{{$user->user_name}}"  />
            </div>
        </div>

        <!-- Email Address -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label for="mailaddress" :value="__('＊メールアドレス')" style="display: inline;" />
                <p style="display: inline; width:55%; margin-left: 4%" class="mt-1"  >{{$user->mailaddress}}</p>
                <x-text-input id="mailaddress" type="hidden" name="mailaddress" value="{{$user->mailaddress}}" />
            </div>
        </div>
        
        <!-- User ID Address -->
        @if(!$user_logged_out)
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label :value="__('＊ユーザID')" style="display: inline;" />
                <p style="display: inline; margin-left: 36%" class="mt-1" >{{$user->user_id}}</p>
                <x-text-input  type="hidden" name="user_id" value="{{ $user->user_id}}" />
            </div>
        </div>
        @endif

        <!-- Content -->
        <div class="mt-4" >
            <div style="display: flex;align-items: center;justify-content: end;">
                <x-input-label style="display: inline;" for="content" :value="__('＊お問い合わせ内容')" />
                <p style="display: inline; margin-left: 36%" class="mt-1" class="mt-1  dark:bg-gray-900 dark:text-gray-300  ">{{$user->content}}</p>
                <input  rows="5"  id="content" type="hidden"  name="content" value="{{$user->content}}" />
            </div>

        </div>
        <div style="display: none">
            <input name="terms_of_service" type="checkbox" checked value="1">
        </div>
        
        <div class="items-center mt-4" style=" text-align: center;">
            <x-primary-button class=" items-center">
                {{ __('送信') }}
            </x-primary-button>
        </div>

    </form>
    <div class=" items-center mt-4 " style=" text-align: right;">
        <x-primary-button onclick="javascript:history.go(-1)">
            キャンセル
        </x-primary-button>
    </div>

</x-guest-layout>
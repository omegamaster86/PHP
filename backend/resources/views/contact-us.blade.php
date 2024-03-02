{{--*************************************************************************
* Project name: JARA
* File name: contact-us.blade.php
* File extension: .blade.php
* Description: This is the ui of contact-us page
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
        <h1 style="text-align:center;font-weight:bold;font-size:24px">お問い合わせ</h1>

        
        @if ($errors->has('datachecked_error'))
            <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">
                {!!$errors->first('datachecked_error') !!}
            </p>
        @endif
        
        
        <br />
    </div>
    <form method="POST" action="{{ route('contact-us') }}">
        @csrf

        <!-- Name -->
        <div>
            <div style="text-align: right;">

                <x-input-label for="user_name" :value="__('＊ユーザー名')" style="display: inline;" />
                
                @if($user_logged_out)
                <input style="display: inline; width:55%; margin-left: 4%;" id="user_name" class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm mt-1 " type="text" maxLength="32" name="user_name" value="{{old('user_name')}}"  />
                @else
                <input style="display: inline; width:55%; margin-left: 4%;" id="user_name" class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm mt-1 " type="text" maxLength="32" name="user_name" value="{{$user->user_name}}"  readonly/>
                @endif
            </div>

            @if ($errors->has('user_name'))
                <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">
                    {!! $errors->first('user_name') !!}
                </p>
            @endif
        </div>

        <!-- Email Address -->
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label for="mailaddress" :value="__('＊メールアドレス')" style="display: inline;" />
                
                @if($user_logged_out)
                <x-text-input id="mailaddress" style="display: inline; width:55%; margin-left: 4%" class="mt-1" name="mailaddress" :value="old('mailaddress')" />
                @else
                <x-text-input id="mailaddress" style="display: inline; width:55%; margin-left: 4%" class="mt-1" name="mailaddress" value="{{$user->mailaddress}}" readonly/>
                @endif
            </div>
            
            @if ($errors->has('mailaddress'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('mailaddress') !!}</p>
            @endif
        </div>
        
        <!-- User ID Address -->
        @if(!$user_logged_out)
        <div class="mt-4" >
            <div style="text-align: right;">
                <x-input-label :value="__('＊ユーザID')" style="display: inline;" />
                <x-text-input style="display: inline; width:55%; margin-left: 4%" class="mt-1" name="user_id" value="{{ $user->user_id}}" readonly/>
            </div>
        </div>
        @endif

        

        <!-- Content -->
        <div class="mt-4" >
            <div style="display: flex;align-items: center;justify-content: end;">
                <x-input-label style="display: inline;" for="content" :value="__('＊お問い合わせ内容')" />
                <textarea style="resize: none; width:55%; margin-left: 5%" rows="5"  id="content"  name="content" value="{{old('content')}}" class="mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300  rounded-md shadow-sm"></textarea>
            </div>

            @if ($errors->has('content'))
                <p  class="error-css" style="color: red;margin:1.25rem 0rem 0rem 0rem">{!! $errors->first('content') !!}</p>
            @endif
        </div>
        @if($user_logged_out)
            <div>
                <br />
                <h2 style="text-align:center;font-weight:regular;margin-bottom:5px">
                    個人情報の取り扱いについて
                </h2>
            </div>
            <div style="text-align: justify">
                xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                xxxxxxxxxxxxxx
            </div>
            <div style="margin: 5px 0px 10px 0px; text-align:center ">
                <input id="link-checkbox" name="terms_of_service" type="checkbox" @if(old('terms_of_service') ) checked @endif value="1" class=" w-4 h-4 text-blue-600  rounded focus:outline-none focus-visible:outline-none focus:ring-transparent">
                <label for="link-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">＊上記個人情報に関する内容について同意する</label>
                @if ($errors->has('terms_of_service'))
                    <p  class="error-css " style="color: red;margin:1.25rem 0rem 0rem 0rem">    
                        {!!$errors->first('terms_of_service') !!}
                    </p>
                @endif
            </div>
        @else
            <div style="display: none">
                <input name="terms_of_service" type="checkbox" checked value="1">
            </div>
        @endif
        
        <div class="items-center mt-4" style=" text-align: center;">
            <x-primary-button class=" items-center">
                {{ __('確認') }}
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
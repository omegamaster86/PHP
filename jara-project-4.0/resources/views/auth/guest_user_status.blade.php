{{--*************************************************************************
* Project name: JARA
* File name: guest_status.blade.php
* File extension: .blade.php
* Description: This is the ui of status page for guest user
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/25
* Updated At: 2023/11/25
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<x-guest-layout>
    <div style="text-align:center;font-size:20px">
        <p style="text-align:left;">
            @if(session('status'))
            {!!session('status')!!}
            @else
            <script>window.location = {{route('register')}};</script>
            @endif
        </p><br>
        <a href="{{ (session('url')??"") }}"　>
            <x-primary-button>
                {{session('url_text')??""}}
            </x-primary-button>
        </a>
    </div>
</x-guest-layout>
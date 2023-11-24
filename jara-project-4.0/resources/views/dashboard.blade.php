{{--*************************************************************************
* Project name: JARA
* File name: dashboard.blade.php
* File extension: .blade.php
* Description: This is the ui of dashboard page
*************************************************************************
* Author: DEY PRASHANTA KUMAR
* Created At: 2023/11/02
* Updated At: 2023/11/09
*************************************************************************
*
* Copyright 2023 by DPT INC.
*
************************************************************************--}}
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('ダッシュボード') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    {{ Auth::user()->userName }} {{ __("様は現在ログインしています。") }}
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
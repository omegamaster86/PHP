<?php
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;

// use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('token-controller', [UserController::class, 'token'])->name('token');
// Route::get('/token', function () {
//     // $token = $request->session()->token();
 
//     // $token = ;
//     // $token = "bscbsb";
//     return csrf_token();
//     // ...
// });

Route::get('/', function () {
    return view('welcome');
});

require __DIR__ . '/auth.php';

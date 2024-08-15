<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RememberController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('register/add',[AuthController::class,'register']);
Route::post('login/success',[AuthController::class,'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',[AuthController::class,'isAuthenticated']);
    Route::post('/remember/logout',[AuthController::class,'logout']);
    Route::post('/remember/add',[RememberController::class,'store']);
    Route::patch('/remember/update',[RememberController::class,'update']);
    Route::get('/remember/load',[RememberController::class,'load']);
    Route::delete('/remember/delete/{id}',[RememberController::class,'destroy']);

    // update info for auth user
    Route::patch('/remember/auth-info',[AuthController::class,'authGetUser']);
    Route::patch('/remember/auth-update',[AuthController::class,'authUserUpdate']);
    
});
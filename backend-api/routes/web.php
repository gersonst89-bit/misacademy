<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::view('/reset-password', 'auth.reset_password')->name('password.reset');
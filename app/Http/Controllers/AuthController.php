<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Hashids\Hashids;
use Auth;
use Carbon\Carbon;
use App\Helpers\Image64ConvertString;


class AuthController extends Controller
{
    
    public function register(Request $request){

        try{
                $data = $request->all();
                $validator = Validator::make($data,[
                    'email'=>'required|email',
                    'location'=>'required:min:2',
                    'fullname'=>'required|min:2',
                    'password' => 'required|min:6|confirmed',
                    'password_confirmation' => 'required|min:6'
                ],[
                    "location.required" => "The country/city field is required."
                ]);
                if($validator->fails()){
                    return response()->json([
                        'status'=> 422,
                        'validate_err'=> $validator->messages(),
                    ]);
                }
                $remember = new User;

                DB::transaction(function () use ($request,$remember,$data){
                    
                    $fullname = $data["fullname"];

                    $parts = explode(" ", $fullname);

                    $generateUser = "";

                    foreach ($parts as $part) {
                        $generateUser .= strtolower(substr($part, 0, 1)); // Take the first letter of each part
                    }

                    $remember->email = $data['email'];
                    $remember->username = ""; 
                    $remember->fullname = $data['fullname'];
                    $remember->password = Hash::make($data['password']);
                    $remember->latitude = $data['latitude'];
                    $remember->longitude = $data['longitude'];
                    $remember->location = $data['location'];

                    $remember->save();

                    $hashids = new Hashids();

                    $generate_id = $hashids->encode($remember->id);

                    $generateUser .= $generate_id;

                    User::where('email', $data['email'])->update([
                        "username" => $generateUser,
                    ]);
                });
                          
                $token = $remember->createToken('spa_auth_token')->plainTextToken;
                
                return response()->json([
                    'status'=> 200, //success
                    'success'=> "success",
                    'token' => $token,
                ]);




        }catch(\Exception $e){
            return response()->json([
                'status'=> 422, // invalid data
                'error'=> $e->getMessage(),
            ]);
        }

    }

    public function login(Request $request){

        $hashids = new Hashids();

        try{

            $data = $request->all();

            
            $user = User::where('email','=',$data['email'])->first();
            
            if (!$user || !Hash::check($data['password'],$user->password)) {
                return response()->json([
                    "status" => 422,
                    'error' => 'Invalid credentials'
                ]);
            }

            if($user){

                if(Hash::check($data['password'],$user->password)){

                    if (Auth::attempt($request->only('email', 'password'))) {  

                    $token = $user->createToken(
                        'spa_auth_token', ['*'], now()->addMinutes(env('EXPIRY'))
                    )->plainTextToken;

                    $cookie = cookie('spa_auth_token', $token,  env('EXPIRY')); // 1 day

                    $custom_auth_user = [
                        'status' => 200,
                        'user_id' => $hashids->encode(Auth::user()->id),
                        'token_id' => $token
                    ];
                    
                    return response()->json($custom_auth_user)->withCookie($token);

                    }
                    
                }
            }
            
        }catch(\Exception $e){
            return response()->json([
                "status" => 422,
                'error' => $e->getMessage(),
            ]);
        }

    }

    public function logout(Request $request)
    {
        $cookie = cookie()->forget('spa_auth_token');
        Auth::guard('web')->logout();
        return response()->json(['message' => 'Successfully logged out'])->withCookie($cookie);
    }

    public function isAuthenticated(Request $request){

        if(Auth::check()){
            
            $hashids = new Hashids();

            $user = User::where('email','=',Auth::user()->email)->first();
 
            $api_user = $user->tokens()->where([
                ['tokenable_id','=',Auth::user()->id],
                //['expires_at', '=',null],
            ])
            ->orderBy('id','desc')
            ->first();
            
            if($api_user){
                
                // new data fresh token

                $token = $api_user['token']; // eloquent sql data
                $cookie = cookie('spa_auth_token', $token, env('EXPIRY')); // 1 day
                
                if(Carbon::parse($api_user->expires_at)->isPast()){

                    $cookie = cookie()->forget('spa_auth_token'); //delete session if expired
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();

                    $custom_auth_user = [
                        'user_id' => '',
                        'token_id' => ''
                    ];
                    


                    return response()->json($custom_auth_user)->withCookie($cookie);
 
                }

                $custom_auth_user = [
                    'user_id' => $hashids->encode(Auth::user()->id),
                    'token_id' => $token
                ];
                
                return response()->json($custom_auth_user)->withCookie($cookie);
            }
            
            return response()->json([
                'message' => 'No login yet!'
            ]);

        }

    }

    public function authGetUser(Request $request){

        try{

            $user = User::where(['id' => \Auth::user()->id])->first();

            $hashids = new Hashids();

            if($user){
                $avatar = "/images/profile-user.png";
                if($user->avatar !== null){
                    $avatar ="/storage/avatar/{$user->avatar}";
                }

                return response()->json([
                    'status' => 200,
                    'data' => [
                        'id' => $hashids->encode($user->id),
                        'email' => $user->email,
                        'avatar' => $avatar,
                        'fullname' => $user->fullname,
                        'latitude' => $user->latitude,
                        'longitude' => $user->longitude,
                        'location' => $user->location,
                    ],
                ]);

            }

        }catch(\Exception $e){
            return response()->json([
                'status' => 500,
                'message' => $e->getMessages(),
            ]);
        }
    }


    public function authUserUpdate(Request $request){

        try{

            $data = $request->all();
            
            $hashids = new Hashids();
                
            $validator = Validator::make($data,[
                'email' => 'email|required',
                'location' => 'required',
                'password' => 'required|min:6|confirmed',
                'password_confirmation' => 'required|min:6',
            ]);

            if($validator->fails()){
                return response()->json([
                    'status'=> 422,
                    'validate_err'=> $validator->messages(),
                ]);
            }

            $decodedId = $hashids->decode($data['id']);

            $user = User::find($decodedId[0]);

            $image = Image64ConvertString::photoUpload($data['avatar'],"avatar");

            $avatarName = "";

            if($image["status"] === 200){

                $avatarName = $image['avatar'];
            }
            
            

            DB::transaction(function() use($data,&$sumbit,&$user,&$avatarName){
                
                $user->email = $data['email'];
                
                $user->password = Hash::make($data['password']);

                if(!empty($data['location']) && !empty($data['longitude'])){
                    $user->location = $data['location'] ?? "";
                    $user->longitude = $data['longitude'] ?? "";
                }


                if($avatarName!== ""){
                    $user->avatar = $avatarName;
                }
                
                $user->save();
                     
                return response()->json([
                    "status" => 200,
                    'message' => 'Successfully updated your account!'
                ]);
            });

            return response()->json([
                "status" => 200,
                'message' => 'Successfully updated your account!'
            ]);
            

        }catch(\Exception $e){
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage(),
            ]);
        }

    }

}

<?php

namespace App\Http\Controllers;

use App\Models\Remember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Auth;
use Hashids\Hashids;


class RememberController extends Controller
{

    public function load(Request $request){

        try{
            
            
            $query = Remember::where([
                'user_id' => \Auth::user()->id
            ])->get();
                    
            $collected = collect($query)->map(function($query){
                $hashids = new Hashids();
                if($query->id || $query->user_id){
                    $query->custom_id = "{$hashids->encode($query->id)}";
                    unset($query->id);
                    $query->custom_user_id = "{$hashids->encode($query->user_id)}";
                    unset($query->user_id);
                }
                return $query;
            });
                    
            return response()->json([
                "status" => 200,
                "data" => $collected,
            ]);
        }catch(\Exception $e){
            return response()->json([
                "status" => 500,
                "data" => $e->getMessage(),
            ]);
        }

    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        try{

            $data = $request->all();

            $validator = Validator::make($data,[
                'title' => 'required',
                'description' => 'required',
            ]);

            if($validator->fails()){
                return response()->json([
                    'status' => 422,
                    'data' => $validator->messages(),
                ]);
            }


            $remember = new Remember;
            DB::transaction(function() use ($remember,$data){
                $remember->user_id = Auth::user()->id;
                $remember->title = $data['title'];
                $remember->description = $data['description'];
                $remember->start = Carbon::parse($data['start']);
                $remember->end = Carbon::parse($data['start'])->addDays(1);
                $remember->status = "idle";
                $remember->created_by = Auth::user()->username;
                $remember->save();
    
            });

            $hashids = new Hashids();

            return response()->json([
                'status' => 200,
                'message' => 'Successfully created!',
                'data' => [
                    'id' => $hashids->encode($remember->id),
                    'start' => $remember->start,
                    'end' => $remember->end,
                    'title' => $remember->title,
                    'description' => $remember->description,
                    'status' => $remember->status,
                    'created_by' => $remember->created_by,
                ],
            ]);
        
        }catch(\Exception $e){
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage(),
                
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Remember $remember)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Remember $remember)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, Remember $remember)
{
    try {
        $data = $request->all();
     
        $validator = Validator::make($data, [
            'title' => 'required',
            'description' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'data' => $validator->messages(),
            ]);
        }

        $hashids = new Hashids();
        $decodedIdArray = $hashids->decode($data['id']);
        $update = Remember::find($decodedIdArray[0]);
        $updated = [];

        if ($update) {

            DB::transaction(function() use($data, $update, &$updated, $hashids) {
                $update->title = $data['title'];
                $update->description = $data['description'];
                $update->status = strtolower($data['status']);
                $update->save();
                $updated = [
                    "id" => $hashids->encode($update->id),
                    "title" => $update->title,
                    "description" => $update->description,
                ];
            });

            return response()->json([
                'status' => 200,
                'message' => 'Successfully updated!',
                'data' => $updated,
            ]);
        }

    } catch (\Exception $e) {
        return response()->json([
            'status' => 500,
            'data' => $e->getMessage(),
        ]);
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try{

            $deleted = false;
            $hashids = new Hashids();
            $decodedId = $hashids->decode($id);
            $remember = Remember::find($decodedId);

            // Ensure $decodedId is an array with at least one element
            if (count($decodedId) > 0) {
                $rememberId = $decodedId[0];
                $remember = Remember::find($rememberId);

                DB::transaction(function() use ($remember, &$deleted) {
                    if ($remember) {
                        $deleted = true;
                        $remember->delete();
                    }
                });
            }
            if($deleted){
                return response()->json([
                    'status' => 200,
                    'message' => 'Successfully deleted!',
                ]);
            }
            //dd(deleted);
        }catch(\Exception $e){
            return response()->json([
                'status' => 500,
                'data' => $e->getMessage(),
            ]);
        }

        
    }
}

<?php
namespace App\Helpers;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
class Image64ConvertString
{
    public static function photoUpload($photoString, $storageName)
    {
        try {
            $image_64 = $photoString; // your base64 encoded data

            $extension = explode('/', explode(':', substr($image_64, 0, strpos($image_64, ';')))[1])[1]; // .jpg .png .pdf

            $replace = substr($image_64, 0, strpos($image_64, ',')+1);

            // find substring for replace here eg: data:image/png;base64,
            $image = str_replace($replace, '', $image_64); 

            $image = str_replace(' ', '+', $image); 

            $imageName = Str::random(10).'.'.$extension;

            $storageDisk = Storage::disk($storageName)->put($imageName, base64_decode($image));


            if (empty($storageDisk)) {
                return [
                    "status" => 500,
                    "storage" => false,
                    "message" => "Failed to upload image."
                ];
   
            }  
            return [
                "status" => 200,
                "storage" => $storageDisk,
                "avatar" => $imageName,
                "message" => "Success upload.",
            ];
            
        } catch (\Exception $e) {
            return [
                "status" => 500,
                "storage" => false,
                "message" => $e->getMessage(),
            ];
        }
    }


}
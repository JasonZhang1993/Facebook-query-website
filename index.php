<?php 
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods:GET,POST');
    header('Access-Control-Allow-Headers:x-requested-with,content-type');
    
    $AppID = "2007237286170639";
    $AppSecret = "1766958a80cc54b89bd8a624714fabce";
    $access_token = "EAAchkllsEA8BAIAQP7WSUxfboMmHSCEAEjaRZBH3xGS4hbzyAXZA51vdXf1l4ocnq5BygslaLg0vKlwkKdENdxkqIqUZBuAtX3MgaTLfEFOHqYEHtvOcHjE90pPGGlYwkGwMRY291wjsrE2DddEvKm7cmkX77cZD";
    
    $q = $_GET["q"];
    $type = $_GET["type"];
    $fields = "fields=albums.limit(5){name,photos.limit(2){id,name}},posts.limit(5)";
    if (isset($_GET["id"])){
        $url = "https://graph.facebook.com/v2.8/" . urlencode($_GET["id"]) . "?" . $fields . "&access_token=" . $access_token;
    }
    else if ($type == 'place' && isset($_GET["center"])){
        $url = "https://graph.facebook.com/v2.8/search?q=" . urlencode($q) . "&type=" . urlencode($type) . "&center=" . urlencode($_GET["center"]) . "&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;
    }
    else{
        $url = "https://graph.facebook.com/v2.8/search?q=" . urlencode($q) . "&type=" . urlencode($type) . "&fields=id,name,picture.width(700).height(700)&access_token=" . $access_token;
    }
//    echo $url;
    $json = file_get_contents($url);
    echo $json;
?>
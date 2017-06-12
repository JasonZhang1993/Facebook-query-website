var center = '';
window.addEventListener("load", getLocation());

$(function() {
    $('#keyword').popover({
        content: "Please type a keyword",
        html: true,
        trigger: 'manual',
        placement: 'bottom'
    });

    $('#search').click(function(e){
        if ($('#keyword').val() == ""){
            $('#keyword').popover('show');
        }
        e.stopPropagation();
    });
    
    $('#keyword').keypress(function(e){
        if (e.keyCode == 13 && $('#keyword').val() == ""){
            $('#keyword').popover('show');
        }
        else {$('#keyword').popover('hide');}
        e.stopPropagation();
    });
    
    $(document).click(function(){
        $('#keyword').popover('hide');
    });
    
    $('button.customClear').click(function() {
        if ($("#user-tab[class~='active']").length == 0){
            $("li.active").removeClass("active");
            $("#user-tab").addClass("active");
        }
    });
});

var app = angular.module('myApp', ['ngAnimate']);
app.controller('myCtrl', function ($scope, $http, $log) {
    $scope.q = ""; // default
    $scope.favorite = JSON.parse(localStorage.getItem("f")) || {};
    $scope.showProgress = false;
    $scope.showError = [false, false, false, false, false];
    $scope.detailError = [false, false];
    $scope.seeTable = true;
    $scope.seeDetail = false;
    $scope.detailObj = {};
    $scope.types = ['user', 'page', 'event', 'place', 'group'];
    $scope.active = ['in active','','','','',''];
            
    // change view to this or other tabs content
    $scope.viewTable = function (type) {
        $scope.seeTable = true;
        $scope.seeDetail = false;
        if ($scope.active.indexOf("in active") != type)
            $scope.active = ['','','','','',''];
    }
    
    // back button
    $scope.back = function () {
        $scope.seeTable = true;
        $scope.seeDetail = false;
    }
    
    // change view between table and details
    $scope.viewDetail = function (obj, type) {
        $scope.seeTable = false;
        $scope.seeDetail = true;
        $scope.active[type] = "in active";
//        $log.info($scope.active); // testing
        $scope.showProgress = true;
        $scope.detailError = [false, false];
        $scope.detailObj = {
            "id": obj.id,
            "name": obj.name,
            "type": obj.type || type,
            "src": obj.src || obj.picture.data.url
        };
        detailRequest(obj.id);
    }
    
    // by default first album is displayed
    $scope.firstAlbum = function (index) {
        if (index == 0 && $scope.detail.albums.data[index].photos != null) return 'in';
        else return '';
    }
    
    // check whether album has photos
    $scope.doHavePhoto = function (index){
        if ($scope.detail.albums.data[index].photos != null) return "#album" + index;
        else return "";
    }
    
    // parse iso time
    $scope.parsedTime = function (t) {
        if (moment(t).isValid){
            return moment(t).format("YYYY-MM-DD HH:mm:ss").toString();
        }
        else{return 'Unknown';}
    }
    
    // store to my favorite
    $scope.myFavorite = function (obj, type){
        var id = obj.id;
        if (!$scope.favorite[id]){ // add a favorite
            var newObj = {
                "id": id,
                "name": obj.name,
                "type": type,
                "src": obj.src || obj.picture.data.url
            };
//            $log.info(newObj); // testing
            $scope.favorite[id] = newObj;
            localStorage.setItem("f", JSON.stringify($scope.favorite));
        }
        else { // delete favorite
            $scope.deleteFavorite(id);
        }
    }
    
    $scope.deleteFavorite = function (id){
        delete $scope.favorite[id];
        localStorage.setItem("f", JSON.stringify($scope.favorite));
    }
    
    // check isEmpty(obj)
    $scope.isEmpty = function (obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    
    // clear function
    $scope.clear = function () {
        $scope.q = "";
        $scope.showProgress = false;
        $scope.showError = [false, false, false, false, false];
        $scope.detailError = [false, false];
        $scope.seeTable = true;
        $scope.seeDetail = false;
        $scope.data = [];
        $scope.paging = [];
        $scope.detail = {};
    };
    
    $scope.checkEnter = function (e) {
        if (e.keyCode == 13){
            $scope.search();
            e.preventDefault();
            return false;
        }
    }
    
    // search
    $scope.search = function () { // make Ajax call to get search results
        if ($scope.q == "") return;
        $scope.showProgress = true;
        $scope.showError = [false, false, false, false, false];
        $scope.data = [];
        $scope.paging = [];
        $scope.seeTable = true;
        $scope.seeDetail = false;
        angular.forEach($scope.types, function (type){
            $http({
                method: 'GET',
//                url: 'http://localhost/~mac/Homework6/hw8.php?q=' + $scope.q + '&type=' + type +(type == 'place' ? ('&center=' + center) : '')
                url: 'http://myapp2017-env.us-west-2.elasticbeanstalk.com?q=' + $scope.q + '&type=' + type +(type == 'place' ? ('&center=' + center) : '')
            })
            .then(function successSearch(response){
//                $log.info(type); // testing
                try{
                    var data = angular.fromJson(response.data).data;
                    if (data != null && data.length > 0){
                        $scope.data[$scope.types.indexOf(type)] = data; // care about status, statusText ? // check no results //done
                        $scope.paging[$scope.types.indexOf(type)] = angular.fromJson(response.data).paging;
                    }
                    else{
                        $scope.showError[$scope.types.indexOf(type)] = true;
                        $scope.paging[$scope.types.indexOf(type)] = angular.fromJson(response.data).paging;
                    }
                }
                catch(err){$scope.showError[$scope.types.indexOf(type)] = true;}
                $scope.showProgress = false;

            }, function errorSearch(response){
                $scope.data[$scope.types.indexOf(type)] = [];
                $scope.showProgress = false;
                $scope.showError[$scope.types.indexOf(type)] = true;
            });
        });
    };
    
    // paging request
    $scope.pager = function (type, url) { // check error ? // done
        $http({
            method: 'GET',
            url: url
        })
        .then(function successPaging(response){
            $scope.showError[type] = false;
            try{
                var data = angular.fromJson(response.data).data;
                $scope.data[type] = data; // care about status, statusText ? // check no results // done
                $scope.paging[type] = angular.fromJson(response.data).paging;
                 if (data == null || data.length == 0){
                    $scope.showError[type] = true;
                }
            }
            catch(err){$scope.showError[type] = true;}
        }, function errorSearch(response){
            $scope.data[type] = [];
            $scope.showProgress = false;
            $scope.showError[type] = true;
        });
    };
    
    // detail request
    function detailRequest(id){
//        $log.info(id); // testing
        $scope.detail = {};
        $http({
            method: 'GET',
//            url: 'http://localhost/~mac/Homework6/hw8.php?id=' + id
            url: 'http://myapp2017-env.us-west-2.elasticbeanstalk.com?id=' + id
        })
        .then(function successSearch(response){
            try{
                $scope.detail = angular.fromJson(response.data);
                if ($scope.detail.albums == null || $scope.detail.albums.length == 0)
                    $scope.detailError[0] = true;
                if ($scope.detail.posts == null || $scope.detail.posts.length == 0)
                    $scope.detailError[1] = true;
            }
            catch(err){$scope.detailError = [true, true];}
            $scope.showProgress = false;
        }, function errorDetail(response){ // get error // done
            $scope.detailError = [true, true];
            $scope.showProgress = false;
        });
    }
    
    $scope.shareFB = function (src, name) {
        FB.init({
            appId: '2007237286170639',
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
//        $log.info("share FB" + name); // testing
        FB.ui({
            app_id: '2007237286170639',
            method: 'feed',
            link: window.location.href,
            picture: src,
            name: name,
            description: ' ',
            caption: 'FB SEARCH FROM CSCI571',
        }, function(response){
            if (response && !response.error_message)
                alert("Posted Successfully");
            else alert("Not Posted");
        });
    }
    
});

function getLocation(){
    if (navigator.geolocation) { // get location
            navigator.geolocation.getCurrentPosition(function getPosition(position){
                center = position.coords.latitude + ',' + position.coords.longitude;
                console.log(center);// testing
            });
        }
}

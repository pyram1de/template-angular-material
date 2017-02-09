(
    function(){
        var app = angular.module('myApp',['ngMaterial']);
        app.controller('MainController',['$scope','$mdDialog', function($scope,$mdDialog){
            $scope.place = "world";
            console.log('yte');
            $scope.clicked = function(){
                console.log('in here');
                alert = $mdDialog.alert({
                    title: 'OK',
                    textContent: 'Ok Clicked',
                    ok: 'Close'
                });

                $mdDialog.show(alert);

            }
        }])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
            .primaryPalette('indigo', {
            'default': '400', // by default use shade 400 from the pink palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('green')
        .backgroundPalette('grey',{
            'default': '200'
        }).dark();
            $mdThemingProvider.theme('default-grey').backgroundPalette('grey');
            $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
            $mdThemingProvider.theme('default-orange')
                .accentPalette('green')
                .backgroundPalette('deep-orange');
            //$mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
            //$mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
        });
    }
)();
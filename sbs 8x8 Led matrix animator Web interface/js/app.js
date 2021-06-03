var app = angular.module('app', []);

app.controller('AppController', function($scope, $timeout) {
    $scope.baseFrame = [
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false],
        [false,false,false,false,false,false,false,false]
    ];

    $scope.currentFrameIndex = 0;
    $scope.frames = [angular.copy($scope.baseFrame)];
    $scope.standardTiming = 15;
    $scope.timings = [angular.copy($scope.standardTiming)];
    $scope.isAnimating = false;

    $scope.isShowingCode = false;
    $scope.isShowingInput = false;
    $scope.outputCode = '';
    $scope.inputCode = '';

    $scope.drawmode = '';

    // Drawing
    $scope.startDrawing = function(row, pixel, event) {
        $scope.stopAnimation();
        $scope.drawmode = ($scope.frames[$scope.currentFrameIndex][row][pixel] == true)?'clear':'color';
        $scope.frames[$scope.currentFrameIndex][row][pixel] = !$scope.frames[$scope.currentFrameIndex][row][pixel];
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }
    $scope.stopDrawing = function(){
        $scope.drawmode = '';
    }
    $scope.checkDraw = function(row, pixel, event) {
        if($scope.drawmode != ''){
            $scope.frames[$scope.currentFrameIndex][row][pixel] = ($scope.drawmode == 'color')?true:false;
        }
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }

    // Shifting
    $scope.shift = function(direction){
        var currFrame = $scope.frames[$scope.currentFrameIndex];
        var newFrame = angular.copy($scope.baseFrame);
        switch(direction){
            case 'up':
                for(var i = 0; i < currFrame.length-1; i++){
                    newFrame[i] = currFrame[i+1];
                }
                newFrame[7] = currFrame[0];
                break;
            case 'down':
                for(var i = 1; i < currFrame.length; i++){
                    newFrame[i] = currFrame[i-1];
                }
                newFrame[0] = currFrame[7];
                break;
            case 'left':
                for(var i = 0; i < currFrame.length; i++){
                    for(var p = 0; p < currFrame[i].length-1; p++){
                        newFrame[i][p] = currFrame[i][p+1];
                    }
                    newFrame[i][7] = currFrame[i][0];
                }
                break;
            case 'right':
                for(var i = 0; i < currFrame.length; i++){
                    for(var p = 1; p < currFrame[i].length; p++){
                        newFrame[i][p] = currFrame[i][p-1];
                    }
                    newFrame[i][0] = currFrame[i][7];
                }
                break;
        }
        $scope.frames[$scope.currentFrameIndex] = newFrame;
    }


    // Menu actions
    $scope.validateActiveMode = function(){
        // resets to normal editor mode
        $scope.stopAnimation();
        $scope.isShowingCode = false;
        $scope.isShowingInput
    }

    $scope.addFrame = function(){
        $scope.validateActiveMode();
        $scope.frames.splice($scope.currentFrameIndex+1, 0, angular.copy($scope.baseFrame));
        $scope.timings.splice($scope.currentFrameIndex+1, 0, angular.copy($scope.standardTiming));
        $scope.currentFrameIndex = $scope.currentFrameIndex+1;

    }
    $scope.copyFrame = function(){
        $scope.validateActiveMode();
        //$scope.frames.push(angular.copy($scope.baseFrame));
        $scope.frames.splice($scope.currentFrameIndex+1, 0, angular.copy($scope.frames[$scope.currentFrameIndex]));
        $scope.timings.splice($scope.currentFrameIndex+1, 0, angular.copy($scope.timings[$scope.currentFrameIndex]));
        $scope.currentFrameIndex = $scope.currentFrameIndex+1;
    }

    $scope.removeFrame = function(){
        $scope.validateActiveMode();
        if($scope.frames.length == 1){
            // clear if only one frame is existing
            $scope.frames[0] = angular.copy($scope.baseFrame);
            $scope.timings[0] = angular.copy($scope.standardTiming);
        } else {
            $scope.frames.splice($scope.currentFrameIndex,1);
            $scope.timings.splice($scope.currentFrameIndex,1);
            if($scope.currentFrameIndex != 0) {
                $scope.currentFrameIndex = $scope.currentFrameIndex - 1;
            }
        }
    }

    $scope.selectFrame = function(index){
        $scope.validateActiveMode();
        $scope.currentFrameIndex = index;
    }

    $scope.getPreviousFrameIndex = function(){
        var retval = 0;
        if($scope.currentFrameIndex == 0){
            retval = $scope.frames.length -1;
        } else {
            retval = $scope.currentFrameIndex-1;
        }
        return retval;
    }



    // Animation
    $scope.toggleAnimation = function(){
        if($scope.isAnimating == true){
            $scope.stopAnimation();
            $scope.validateActiveMode();
        } else {
            $scope.validateActiveMode();
            $scope.isAnimating = true;
            $scope.animateToNextFrame();
        }
    }
    $scope.animateToNextFrame = function(){
        if($scope.isAnimating == true){
            $scope.currentFrameIndex = $scope.currentFrameIndex + 1;
            if($scope.currentFrameIndex == $scope.frames.length){
                $scope.currentFrameIndex = 0;
            }
            $timeout(function(){
                if($scope.isAnimating == true) {
                    $scope.animateToNextFrame();
                }
            },$scope.timings[$scope.currentFrameIndex]*10);
        }
    }
    $scope.stopAnimation = function(){
        $scope.isAnimating = false;
    }



    // Code Output
    $scope.toggleCodeOverlay = function(){
        $scope.isShowingInput = false;
        $scope.isShowingCode = !$scope.isShowingCode;
        if($scope.isShowingCode){
            $scope.outputCode = buildFrames();
        }
    }

    function buildFrames(){
        var s = '';
		var mm =$scope.frames.length +1;
        s += 'const byte SBS['+mm+'][8] = { \n {';
        for(var frame = 0; frame < $scope.frames.length; frame++) {
            var f =''
			var b=0;
            for (var row = 0; row < $scope.frames[frame].length; row++) {
                f += 'B';
				b++;
                for (var pixel = 0; pixel < $scope.frames[frame][row].length; pixel++) {
                    f += $scope.frames[frame][row][pixel] ? '1' : '0';
					}
					
				if (b==8) 
					{
					b=0;
					f+='}, \n {';
				}else{
					f+=',';	
					}; 
			}
			
				
            s += f;
        }
		
        s +=  "B11111111,B11111111,B11111111,B11111111,B11111111,B11111111,B11111111,B11111111},\n }; \n int Length = "+mm+';';
        return s;
    }
    
});
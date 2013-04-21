// ----------------------------------------------------------------------------
// Simulates a Cellular Automata using a browser canvas.
// The Cellular Automata is a HodgePodge machine, with parameters chosen so
// that the patterns generated are roughly circular.
//
// Parameters:
//
//  canvas          : The canvas DOM element.
//  numberOfStates  : The number of states in the cellular automata.
//  k1              : Controls infection rate of healthy cells by damping the
//                    effect of infected neighbours.
//  k2              : Controls infection rate of healthy cells by damping the
//                    effect of ill neighbours.
//  g               : Controls progress of infected cells.
// ----------------------------------------------------------------------------

var HodgePodge = function(  canvas,
                            numberOfStates,
                            k1,
                            k2,
                            g){
    
    // Mutable state.
    var _statesCurrent = [],
        _statesNext = [],
        _width = 0,
        _height = 0,
        _size = 0;

    // Replace undefined parameters with defaults.
    var _canvas = canvas || document.getElementsByTagName("canvas")[0],
        _numberOfStates = numberOfStates || 100.0,
        _k1 = k1 || 1.0,
        _k2 = k2 || 1.5,
        _g = g || 34.0;

    return {
        start   : _start
    };
        
    // The method that starts the animation.
    function _start(){
        _width = _canvas.width;
        _height = _canvas.height;
        _size = _width * _height;

        _statesCurrent.length = _size;
        _statesNext.length = _size;
        
        // Ensure all array indices are populated to prevent slow array access.
        for(var i=0; i<_size; ++i)
        {
            _statesCurrent[i] = 0.0;
            _statesNext[i] = 0.0;
        }
        
        // Don't seed edges to prevent fixed border states from dominating.
        for (var y = 1; y < _height-1; ++y)
        {
            for (var x = 1; x < _width-1; ++x)
            {
                _statesCurrent[x + y * _width] =
                        Math.floor(Math.random()*(_numberOfStates+1));
                _statesNext[x + y * _width] = 0;        
            }
        }
        
        // Render without waiting for the timer, so that the display is not
        // empty to start with.
        _render();
        
        // Update the display on a timer.
        setInterval(_tick, 200);
    };
    
    // The animation timer tick.
    function _tick(){
        _updateStates();
        _swapStateBuffers();
        _render();
    };

    // Renders one frame of the animation.
    function _render(){
        var ctx = _canvas.getContext("2d");
        var imageData = ctx.getImageData(0, 0, _width, _height);
        var data = imageData.data;

        var pixelIndex = 0;
        for(var stateIndex = 0; stateIndex<_size; ++stateIndex){
            var value = (_statesCurrent[stateIndex] * 255) / _numberOfStates;
            value = Math.floor(value);
            data[pixelIndex++] = 0;
            data[pixelIndex++] = 0;
            data[pixelIndex++] = value;
            data[pixelIndex++] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);    
    };

    // Updates the Cellular Automata state.
    function _updateStates(){
        for (var y = 1; y < _height-1; ++y)
        {
            for (var x = 1; x < _width-1; ++x)
            {
                var current = _statesCurrent[x + y * _width];
                var numInfected = 0.0;
                var numIll = 0.0;
                var sum = current;

                var neighbours = [
                    _statesCurrent[(x+0) + (y-1) * _width],
                    _statesCurrent[(x-1) + (y+0) * _width],
                    _statesCurrent[(x+1) + (y+0) * _width],
                    _statesCurrent[(x+0) + (y+1) * _width]
                ];
                
                for (var i=0; i<neighbours.length; ++i)
                {
                    numIll      += neighbours[i] === (_numberOfStates - 1)
                                    ? 1.0 : 0.0;
                    numInfected += (neighbours[i] !== 0.0)
                                    ? 1.0 : 0.0;
                    sum         += neighbours[i];
                }
                
                var nextState;

                // Healthy.
                if (current === 0.0)
                {
                    nextState = Math.floor(numInfected/_k1)
                                + Math.floor(numIll/_k2);
                }
                // Ill.
                else if (current === _numberOfStates - 1)
                {
                    nextState = 0.0;
                }
                // Infected.
                else
                {   
                    // Copied from C implementation. Not in book!
                    nextState = Math.floor(sum / (numInfected + 1.0)) + _g;
                }

                // Ensure state is valid.
                nextState = Math.min(nextState, _numberOfStates - 1);

                // Update state.
                _statesNext[x + y * _width] = nextState;
            }
        }
    };
    
    // Swaps the next and current Cellular Automata state buffers.
    function _swapStateBuffers(){
        var temp = _statesCurrent;
        _statesCurrent = _statesNext;
        _statesNext = temp;
    };
}

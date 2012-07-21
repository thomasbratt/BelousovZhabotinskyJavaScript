// ----------------------------------------------------------------------------
// Simulates a Cellular Automata using a browser canvas.
// The Cellular Automata is a HodgePodge machine, with parameters chosen so
// that the patterns generated are roughly circular.
// ----------------------------------------------------------------------------

var hodgePodge = {
    
    // Mutable state.
    statesCurrent : [],
    statesNext : [],
    width : 0,
    height : 0,
    size : 0,
    
    // Constants.
    NumberOfStates : 100.0,
    K1 : 1.0,
    K2 : 1.5,
    G : 34.0,
    
    // The method that starts the animation.
    Start : function(){
  
        var canvas = document.getElementById('canvas');
        this.width = canvas.width;
        this.height = canvas.height;
        this.size = this.width * this.height;

        this.statesCurrent.length = this.size;
        this.statesNext.length = this.size;
        
        // Ensure all array indices are populated to prevent slow array access.
        for(var i=0; i<this.size; ++i)
        {
            this.statesCurrent[i] = 0.0;
            this.statesNext[i] = 0.0;
        }
        
        // Don't seed edges to prevent fixed border states from dominating.
        for (var y = 1; y < this.height-1; ++y)
        {
            for (var x = 1; x < this.width-1; ++x)
            {
                this.statesCurrent[x + y * this.width] = Math.floor(Math.random()*(this.NumberOfStates+1));
                this.statesNext[x + y * this.width] = 0;        
            }
        }
        
        // Render without waiting for the timer, so that the display is not
        // empty to start with.
        this.Render();
        
        // Update the display on a timer.
        var obj = this;
        setInterval(function(){
            obj.Tick(obj);
        }, 100);
    },
    
    // The animation timer tick.
    Tick : function(obj){
        obj.UpdateStates();
        obj.SwapStateBuffers();
        obj.Render();
    },

    // Renders one frame of the animation.
    Render : function(){
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, this.width, this.height);
        var data = imageData.data;

        var pixelIndex = 0;
        for(var stateIndex = 0; stateIndex<this.size; ++stateIndex){
            var value = (this.statesCurrent[stateIndex] * 255) / this.NumberOfStates;
            value = Math.floor(value);
            data[pixelIndex++] = 0;
            data[pixelIndex++] = 0;
            data[pixelIndex++] = value;
            data[pixelIndex++] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);    
    },

    // Updates the Cellular Automata state.
    UpdateStates : function(){
        for (var y = 1; y < this.height-1; ++y)
        {
            for (var x = 1; x < this.width-1; ++x)
            {
                var current = this.statesCurrent[x + y * this.width];
                var numInfected = 0.0;
                var numIll = 0.0;
                var sum = current;

                var neighbours = [
                    this.statesCurrent[(x+0) + (y-1) * this.width],
                    this.statesCurrent[(x-1) + (y+0) * this.width],
                    this.statesCurrent[(x+1) + (y+0) * this.width],
                    this.statesCurrent[(x+0) + (y+1) * this.width]
                ];
                
                for (var i=0; i<neighbours.length; ++i)
                {
                    numIll      += neighbours[i] === (this.NumberOfStates - 1) ? 1.0 : 0.0;
                    numInfected += (neighbours[i] !== 0.0) ? 1.0 : 0.0;
                    sum         += neighbours[i];
                }
                
                var nextState;

                // Healthy.
                if (current === 0.0)
                {
                    nextState = Math.floor(numInfected/this.K1) + Math.floor(numIll/this.K2);
                }
                // Ill.
                else if (current === this.NumberOfStates - 1)
                {
                    nextState = 0.0;
                }
                // Infected.
                else
                {   
                    // Copied from C implementation. Not in book!
                    nextState = Math.floor(sum / (numInfected + 1.0)) + this.G;  
                }

                // Ensure state is valid.
                nextState = Math.min(nextState, this.NumberOfStates - 1);

                // Update state.
                this.statesNext[x + y * this.width] = nextState;
            }
        }
    },
    
    // Swaps the next and current Cellular Automata state buffers.
    SwapStateBuffers : function (){
        var temp = this.statesCurrent;
        this.statesCurrent = this.statesNext;
        this.statesNext = temp;
    }
}

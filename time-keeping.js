/**
 * time-keeping - keep track of used time so far
*/

var millisUsed = 0,
    running = false,
    startTime = null;

module.exports =  {

    start(){
        if(running) { throw Error('Time-keeping already started.'); }
        startTime = Date.now();
        running = true;
    },

    stop(){
        millisUsed = this.usedTimeInMillis();
        running = false;
    },

    usedTimeInMillis(){
        var total = millisUsed;

        if(running) {
            total += Date.now() - startTime;
        }

        return total;
    }
};
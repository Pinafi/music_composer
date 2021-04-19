class TimelineController{
    constructor(component){
        this.component = component;
        this.counter = null;
        this.currentTime = 0;
        this.endCompositionAt = 0;
        this.playedSounds = [];
        
        this.setEvents()
    }

    setEvents(){
        this.initNeedle();
        this.component.componentElement.querySelector("[playButton]").onclick = () =>  {
            if(this.currentTime > this.endCompositionAt)
                this.stop();
            this.play();
        };
        this.component.componentElement.querySelector("[pauseButton]").onclick = () => {
            this.pause();
        };
    }

    stop(){
        this.clearCounter();
        this.setNeedlePosition(0);
        this.playedSounds.forEach(sound => sound.stop());
        this.playedSounds = [];
    }

    pause(){
        for(let sound of this.playedSounds){
            if(sound.startAt + (sound.audio.duration * 1000) > this.currentTime)
                sound.pause();
        }
        this.clearCounter();
    }

    play(){
        try{
            let hasSomeTrackWithSounds = this.component.tracks.some(track => track.sounds.length > 0);
            if(hasSomeTrackWithSounds){
                let lastUpdate = Date.now();
                let startTime = lastUpdate;
                if(this.currentTime > 0 ){
                    startTime = lastUpdate - this.currentTime;
                    this.component.tracks.forEach(track => {
                        for(let sound of track.sounds){
                            if(sound.startAt < this.currentTime && sound.startAt + (sound.audio.duration * 1000) > this.currentTime){
                                sound.pause()
                                sound.audio.currentTime = (this.currentTime - sound.startAt)/1000;
                                sound.play();
                                this.playedSounds.push(sound);
                            }
                        }
                    });
                }

                this.counter = setInterval(() => {
                    let now = Date.now();
                    lastUpdate = now;
                    this.setNeedlePosition(now-startTime);
                    this.component.tracks.forEach(track => {
                        track.sounds.forEach(sound => {
                            if(
                                sound.startAt < this.currentTime && 
                                (sound.startAt + (sound.audio.duration * 1000)) > this.currentTime
                            ){
                                sound.play();
                                this.playedSounds.push(sound);
                            }
                        });
                    });
                    if(this.currentTime > this.endCompositionAt)
                        this.stop();
                }, 10);
            }
        }catch(error){
            console.log(error);
        }
    }

    setNeedlePosition(value){
        this.currentTime = value;
        this.component.needle.header.style.left = this.milisecondsToPixels(this.currentTime);
        this.component.needle.body.style.left = this.milisecondsToPixels(this.currentTime);
        this.calculateDisplayCounter();
    }
    
    milisecondsToPixels(miliseconds){
        return `${(miliseconds / this.component.timelineScale)}px`;
    }

    initNeedle = () => {
        this.setNeedlePosition(0);

        let mouseObservedAction = null;
        let continuePlaying = null;

        let dragComponent = (event) => {
            continuePlaying = this.counter != null;
            this.stop();

            let left = (event.pageX - this.component.tracksElement.offsetLeft) + this.component.tracksElement.scrollLeft;
            left = (left < 0)? 0 : left;
            let trackPointerMoment = (((left*100)/60) * 1000)/100;
            this.setNeedlePosition(trackPointerMoment);

            let action = (e) => {
                if(e.type == "mousemove"){
                    let left = (e.pageX - this.component.tracksElement.offsetLeft) + this.component.tracksElement.scrollLeft;
                    left = (left < 0)? 0 : left;
                    let trackPointerMoment = (((left*100)/60) * 1000)/100;
                    this.setNeedlePosition(trackPointerMoment);
                }
            };
            mouseObservedAction = this.component.mouse.subscribe(action);
        };
        let stopDragComponent = () =>{
            let mouseUpSubscriptedAction = null;
            mouseUpSubscriptedAction = this.component.mouse.subscribe((e) => {
                if(e.type == "mouseup"){
                    this.component.mouse.unsubscribe(mouseObservedAction);
                    this.component.mouse.unsubscribe(mouseUpSubscriptedAction);
                    if(continuePlaying) this.play();
                    continuePlaying = null;
                }
            });
        }
        let drag = (event) => {
            dragComponent(event);
            stopDragComponent();
        }
        this.component.timeline.onmousedown = (event) => {
            drag(event);
        };
        this.component.needle.body.onmousedown = (event) => {
            console.log(event);
            drag(event);
        };
        this.component.needle.header.onmousedown = (event) => {
            drag(event);
        };
    }

    calculateDisplayCounter(){
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        let miliseconds = this.currentTime;

        if(miliseconds >= 1000){
            seconds = Math.floor(this.currentTime/1000);
            miliseconds = this.currentTime - (Math.floor(this.currentTime/1000)*1000);
        }
        if(seconds > 60){
            minutes = Math.floor(seconds/60);
            seconds = seconds - (Math.floor(seconds/60)*60);
        }
        if(minutes > 60){
            hours = Math.floor(minutes/60);
            minutes = minutes - (Math.floor(minutes/60)*60);
        }

        hours = (hours < 10)? "0"+hours:hours;
        minutes = (minutes < 10)? "0"+minutes:minutes;
        seconds = (seconds < 10)? "0"+seconds:seconds;
        miliseconds = miliseconds.toFixed(0);
        if(miliseconds < 10){
            miliseconds = "00"+miliseconds;
        }else if(miliseconds < 100){
            miliseconds = "0"+miliseconds;
        }
        this.component.counterElement.textContent = `${hours}h ${minutes}m ${seconds}s ${miliseconds}ms`;
    }

    clearCounter(){
        clearInterval(this.counter);
        this.counter = null;
    }
}

export default TimelineController;
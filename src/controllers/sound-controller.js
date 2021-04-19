class SoundController{

    constructor(audio, element, trackPanel){
        this.trackPanel = trackPanel;
        this.element = element;
        this.audio = audio;
        this.track = null;
        this.startAt = 0;

        this.setTitle(this.audio.name);
        this.element.onmousedown = (event) => this.initDragFunction(event);
    }

    setTitle(title){ 
        this.element.querySelector("span").innerText = title;
    }

    play(){
        this.audio.play();
    }

    pause(){
        this.audio.pause();
    }

    stop(){
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    click = () => {
        console.log("click on sound sample");
        // if(this.dialog != null){
        //     this.dialog.open();
        // }else{
        //     this.dialog = new TrackSoundDialog(this.request);
        //     this.dialog.afterInit = () => {
        //         this.dialog.open();
        //     }
        // }
    }

    initDragFunction(event){
        
        if(this.track != null){
            let absoluteXClickPosition = ((event.pageX - this.trackPanel.tracksElement.offsetLeft) + this.trackPanel.tracksElement.scrollLeft);
            let clickedPositionOnElement = (absoluteXClickPosition - (this.startAt / this.trackPanel.timelineScale));
            let dragged = false;

            //init drag handle
            let mouseObservedAction = this.trackPanel.mouse.subscribe((e) => {
                if(e.type == "mousemove"){
                    dragged = true;
                    if(e.target != this.element.parentElement && e.target.hasAttribute("track")){
                        e.target.append(this.element);
                        let removedSounds = this.track.sounds.splice(this,1);
                        let receptorTrack =  this.trackPanel.tracks.find(track => track.element == e.target);
                        receptorTrack.sounds.push(removedSounds[0]);
                        this.track = receptorTrack;
                        receptorTrack.sortSounds();
                    }else{
                        let left = this.startAt / this.trackPanel.timelineScale;
                        left = ((e.pageX - this.trackPanel.tracksElement.offsetLeft) + this.trackPanel.tracksElement.scrollLeft) - clickedPositionOnElement;
                        left = (left < 0)? 0 : left;
                        this.element.style.left = `${left}px`;
                        this.startAt = left * this.trackPanel.timelineScale;
                    }
                }
            });

            //stop drag handle
            let mouseUpSubscriptedAction = null;
            mouseUpSubscriptedAction = this.trackPanel.mouse.subscribe((e) => {
                if(e.type == "mouseup"){
                    this.trackPanel.mouse.unsubscribe(mouseObservedAction);
                    this.trackPanel.mouse.unsubscribe(mouseUpSubscriptedAction);
                    this.stop();

                    if(e.x == event.x && !dragged){
                        this.click();
                    }else{
                        this.track.sortSounds();
                        this.trackPanel.renderTimeline();
                    }
                }
            });
        }
    }
}

export default SoundController;
import Component from "../../../models/component.js";

// declare subcomponents here
const declaredComponents = [];

class SoundListItemComponent extends Component{
    
    static tagName = "app-sound-list-item";
    soundList = [];

    constructor(){
        super();
        this.template = "./sound-list/sound-list-item/sound-list-item-component.html";
        this.style = "./sound-list/sound-list-item/sound-list-item-component.scss";

        this.declaredComponents = declaredComponents;
    }

    onInit(){
        this.audioButtonControl = this.componentElement.querySelector("[audioButtonControl]");
        this.setEvents();
    }

    setEvents(){
        if(this.audio != null){
            if(this.audio.name != null){
                let soundName = this.componentElement.querySelector("[soundName]");
                soundName.innerText = this.audio.name;
            }
            this.audio.beforeRemove = () => {
                if(this.audioButtonControl.classList.contains("bi-stop-circle")){
                    this.audio.pause();
                    this.audio.currentTime = 0;
                }
                this.audioButtonControl.classList.remove("bi-stop-circle");
                this.audioButtonControl.classList.add("bi-play-circle");
            };
            this.audio.ontimeupdate = (event) => {
                this.updateProgressBar(event.path[0].currentTime);
            };
        }
        this.audioButtonControl.onclick = (event) => {
            if(this.audioButtonControl.classList.contains("bi-play-circle")){

                this.audioButtonControl.classList.add("bi-stop-circle");
                this.audioButtonControl.classList.remove("bi-play-circle");

                this.parentComponent.playSound(this.audio);

            }else if(this.audioButtonControl.classList.contains("bi-stop-circle")){

                this.audioButtonControl.classList.remove("bi-stop-circle");
                this.audioButtonControl.classList.add("bi-play-circle");

                this.parentComponent.stopSound();
            }
        };
    }

    updateProgressBar(currentTime){
        let bar = this.componentElement.querySelector("[progressBar] .bar");
        let currentPercentage = 0;
        if(currentTime != this.audio.duration){
            currentPercentage = (currentTime*100)/this.audio.duration;
        }else{
            this.audioButtonControl.classList.remove("bi-stop-circle");
            this.audioButtonControl.classList.add("bi-play-circle");
        }
        bar.style.width = `${currentPercentage}%`;
        
    }
}

export default SoundListItemComponent;
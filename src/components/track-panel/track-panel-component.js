import TimelineController from "../../controllers/timeline-controller.js";
import SoundController from "../../controllers/sound-controller.js";
import Component from "../../models/component.js";

// declare subcomponents here
const declaredComponents = [];

class TrackPanelComponent extends Component{
    
    static tagName = "app-track-panel";
    
    constructor(){
        super();
        this.template = "./track-panel/track-panel-component.html";
        this.style="./track-panel/track-panel-component.scss";
        this.tracks = [];
        this.timelineScale = 1000/60;
        this.playedSounds = [];
        this.needle = {
            header:null,
            body:null
        };

        this.controller = null;

        this.declaredComponents = declaredComponents;
    }

    onInit(){
        this.loadChildrenComponents().then(() => this.setEvents());
    }

    /** Esta função inicializa os eventos do componente */
    setEvents(){
        this.needle.header = this.componentElement.querySelector("[needleHead]");
        this.needle.body = this.componentElement.querySelector("[needleBody]");
        this.tracksElement = this.componentElement.querySelector("[tracks]");
        this.timeline = this.componentElement.querySelector("[timeline]");
        this.counterElement = this.componentElement.querySelector("[counter]");
        this.tracksElement.onscroll = (event) => {
            this.componentElement.querySelector("[controls]").scrollTo(0, event.target.scrollTop);
            this.componentElement.querySelector("[tracksHeader]").scrollTo(event.target.scrollLeft, 0);
        };
        this.tracksElement.onmouseleave = (event) => {
            mousePosition.innerText = `00h 00m 00s 000ms`;
        };
        this.tracksElement.ondragleave = (event) => {
            mousePosition.innerText = `00h 00m 00s 000ms`;
        };
        this.tracksElement.ondragover = (event) => { this.getMousePosition(event); };
        this.tracksElement.onmousemove = (event) => { this.getMousePosition(event); };

        let mousePosition = this.componentElement.querySelector("[mousePosition]");
        mousePosition.innerText = `00h 00m 00s 000ms`;

        window.dragAndDrop.subscribe("drop",(result) => {
            let tracks = Array.from(this.componentElement.querySelectorAll("[track]"));
            let trackIndex = tracks.indexOf(result.to);
            if(trackIndex >= 0){
                let index = result.data;
                let audio = window.loadedSounds[index];
                let file = audio.file;
                // cria o leitor de arquivo
                let fileReader = new FileReader();

                // função que é executada após a leitura do arquivo
                fileReader.onload = (e) => {

                    let audio = document.createElement('audio');
                    audio.setAttribute("preload","auto");
                    audio.src = e.target.result;
                    audio["file"] = file;
                    audio.name = file.name;
                    audio.addEventListener('loadedmetadata', () => {
                        let sound = this.createSound(audio, {
                            position: result.event.offsetX
                        });
                        this.addSoundOnTrack(sound, this.tracks[trackIndex]);
                    },false);
                };

                // função que é executada caso ocorra algum erro de leitura
                fileReader.onerror = (error) => {
                    reject(error);
                };

                // iniciamos a leitura do arquivo em modo "Data URL"
                fileReader.readAsDataURL(file);
            }
        });
        
        let addTrackButton = this.componentElement.querySelector("[addTrackButton]");
        addTrackButton.onclick = () => {
            this.addTrack();
        };

        this.initDragEvents();
        this.controller = new TimelineController(this);

        this.addTrack();
        this.renderTimeline();

    }

    initDragEvents(){
        this.mouse = {
            event:null, 
            actions:[],
            subscribe: (action) => {
                let result = action;
                if(action != null && typeof action == "function" && !this.mouse.actions.includes(action)){
                    this.mouse.actions.push(action);
                }else{
                    result = null;
                }
                return result;
            },
            unsubscribe: (action) => {
                if(action != null && typeof action == "function" && this.mouse.actions.includes(action)){
                    this.mouse.actions.splice(this.mouse.actions.indexOf(action), 1);
                }
            }
        };

        window.onmousemove = (event) => {
            this.mouse.event = event;
            for(let action of this.mouse.actions){
                action(event);
            }
        }
        window.onmouseup = (event) => {
            this.mouse.event = event;
            for(let action of this.mouse.actions){
                action(event);
            }
        }
        window.onmousedown = (event) => {
            this.mouse.event = event;
            for(let action of this.mouse.actions){
                action(event);
            }
        }
    }

    getMousePosition(event){
        let mousePosition = this.componentElement.querySelector("[mousePosition]");
        
        let position = this.tracksElement.scrollLeft + event.offsetX;
        if(event.target != this.tracksElement && event.target.classList.contains("track-sound"))
            position += parseFloat(event.target.style.left.replace("px",""));

        let miliseconds = position*this.timelineScale;
        let seconds = (miliseconds/1000 > 1)?  Math.floor(miliseconds/1000) : 0;
        let minutes = (seconds/60 > 1)? Math.floor(seconds/60) : 0;
        let hours = (minutes/60 > 1)? Math.floor(minutes/60) : 0;
        
        if(hours > 0) minutes = minutes - hours*60;
        if(minutes > 0) seconds = seconds - minutes*60;
        if(seconds > 0) miliseconds = miliseconds - seconds*1000;

        hours = (hours < 10)?`0${hours}`:hours;
        minutes = (minutes < 10)?`0${minutes}`:minutes;
        seconds = (seconds < 10)?`0${seconds}`:seconds;
        miliseconds = miliseconds.toFixed(0);
        if(miliseconds < 10){
            miliseconds = `00${miliseconds}`;
        }else if(miliseconds < 100){
            miliseconds = `0${miliseconds}`;
        }
        mousePosition.innerText = `${hours}h ${minutes}m ${seconds}s ${miliseconds}ms`;
    }

    /** Esta função cria uma nova trilha (track) e a insere na tela */
    addTrack(){
        let trackControl = document.createElement("div");
        trackControl.classList.add("track-control");
        trackControl.innerHTML = `
            <div class="track-title noselect">Nome da track</div>
            <div class="w-100 d-flex flex-row py-1 px-2">
                <i button class="bi bi-volume-off-fill mr-2"></i>
                <i button class="bi bi-volume-mute mr-2"></i>
                <i button class="bi bi-headphones em-09"></i>
            </div>`;

        this.componentElement.querySelector("[controls]").append(trackControl);
        let element = document.createElement("div");
        element.setAttribute("track",null);
        
        let timelineWidth = this.timeline.style.width;
        if(timelineWidth != null)
            element.style.width = `${(parseFloat(timelineWidth.replace("px","")) - 17)}px`;
        else
            element.style.width = '0px';
            
        this.componentElement.querySelector("[tracks]").append(element);
        trackControl.trackElement = element;

        let track = {
            index:this.tracks.length + 1,
            element:element,
            controlElement:trackControl,
            _duration:0,
            sounds:[],
            sortSounds:() => track.sounds.sort((a,b) => (a.startAt - b.startAt))
        }

        this.tracks.push(track);
        window.dragAndDrop.initEvents();
        this.needle.body.style.height = `${this.tracks.length * 49}px`;
        this.renderTrackSounds(track);
    }

    /** Esta função adiciona um elemento de audio (soound) em uma trilha (track) existente */
    addSoundOnTrack(sound, track){
        sound.index = Array.from(track.element.children).length;
        track.sounds.push(sound);
        track.element.append(sound.element);
        sound.track = track;
        this.renderTrackSounds(track);
    }

    /** Esta função cria um novo elemento de audio (soound) com base em um objeto do tipo "Audio" */
    createSound(audio, options=null){
        let position = (options?.position)?options?.position:null;
        let element = document.createElement("div");
        element.classList.add("track-sound");
        element.innerHTML = `<span class="sound-title"></span></div>`;
        let sound = new SoundController(audio, element, this);
        sound.startAt = position*this.timelineScale;
        return sound;
    }

    /** Esta função ajusta uma trilha (track) e seus elementos de som (sounds) na tela */
    renderTrackSounds(track){
        let trackDuration = 0;
        let trackWidth = track.element.style.width;
        // armazena a largura da trilha se tiver
        if(trackWidth != null && trackWidth.trim() != ""){
            trackWidth = parseFloat(trackWidth.replace("px",""));
            track._duration = trackWidth*this.timelineScale;
        }else{
            track.element.style.width = `0px`;
            track._duration = 0;
            trackWidth = 0;
        }

        // ordena os sons da trilha por tempo de reprodução e
        // os percorre ajustando suas laguras e posições
        track.sortSounds().forEach(sound => {
            let audio = sound.audio;
            let width = (audio.duration*1000)/this.timelineScale;
            let left = sound.startAt/this.timelineScale;
            let size = left + width;
            let element = sound.element;

            element.style.width = `${width}px`;
            element.style.left = `${sound.startAt/this.timelineScale}px`;

            // armazena o maior tempo utilizado na trilha
            if( size > trackDuration)
                trackDuration = size;

        });
        // ajusta o tamanho da trilha
        if(trackWidth < trackDuration || (this.controller.endCompositionAt/this.timelineScale) < trackDuration){
            track.element.style.width = `${trackDuration}px`;
            track._duration = trackDuration*this.timelineScale;
            this.renderTimeline(track);
        }
        
        return trackDuration;
    }

    /** Esta função ajusta e configura a timeline na tela e as durações de cada trilha (tracks) na tela */
    renderTimeline(trackExclude = null){
        let timelineSize = 0;
        if(trackExclude != null){
            this.timeline.style.width = trackExclude.element.style.width;
            timelineSize = trackExclude._duration/this.timelineScale;
        }
        for(let track of this.tracks){
            if(trackExclude == null || trackExclude != track){
                let size = this.renderTrackSounds(track, false);
                if(size > timelineSize)
                    timelineSize = size;
            }
        }
        this.controller.endCompositionAt = (timelineSize * this.timelineScale);
        
        if(this.timeline.clientWidth > timelineSize)
            timelineSize = this.timeline.clientWidth;
        
        for(let track of this.tracks){
            if(trackExclude == null || trackExclude != track)
                track.element.style.width = `${timelineSize}px`;
        }
        this.timeline.style.width = `${timelineSize + 17}px`;

        let totalSeconds = Math.ceil(timelineSize * this.timelineScale);
        this.buildTimelineLabels(totalSeconds);
    }

    buildTimelineLabels(miliseconds=0){
        let seconds = miliseconds/1000;
        if(seconds < 60) seconds = 60;
        let timelineLabels = "";
        for(let second = 0; second <= seconds; second++){
            let label = `${((second < 10)?'0':'')}${second}:00`;
            if(second == 0) label = "";
            timelineLabels += `<span class="noselect" style="left:${(second*1000)/this.timelineScale}px;"><span>${label}</span></span>`;
        }
        this.timeline.innerHTML = timelineLabels;
    }
}

export default TrackPanelComponent;
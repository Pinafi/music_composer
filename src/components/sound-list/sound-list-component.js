import Component from "../../models/component.js";
import SoundListItemComponent from "./sound-list-item/sound-list-item-component.js";

// declare subcomponents here
const declaredComponents = [
    SoundListItemComponent
];

class SoundListComponent extends Component{
    
    static tagName = "app-sound-list";

    constructor(){
        super();
        this.template = "./sound-list/sound-list-component.html";
        this.style="./sound-list/sound-list-component.scss";

        this.declaredComponents = declaredComponents;
        this.audio = null;
    }

    onInit(){
        this.setEvents();
    }

    /** Esta função inicializa os eventos do componente */
    setEvents(){
        let addSoundButton = this.componentElement.querySelector("[addSoundButton]");
        addSoundButton.onclick = () => {
            this.addSound();
        };
    }

    /** Esta função permite ao usuário adicionar novos sons à lista de sons */
    addSound(){
        // criamos um input para auxiliar o usuário na seleção dos arquivos
        let fileSelector = document.createElement("input");

        // lista de extenções de audio permitidas
        let fileTypes = [
            "audio/mpeg",
            "audio/mp4",
            "audio/wav"
        ];

        // atribuimos ao input o tipo "file"
        fileSelector.type = "file";

        // habilitamos a seleção de um ou mais arquivos
        fileSelector.multiple = true;

        // função que será executada após a seleção dos arquivos
        fileSelector.onchange = (event) => {
            let files = event.target.files;
            let readers = [];

            // cria e prepara um leitor para cada arquivo de audio selecionado
            for(let file of files){
                if(fileTypes.includes(file.type.toLowerCase())){
                    readers.push( new Promise( (resolve,reject) => {

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
                                resolve(audio);
                            },false);
                        };
                        
                        // função que é executada caso ocorra algum erro de leitura
                        fileReader.onerror = (error) => {
                            reject(error);
                        };

                        // iniciamos a leitura do arquivo em modo "Data URL"
                        fileReader.readAsDataURL(file);
                    }));
                }
            }

            // executa a leitura dos arquivos de forma asyncrona e conjunta
            // e espera todos terminarem de serem lidos
            Promise.all(readers).then( (audios) => {
                // com os audios prontos, os adicionamos na lista de sons
                window.loadedSounds = window.loadedSounds.concat(audios);
                // recarregamos os subcomponentes
                this.updateSoundList();
            }).catch(error => {
                console.log(error);
            });
        }

        // disparamos o click automatico no elemento 
        // para que seja aberta a janela de seleção 
        // de arquivos
        fileSelector.click();
    }

    /** Esta função reproduz o audio passado como parametro. */
    playSound(audio){
        // se o audio a ser reproduzido for diferente do anterior reproduzido, 
        // o substituiremos executando a função "beforeRemoved" que foi definida previamente
        if(this.audio != null && !Object.is(this.audio,audio) && typeof this.audio.beforeRemove === "function"){
            this.audio.beforeRemove();
        }
        this.audio = audio;

        //reproduzimos o novo audio
        this.audio.play();
    }

    /** Esta função pausa a reprodução do audio */
    stopSound(){
        this.audio.pause();
    }

    /** Recarrega os componentes filhos relacionados com a lista de sons */
    updateSoundList(){
        // pegamos o elemento html correspondente à lista de sons adicionados
        let soundList = this.componentElement.querySelector("[soundList]");

        // adicionaremos no html desse componente uma tag "filha" para cada audio adicionado
        let index = soundList.children.length;
        for(let i = index; i < window.loadedSounds.length; i++){
            let tag = document.createElement("app-sound-list-item");
            tag.setAttribute("draggable",true);
            tag.setAttribute("drop-target","[track]");
            tag.setAttribute("drag-data",index);
            soundList.append(tag);
        }
       
        // recarregaremos os componentes filhos do nosso componente
        this.loadChildrenComponents([SoundListItemComponent]).then((childrens) => {
            childrens[SoundListItemComponent.tagName].forEach((child, index) => {
                if(child.audio == null){
                    // inicializaremos os subcomponentes correspondentes com os audios recem adicionados
                    child.audio = window.loadedSounds[index];
                    child.setEvents();
                }
            })
        });
    }
}

export default SoundListComponent;
import Component from "../../models/component.js";
import SoundListComponent from '../sound-list/sound-list-component.js';

// declare subcomponents here
const declaredComponents = [
    SoundListComponent
];

class SideBarComponent extends Component{
    
    static tagName = "app-side-bar";

    constructor(){
        super();
        this.template = "./side-bar/side-bar-component.html";
        this.style="./side-bar/side-bar-component.scss";

        this.declaredComponents = declaredComponents;
    }

    onInit(){
        this.loadChildrenComponents().then(() => this.setEvents());
    }

    /** Esta função inicializa os eventos do componente */
    setEvents(){
        let buttons = this.componentElement.querySelectorAll("[sidebarButton]");
        buttons.forEach(button => {
            button.onclick = () => {
                this.componentElement.querySelectorAll("[barContent]").forEach((content) => {
                    content.style.display = "none";
                });
                buttons.forEach(b => b.classList.remove("active"));
                this.componentElement.querySelector(button.getAttribute("target")).style.display = "flex";
                this.componentElement.querySelector(`[sidebarButton][target="${button.getAttribute("target")}"]`).classList.add("active");
            };
        })
    }
}

export default SideBarComponent;
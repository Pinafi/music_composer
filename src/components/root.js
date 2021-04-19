
import Component from "../models/component.js";
import SoundListComponent  from "./sound-list/sound-list-component.js";
import TrackPanelComponent from "./track-panel/track-panel-component.js";

// declare subcomponents here
const declaredComponents = [
    SoundListComponent,
    TrackPanelComponent
];

class RootComponent extends Component{

    static tagName = "app-root";

    constructor(){
        super();

        this.template = "./root.html";
        this.style="./root.scss";

        this.loadTemplate(document.querySelector(RootComponent.tagName)).then(() => {
            this.componentElement = document;
            this.declaredComponents = declaredComponents;
            this.loadChildrenComponents();
        });
    }
}

const root = new RootComponent();
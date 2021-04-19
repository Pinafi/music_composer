import DragAndDrop from "./drag-and-drop.js";

class Component{

    template = "";
    style="";
    componentElement;
    parentComponent;
    declaredComponents=[];
    childrenComponents={};
    
    constructor(){}

    /** Carrega o template html do componente */
    loadTemplate(tag){
        this.componentElement = tag;
        return fetch(`${__dirname}/components/${this.template}`).then((response) => {
            return response.text();
        }).then((html) => {
            this.componentElement.innerHTML = html;
            if(this.onInit != undefined && typeof this.onInit === 'function')
                this.onInit();
            return;
        }).catch((error) => {
            console.log(error);
        });
    }

    /** Carrega os subcomponentes do componente */
    loadChildrenComponents(componentsToLoad=[]){
        return new Promise((resolve, reject) => {
            let loadedComponents = [];
            for(let component of this.declaredComponents){
                if(
                    !Array.isArray(componentsToLoad) ||
                    (Array.isArray(componentsToLoad) && !componentsToLoad.length) ||
                    (Array.isArray(componentsToLoad) && componentsToLoad.length && componentsToLoad.includes(component))
                ){
                    let tags = this.componentElement.querySelectorAll(component.tagName);
                    if(tags.length){
                        for(let tag of tags){
                            if(!tag.children.length){
                                if(this.childrenComponents[component.tagName] == undefined)
                                    this.childrenComponents[component.tagName] = [];
                                let object = new component();
                                object.parentComponent = this;
                                this.childrenComponents[component.tagName].push(object);
                                loadedComponents.push(object.loadTemplate(tag));
                            }
                        }
                    }
                }
            }
            Promise.all(loadedComponents).then(() => {

                // cria e inicializa o gerenciamento de eventos "arrastar e soltar"
                if(window.dragAndDrop == null)
                    window.dragAndDrop = new DragAndDrop();
                else // reinicializa o gerenciamento de eventos "arrastar e soltar"
                    window.dragAndDrop.initEvents();
                
                resolve(this.childrenComponents);
                
            }).catch((error) => {
                reject(error);
            })
        });
    }
}

export default Component;
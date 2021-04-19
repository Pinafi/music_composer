class DragAndDrop{
    constructor(){
        this.currentElement = null;
        this.initEvents();
        this.listeners = [];
    }

    subscribe(type,listener){
        switch(type){
            case "drop":
                if(!this.listeners.includes(listener))
                    this.listeners.push(listener);
                break;
        }
    }

    initEvents(){
        document.querySelectorAll(`*[draggable]`).forEach(element => {
            let target = element.getAttribute("drop-target");
            if(target != null && target.trim() != ""){
                let targets = document.querySelectorAll(target);

                let dragListener = (event) => {
                    let data = "";
                    if(element.hasAttribute("drag-data"))
                        data = element.getAttribute("drag-data");
                    event.dataTransfer.setDragImage(element, 0, 0);
                    event.dataTransfer.setData("text/plain", data);
                };

                let dropListener = (event) => {
                    event.preventDefault();
                    let data = event.dataTransfer.getData("text");
                    this.listeners.forEach(listener => listener({
                        data:data,
                        from:element.parentElement,
                        to:event.target,
                        element:element,
                        event:event
                    }));
                }

                if(element.ondragstart == null)
                    element.ondragstart = (event) => dragListener(event);
    
                targets.forEach(target => {
                    if(target.ondragover == null)
                        target.ondragover = (event) => event.preventDefault();
                })
    
                targets.forEach(target => {
                    if(target.ondrop == null)
                        target.ondrop = (event) => dropListener(event);
                });
            }
        })
    }

    removeListeners(){
        window.onmouseup = null;
        window.onmousemove = null;
        this.currentElement = null;
    }
}

export default DragAndDrop;
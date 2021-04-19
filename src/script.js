window.loadedSounds = [];
var defaultTheme = "light";

fetch("./themes.json").then(response => response.json()).then(themes => {
    window.theme = themes[defaultTheme];
    setTheme();
}).catch((error) => {
    console.log(error);
});

function setTheme(){
    let theme = window.theme;
    let css = "";
    for(let key of Object.keys(window.theme)){
        let prop = theme[key];

        if( Array.isArray(prop) ){
            css += prop.map((value, index) => `--${key}${(index)?`-${index}`:''}:${value};`).join("");
        }else{
            css += `--${key}:${prop};`;
        }
    }
    let styleTheme = document.querySelector("#theme");
    if(styleTheme == null){
        styleTheme = document.createElement("style");
        styleTheme.id = "theme";
        document.querySelector("body").appendChild(styleTheme);
    }
    styleTheme.innerHTML = `
        :root{
            ${css}
        }
    `;
}
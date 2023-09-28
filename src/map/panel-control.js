import cssString from "bundle-text:./panel-control.scss";
let style = document.createElement("style");
style.textContent = cssString;
document.head.appendChild(style);

export const panelControl = (available) => {
  let html = `<div class="inner"><h1 class="panel-control-heading">Info</h1></div>`;
  return html;
};

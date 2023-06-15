import cssString from "bundle-text:./legend-control.scss";
let style = document.createElement("style");
style.textContent = cssString;
document.head.appendChild(style);

export const legendControl = (available) => {
  let html = `<div class="inner"><ul class="toggleable hide">`;
  available.forEach((item) => {
    html += `<li>
                <label class="checkbox">
                    <input 
                        class="on-change-update-map-layer" 
                        type="checkbox" 
                        id="${item}" 
                        name="${item}" 
                        value="${item}" 
                        checked="checked" 
                    />
                        ${item}
                </label>
            </li>`;
  });
  html += `</ul><h1 class="on-click-toggle-ul">Owner Types</h1></div>`;
  return html;
};

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}
//let icon = '<link rel="icon" type="image/png" href="%l" />';
let options = ["img/blue.png", "img/red.png"];
let iconNode = document.createElement("link");
iconNode.rel = "icon";
iconNode.type = "image/png";
iconNode.href = options.random();
document.getElementsByTagName("head")[0].appendChild(iconNode);
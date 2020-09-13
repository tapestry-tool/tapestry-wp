// str is evaluated to detect support of ES6
// originally by user DaBs: https://gist.github.com/DaBs/89ccc2ffd1d435efdacff05248514f38
var str =
  'class ಠ_ಠ extends Array {constructor(j = "a", ...c) {const q = (({u: e}) => {return { [`s${c}`]: Symbol(j) };})({});super(j, q, ...c);}}' +
  'new Promise((f) => {const a = function* (){return "\u{20BB7}".match(/./u)[0].length === 2 || true;};for (let vre of a()) {' +
  "const [uw, as, he, re] = [new Set(), new WeakSet(), new Map(), new WeakMap()];break;}f(new Proxy({}, {get: (han, h) => h in han ? han[h] " +
  ': "42".repeat(0o10)}));}).then(bi => new ಠ_ಠ(bi.rd));';

try {
  eval(str);
} catch (e) {

  var div = document.createElement("div");
  div.id = "old-browser";

  var heading = document.createElement("h2");
  var headingText = document.createTextNode(
    "Your browser is not supported."
  );
  heading.appendChild(headingText);
  div.appendChild(heading);

  var message = document.createElement("p");
  var messageText = document.createTextNode(
    "Tapestry uses modern web technologies that require newer browsers. Please update your browser to use the Tapestry Tool. These are some free and secure web browsers you may download now:"
  );
  message.appendChild(messageText);
  div.appendChild(message);

  var css = document.createElement("style");
  css.innerText = "#old-browser { margin: 25vh auto; padding: 4em; border-radius: 1em; max-width: 900px; box-shadow: 5px 5px 40px -15px; text-align: center; } #old-browser h2 { margin: 0.5em; } #old-browser p { margin: 2em 0; } #old-browser ul { display: inline-flex; } #old-browser ul li { margin: 0 2em; list-style-type: none; }"
  div.appendChild(css);

  var list = document.createElement("ul");
  var browsers = [
    ["Mozilla Firefox", "https://www.mozilla.org/en-CA/firefox/new/"],
    ["Google Chrome", "https://www.google.ca/chrome/"],
    ["Microsoft Edge", "https://www.microsoft.com/en-us/edge"],
  ];
  for (let i = 0; i < browsers.length; i++) {
    var browserData = browsers[i];
    var name = browserData[0];
    var link = browserData[1];

    var listItem = document.createElement("li");
    var anchor = document.createElement("a");
    anchor.href = link;
    anchor.target = "_blank";
    anchor.appendChild(document.createTextNode(name));
    listItem.appendChild(anchor);
    list.appendChild(listItem);
  }
  div.appendChild(list);

  window.addEventListener('DOMContentLoaded', (event) => {  
    var body = document.getElementById("content");
    if (!body) {
      body = document.createElement("body");
      document.body = body;
    }
    body.innerHTML = '';
    body.appendChild(div);
  });

}

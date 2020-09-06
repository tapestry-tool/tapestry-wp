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
  var message = document.createTextNode(
    "To use the Tapestry Tool, please update your browser. One of the following browsers would work:"
  );
  div.appendChild(message);

  var browsers = [
    ["Firefox", "https://www.mozilla.org/en-CA/firefox/new/"],
    ["Google Chrome", "https://www.google.ca/chrome/"],
    ["Microsoft Edge", "https://www.microsoft.com/en-us/edge"],
  ];

  var list = document.createElement("ul");
  for (let i = 0; i < browsers.length; i++) {
    var browserData = browsers[i];
    var name = browserData[0];
    var link = browserData[1];

    var listItem = document.createElement("li");
    var anchor = document.createElement("a");
    anchor.href = link;
    anchor.appendChild(document.createTextNode(name));
    listItem.appendChild(anchor);
    list.appendChild(listItem);
  }

  var body = document.createElement("body");
  body.appendChild(div);
  body.appendChild(list);
  document.body = body;
}

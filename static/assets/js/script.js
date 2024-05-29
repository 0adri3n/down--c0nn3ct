// Initialize Ace editor

var editor = ace.edit("editor");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/markdown");

// Initialize Marked object to render editor content

const { markedHighlight } = globalThis.markedHighlight;
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

const renderer = new marked.Renderer();
let originParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = (text) => {
  const blockRegex = /\$\$[^\$]*\$\$/g;
  const inlineRegex = /\$[^\$]*\$/g;
  let blockExprArray = text.match(blockRegex);
  let inlineExprArray = text.match(inlineRegex);
  for (let i in blockExprArray) {
    const expr = blockExprArray[i];
    const result = renderMathsExpression(expr);
    text = text.replace(expr, result);
  }
  for (let i in inlineExprArray) {
    const expr = inlineExprArray[i];
    const result = renderMathsExpression(expr);
    text = text.replace(expr, result);
  }
  return originParagraph(text);
};
function renderMathsExpression(expr) {
  if (expr[0] === "$" && expr[expr.length - 1] === "$") {
    let displayStyle = false;
    expr = expr.substr(1, expr.length - 2);
    if (expr[0] === "$" && expr[expr.length - 1] === "$") {
      displayStyle = true;
      expr = expr.substr(1, expr.length - 2);
    }
    let html = null;
    try {
      html = katex.renderToString(expr);
    } catch (e) {
      console.log(e);
    }
    if (displayStyle && html) {
      html = html.replace(
        /class="katex"/g,
        'class="katex katex-block" style="display: block;"'
      );
    }
    return html;
  } else {
    return null;
  }
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
  langPrefix: "hljs language-",
  highlight(code, lang, info) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
});

function renderMD() {
  var markdownContent = editor.getValue();
  document.getElementById("output").innerHTML = marked.parse(markdownContent);
}

renderMD();
editor.getSession().on("change", renderMD);

window.addEventListener("load", renderMD);

// Toggle mode (phone only)

var isPreviewMode = false;

function togglePreview() {
  var editorDiv = document.getElementById("editor");
  var outputDiv = document.getElementById("output");
  var eyeimgDiv = document.getElementById("eyeimg");

  if (!isPreviewMode) {
    outputDiv.style.transform = "translateX(-100%)";
    editorDiv.style.display = "none";
    eyeimgDiv.src = "static/assets/img/eye.png";
  } else {
    editorDiv.style.display = "block";
    outputDiv.style.transform = "translateX(0%)";
    eyeimgDiv.src = "static/assets/img/eyeclose.png";
  }

  isPreviewMode = !isPreviewMode;
  renderMD();
}

document
  .getElementById("previewToggle")
  .addEventListener("click", togglePreview);


// Replace elements if preview toggled while phone screen

if (matchMedia) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}

function WidthChange(mq) {
  if (mq.matches && isPreviewMode) {
    var outputDiv = document.getElementById("output");
    var editorDiv = document.getElementById("editor");
    var eyeimgDiv = document.getElementById("eyeimg");
    outputDiv.style.transform = "translateX(0%)";
    editorDiv.style.display = "block";
    eyeimgDiv.src = "static/assets/img/eyeclose.png";
  }
}

// Copy function

document.getElementById("copyButton").addEventListener("click", function () {
  var outputContent = editor.getValue();

  navigator.clipboard.writeText(outputContent).then(
    function () {
      alert("MarkDown content copied.");
    },
    function (err) {
      console.error("Error when trying to copy content : ", err);
    }
  );
});


// Download function

document.getElementById("dlButton").addEventListener("click", function () {
  var markdownContent = editor.getValue(); 
  var blob = new Blob([markdownContent], {
    type: "text/markdown;charset=utf-8",
  }); 

  
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "document.md";
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);

});

// Import function
document.getElementById("importButton").addEventListener("click", function() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".md";

    input.onchange = function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var content = e.target.result;
                editor.setValue(content);
                renderMD();  // Update the rendered Markdown
            };
            reader.readAsText(file);
        }
    };

    input.click();
});

// Confirm before quit
let isSafeToLeave = false;
window.addEventListener("beforeunload", function (e) {
  if (!isSafeToLeave) {
    var confirmationMessage =
      "Are you sure you want to leave this page? Changes you made may not be saved.";
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  }
});


// Bypass confirmation if Save or Open with H4sh Tech

function bypassConf() {
  isSafeToLeave = true;
  setTimeout(() => {
    isSafeToLeave = false;
  }, 1000);
}

// Saving with H4sh Tech
function saveContent() {
  
  bypassConf();

  var markdownContent = editor.getValue(); 
  document.getElementById("editor_content").value = markdownContent;
  document.getElementById("saveForm").submit();

}

// Open from H4sh Tech
function openContent() {
  const hash = prompt("Enter the hash linked to the file :");
  if (hash) {
    bypassConf();

    document.getElementById("hash_value").value = hash;
    document.getElementById("openForm").submit();
    
  }
}

// PDF Export
function addScript() {
  var script = document.createElement('script');
  script.type = 'application/javascript';
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js";
  document.head.appendChild(script);

  var script = document.createElement('script');
  script.type = 'application/javascript';
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  document.head.appendChild(script);

  var script = document.createElement('script');
  script.type = 'application/javascript';
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  document.head.appendChild(script);

}
window.addEventListener("load", addScript);



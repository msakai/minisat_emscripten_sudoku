function focusAndSelect(input) {
    input.focus();
    setTimeout(function(){ input.select(); }, 0)
}

var inputs;
var outputs;

function getInputString() {
    var result = "";
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var c = inputs[i][j].val();
            if (c.length == 1)
                result += c;
            else
                result += "_";
        }
    }
    return result;
}

function setInputString(str) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var c = str.charAt(i*9+j);
            if (c.match(/\d/))
                inputs[i][j].val(c)
            else
                inputs[i][j].val("")
        }
    }
}

function clearInput() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            inputs[i][j].val("")
        }
    }
}

function renderOutput(inputStr, outputStr) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var e = outputs[i][j];
            e.text(outputStr.charAt(i*9+j));
            if (inputStr.charAt(i*9+j).match(/\d/)) {
                e.addClass("given");
            } else {
                e.removeClass("given");
            }
        }
    }
}

function clearOutput() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            outputs[i][j].text("")
        }
    }
}

var sampleInput = 
    "1__6__8__" +
    "_2__7__9_" +
    "__3__8__1" +
    "2__4__9__" +
    "_3__5__1_" +
    "__4__6__2" +
    "3__5__7__" +
    "_4__6__8_" +
    "__5__7__4";

var sampleOutput = 
    "179632845" +
    "428175693" +
    "563948271" +
    "257413968" +
    "836259417" +
    "914786352" +
    "381594726" +
    "742361589" +
    "695827134";

$(document).ready(function(){
    inputs  = new Array(9);
    outputs = new Array(9);

    var rows = document.getElementById("input").getElementsByTagName("tr");
    for (var i = 0; i < 9; i++) {
        var xs = rows[i].getElementsByTagName("input");
        inputs[i] = new Array(9);
        for (var j = 0; j < 9; j++) {
            inputs[i][j] = $(xs[j]);
        }
    }

    var rows = document.getElementById("output").getElementsByTagName("tr");
    for (var i = 0; i < 9; i++) {
        var xs = rows[i].getElementsByTagName("td");
        outputs[i] = new Array(9);
        for (var j = 0; j < 9; j++) {
            outputs[i][j] = $(xs[j]);
        }
    }
    
    $("#solve").click(function() {
	htmlstuff = Module.cwrap('htmlstuff_c', 'string', ['string']);

	var input_str = getInputString();
	console.log(input_str)

	var output_str = htmlstuff(input_str);
	console.log(output_str);

	if (output_str != "") {
	    renderOutput(input_str, output_str);
	} else {
	    clearOutput();
	    alert("NO SOLUTION");
	}
    })


    $("#clear").click(function() {
	clearInput();
	clearOutput();
    })

    $("#load-sample").click(function() {
        setInputString(sampleInput)
    })

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            (function(i,j) {
                inputs[i][j].click(function(){
                    focusAndSelect(inputs[i][j]);
                });

                inputs[i][j].keydown(function(e) {
                    // 37: ←
                    // 38: ↑
                    // 39: →
                    // 40: ↓
                    if (e.which==37 && 0 < j) {
                        focusAndSelect(inputs[i][j-1])
                    } else if (e.which==38 && 0 < i) {
                        focusAndSelect(inputs[i-1][j])
                    } else if (e.which==39 && j < 8) {
                        focusAndSelect(inputs[i][j+1])
                    } else if (e.which==40 && i < 8) {
                        focusAndSelect(inputs[i+1][j])
                    }
                })
            })(i,j)
        }
    }
});

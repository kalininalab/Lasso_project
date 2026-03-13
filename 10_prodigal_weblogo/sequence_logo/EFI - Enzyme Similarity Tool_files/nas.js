
function checkSequence(str) {
    str = str.replace(/^>.*?[\r\n]/, "");
    str = str.toUpperCase().replace(/[\r\n \t]/gm, "").replace(/\\(N|R)/g, "");
    var nCount = 0;
    for (var i = 0; i < str.length; i++) {
        if (str[i] == "U")
            return false;
        else if (str[i] != "A" && str[i] != "C" && str[i] != "G" && str[i] != "T" && str[i] != "N" && str[i] != "Z")
            return true;
    }
    return false;
}


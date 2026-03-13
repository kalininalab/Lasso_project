

function InputIds() {
    this.family = "";
    this.unirefCb = "";
    this.unirefVer = "";
    this.fraction = "";
    this.dbVer = "";
}

function OutputIds() {
    this.container = "";
    this.count = "";
    this.warningMsg = "";
}

function getInputIds(opt) {
    var ids = new InputIds();
    ids.family = "families-input-" + opt;
    ids.unirefCb = "use-uniref-" + opt;
    ids.unirefVer = "uniref-ver-" + opt;
    ids.fraction = "fraction-" + opt;
    ids.dbVer = "db-mod-" + opt;
    return ids;
}

function getOutputIds(opt) {
    var ids = new OutputIds();
    ids.container = "family-size-container-" + opt;
    ids.count = "family-count-table-" + opt;
    ids.warningMsg = "message-" + opt;
    return ids;
}


function setupFamilyInputs(options) {
    var idData = {};
    for (var i = 0; i < options.length; i++) {
        var optionName = options[i];
        var inputIds = getInputIds(optionName);
        var outputIds = getOutputIds(optionName);
        idData[optionName] = {input: inputIds, output: outputIds};
    }
    return idData;
}


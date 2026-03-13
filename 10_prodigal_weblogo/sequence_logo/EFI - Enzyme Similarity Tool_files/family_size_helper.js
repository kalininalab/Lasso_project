
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}



function FamilySizeHelper(scriptPath) {
    this.options = {};
    this.scriptPath = scriptPath;
    return this;
}


FamilySizeHelper.prototype.setupFamilyInputs = function(idData) {
    var keys = Object.keys(idData);
    keys.forEach((key, index) => {
        this.setupFamilyInput(key, idData[key].input, idData[key].output);
    });
}

FamilySizeHelper.prototype.setupFamilyInput = function(optionName, inputIds, outputIds) {
    this.options[optionName] = {
        type: optionName,
        inputIds: inputIds,
        outputIds: outputIds,
        sizeData: {},
        autoCheckUniRef: false,
        validated: false,
    };

    var that = this;
    //familyInputId, containerOutputId, countOutputId, unirefCbId, unirefVerId, fractionId, dbVerId) {
    $("#" + inputIds.family).on("input", function() {
        $("#" + inputIds.fraction).val(1);
        $("#" + inputIds.unirefCb).prop("checked", false);
        that.checkFamilyInput(optionName);
    });
    $("#" + inputIds.fraction).on("input", function() {
        $("#" + inputIds.unirefCb).prop("checked", false);
        that.checkFamilyInput(optionName);
    });
    $("#" + inputIds.dbVer).on("input", function() { that.checkFamilyInput(optionName); });
    $("#" + inputIds.unirefCb).change(function() {
        $("#" + inputIds.fraction).val(1);
        that.checkFamilyInput(optionName);
    });
    $("#" + inputIds.unirefVer).change(function() {
        $("#" + inputIds.fraction).val(1);
        if ($("#" + inputIds.unirefCb).prop("checked") == false) {
            $("#" + inputIds.unirefCb).prop("checked", true);
//            $("#" + inputIds.fraction).prop("disabled", true);
        } else {
//            $("#" + inputIds.fraction).prop("disabled", false);
        }
        that.checkFamilyInput(optionName);
    });
}


FamilySizeHelper.prototype.resetInput = function(optionName) {
    var opt = this.options[optionName];
    var inputIds = opt.inputIds;
    var outputIds = opt.outputIds;

    $("#" + inputIds.family).val("");
    $("#" + inputIds.fraction).val(1);
    $("#" + inputIds.unirefCb).prop("checked", false);
    
    var container = $("#" + outputIds.container);
    container.hide();
}


FamilySizeHelper.prototype.setDisabledState = function(optionName, disabled) {
    var opt = this.options[optionName];
    var inputIds = opt.inputIds;
    var outputIds = opt.outputIds;

    $("#" + inputIds.family).prop("disabled", disabled);
    $("#" + inputIds.fraction).prop("disabled", disabled);
    $("#" + inputIds.unirefCb).prop("disabled", disabled);
}


FamilySizeHelper.prototype.checkFamilyInput = function (optionName) {
    //TODO: check validity
    var opt = this.options[optionName];
    var inputIds = opt.inputIds;
    var outputIds = opt.outputIds;

    var inputField = $("#" + inputIds.family);
    var input = inputField.val();
    var fraction = $("#" + inputIds.fraction).val();
    var dbVer = $("#" + inputIds.dbVer).val();
    var unirefVerElem = $("#" + inputIds.unirefVer);
    var unirefVer = unirefVerElem.val();
    var unirefCbElem = $("#" + inputIds.unirefCb);
    var fractionElem = $("#" + inputIds.fraction);
    var useUniref = unirefCbElem.prop("checked");
    
    var container = $("#" + outputIds.container);

    // Clear any output errors.
    $("#" + outputIds.warningMsg).text("");
    var hasInputErrorClass = inputField.hasClass("input-error");
    var hasInputWarningClass = inputField.hasClass("input-warning");
    var isUnirefCbDisabled = unirefCbElem.prop("disabled");

    var thresholdNum = 7;
    if (input.toLowerCase().startsWith("cl"))
        thresholdNum = 6;
    if (input.length < thresholdNum) {
        container.hide();
        inputField.removeClass("input-error");
        inputField.removeClass("input-warning");
        unirefCbElem.prop("disabled", false);
        unirefCbElem.prop("checked", false);
        //fractionElem.prop("disabled", false);
        unirefVerElem.val("90");
        $("#" + inputIds.unirefVer + " option").removeAttr("disabled");
        return;
    }

    var handleResponse = function(data, countOutputId) {
        console.log(data);
        if (!data || data.result == false) {
            container.hide();
            return;
        }

        var sumCounts = getFamilyCountsTableHandler(data, countOutputId);
        var resetFormStyleError = true;
        var resetFormStyleWarning = true;
        var resetUnirefCbDisabled = true;

        if (data.is_too_large) {
            if (!hasInputErrorClass)
                inputField.addClass("input-error");
            resetFormStyleError = false;
            resetUnirefCbDisabled = false;
            unirefCbElem.prop("disabled", true);
            unirefVerElem.prop("disabled", true);
        } else {
            unirefVerElem.prop("disabled", false);
        }
        
        if (!data.is_too_large && (data.is_uniref90_required || data.is_uniref50_required)) {
            resetFormStyleWarning = false;
            resetUnirefCbDisabled = false;
            if (!hasInputWarningClass) {
                inputField.addClass("input-warning");
            }
            if (!unirefCbElem.prop("checked")) {
                unirefCbElem.prop("checked", true);
//                fractionElem.prop("disabled", true);
            } else {
//                fractionElem.prop("disabled", false);
            }
            if (!isUnirefCbDisabled) {
                unirefCbElem.prop("disabled", true);
            }
            if (inputIds.unirefVer) {
                if (data.is_uniref90_required && !data.is_uniref50_required && (!useUniref || unirefVer != "50")) {
                    $("#" + inputIds.unirefVer + " option").removeAttr("disabled");
                    if (unirefVer != "90")
                        unirefVerElem.val("90");
                } else if (data.is_uniref50_required) {
                    $("#" + inputIds.unirefVer + " option[value=90]").attr("disabled", "disabled").siblings().removeAttr("disabled");
                    if (unirefVer != "50")
                        unirefVerElem.val("50");
                } else {
                    $("#" + inputIds.unirefVer + " option").removeAttr("disabled");
                }
            }
        } else {
            $("#" + inputIds.unirefVer + " option").removeAttr("disabled");
        }
        opt.sizeData = data;
        opt.validated = true;

        if (resetFormStyleError && hasInputErrorClass)
            inputField.removeClass("input-error");
        if (resetFormStyleWarning && hasInputWarningClass)
            inputField.removeClass("input-warning");
        if (resetUnirefCbDisabled && isUnirefCbDisabled)
            unirefCbElem.prop("disabled", false);

        container.show();
    };

    getFamilyCountsRaw(input, fraction, useUniref, unirefVer, outputIds.count, dbVer, handleResponse, this.scriptPath);
}


// This is called by the submit* functions upon job submission to check if the family input is valid.
// The function callback that is passed in is called if the user wishes to proceed with UniRef,
// or if UniRef is not required, called direction.
FamilySizeHelper.prototype.checkUnirefRequirement = function(option, continueSubmissionFn) {

    //TODO: check input
    var opt = this.options[option];

    var inputIds = opt.inputIds;
    var outputIds = opt.outputIds;

    var famInput = $("#" + inputIds.family).val();
    if (!famInput || famInput.length == 0) {
        continueSubmissionFn();
        return true;
    }

    if (!opt.validated) {
        alert("Something went wrong.");
        return false;
    }

    if (opt.sizeData.is_too_large) {
        $("#" + outputIds.warningMsg).text("The selected inputs are too large to process.");
        return false;
    }

    var unirefVer = $("#" + inputIds.unirefVer).val();
    var useUniref = $("#" + inputIds.unirefCb).prop("checked");

    var fraction = typeof opt.sizeData.total_compute !== "undefined" ? opt.sizeData.total_compute : 0;
    if (useUniref || opt.sizeData.is_uniref90_required || opt.sizeData.is_uniref50_required) {
        var isUnirefRequired = opt.sizeData.is_uniref90_required || opt.sizeData.is_uniref50_required;
        showUnirefRequirement(opt.sizeData.total, fraction, unirefVer, isUnirefRequired, continueSubmissionFn);
    } else {
        continueSubmissionFn();
    }

    return true;
}

FamilySizeHelper.prototype.checkUnirefRequirement2 = function(option) {

    //TODO: check input
    var opt = this.options[option];

    var inputIds = opt.inputIds;
    var outputIds = opt.outputIds;

    var famInput = $("#" + inputIds.family).val();
    if (!famInput || famInput.length == 0) {
        return true;
    }

    if (!opt.validated) {
        alert("Something went wrong.");
        return false;
    }

    if (opt.sizeData.is_too_large) {
        $("#" + outputIds.warningMsg).text("The selected inputs are too large to process.");
        return false;
    }

    var unirefVer = $("#" + inputIds.unirefVer).val();
    var useUniref = $("#" + inputIds.unirefCb).prop("checked");

    var fraction = typeof opt.sizeData.total_compute !== "undefined" ? opt.sizeData.total_compute : 0;
    var showWarningFn = true;
    if (useUniref || opt.sizeData.is_uniref90_required || opt.sizeData.is_uniref50_required) {
        var isUnirefRequired = opt.sizeData.is_uniref90_required || opt.sizeData.is_uniref50_required;
        showWarningFn = showUnirefRequirement2(opt.sizeData.total, fraction, unirefVer, isUnirefRequired);
    }

    return showWarningFn;
}


function getFamilyCountsRaw(family, fraction, useUniref, unirefVer, countOutputId, dbVer, handler, scriptPath = "get_family_counts.php") {

    if ((family.toLowerCase().startsWith("cl") && family.length == 6) || family.length >= 7) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200 && this.responseText.length > 1) {
                var data = JSON.parse(this.responseText);
                handler(data, countOutputId);
            }
        };
        family_query = family.replace(/\n/g, " ").replace(/\r/g, " ");
        var fractionParam = fraction ? "&fraction=" + fraction : "";
        var unirefParam = useUniref ? "&uniref=1" : "";
        var dbVerParam = dbVer ? "&db-ver=" + dbVer : "";
        var unirefVerParam = (useUniref && unirefVer) ? "&uniref-ver=" + unirefVer : "";
        xmlhttp.open("GET", scriptPath + "?families=" + family_query + fractionParam + unirefParam + unirefVerParam + dbVerParam, true);
        xmlhttp.send();
    }
}

function getFamilyCountsTableHandler(data, countOutputId) {

    var sumCounts = {all: 0, uniref90: 0, uniref50: 0, compute: 0};
    var table = document.getElementById(countOutputId);
    var newBody = document.createElement('tbody');

    for (famId in data.families) {
        var cellIdx = 0;
        var row = newBody.insertRow(-1);
        var familyCell = row.insertCell(cellIdx++);
        familyCell.innerHTML = famId;
        var familyNameCell = row.insertCell(cellIdx++);
        familyNameCell.innerHTML = data.families[famId].name;

        var countVal = data.families[famId].all;
        var countCell = row.insertCell(cellIdx++);
        countCell.innerHTML = commaFormatted(countVal.toString());
        countCell.style.textAlign = "right";
        sumCounts.all += parseInt(countVal);
        
        if (data.use_uniref90) {
            if (data.families[famId].uniref90) {
                countVal = data.families[famId].uniref90;
                countCell = row.insertCell(cellIdx++);
                countCell.innerHTML = commaFormatted(countVal.toString());
                countCell.style.textAlign = "right";
                sumCounts.uniref90 += parseInt(countVal);
            } else {
                countCell = row.insertCell(cellIdx++);
                countCell.innerHTML = "0";
                countCell.style.textAlign = "right";
            }
        }
        
        //if (data.use_uniref50 && typeof data.families[famId].uniref50 !== 'undefined') {
        if (typeof data.families[famId].uniref50 !== 'undefined') {
            countVal = data.families[famId].uniref50;
            countCell = row.insertCell(cellIdx++);
            countCell.innerHTML = commaFormatted(countVal.toString());
            countCell.style.textAlign = "right";
            sumCounts.uniref50 += parseInt(countVal);
        }
    }

//    if (data.use_uniref50)
//        document.getElementById(countOutputId + "-ur-hdr").innerHTML = "UniRef50 Size";
//    else if (data.use_uniref90)
//        document.getElementById(countOutputId + "-ur-hdr").innerHTML = "UniRef90 Size";

    // Insert individual totals
    var cellIdx = 0;
    var row = newBody.insertRow(-1);
    var empty = row.insertCell(cellIdx++);
    var total1 = row.insertCell(cellIdx++);
    total1.innerHTML = "Total:";
    total1.style.textAlign = "right";
    var total2 = row.insertCell(cellIdx++);
    total2.innerHTML = commaFormatted(sumCounts.all.toString());
    total2.style.textAlign = "right";
//    if (data.use_uniref90) {
        var total3 = row.insertCell(cellIdx++);
        total3.innerHTML = commaFormatted(sumCounts.uniref90.toString());
        total3.style.textAlign = "right";
//    }
//    if (data.use_uniref50) {
        var total4 = row.insertCell(cellIdx++);
        total4.innerHTML = commaFormatted(sumCounts.uniref50.toString());
        total4.style.textAlign = "right";
//    }

    // Insert computed totals (accounting for auto uniref90 and fraction)
    cellIdx = 0;
    row = newBody.insertRow(-1);
    empty = row.insertCell(cellIdx++);
    total1 = row.insertCell(cellIdx++);
    total1.innerHTML = "Total Computed:";
    total1.style.textAlign = "right";
    total1.style.fontWeight = "bold";
    total2 = row.insertCell(cellIdx++);
    total2.innerHTML = commaFormatted(data.total_compute.toString());
    total2.style.textAlign = "right";
    total2.style.fontWeight = "bold";
    empty = row.insertCell(cellIdx++);
    empty = row.insertCell(cellIdx++);

    table.parentNode.replaceChild(newBody, table);
    newBody.id = countOutputId;

    return sumCounts.all;
}

function commaFormatted(num) {

    if (!num || num.length <= 3)
        return num;

    var formatted = "";

    while (num.length > 3) {
        var part = num.substring(num.length - 3, num.length);
        formatted = part + "," + formatted;
        num = num.substring(0, num.length - 3);
    }
    
    if (num.length > 0)
        formatted = num + "," + formatted;
    formatted = formatted.substring(0, formatted.length - 1);

    return formatted;
}


// Private
function showUnirefRequirement(numFound, numAfterFraction, unirefVer, isUnirefRequired, continueSubmissionFn) {
    var warningDialog = $("#family-warning");
    $("#family-warning-total-size").text(commaFormatted(numFound.toString()));
    if (numAfterFraction > 0) {
        $("#family-warning-fraction-size").text(" (" + commaFormatted(numAfterFraction.toString()) + " after applying a fraction)");
    }

    if (!isUnirefRequired)
        $("#family-warning-size-info").hide();
    else
        $("#family-warning-size-info").show();

    $(".family-warning-uniref").text(unirefVer);

    var warningOkFn = function() {
        $(this).dialog("close");
        continueSubmissionFn(); // this is a callback from the submit.js functions that allows the submission to continue
    };

    var warningCancelFn = function() {
        $(this).dialog("close");
    };

    warningDialog.dialog({resizeable: false, draggable: false, autoOpen: false, height: 425, width: 500, modal: true,
        buttons: { "Ok": warningOkFn, "Cancel": warningCancelFn }
    }).prev(".ui-dialog-titlebar").css("color","red");

    warningDialog.dialog("open");
}

function showUnirefRequirement2(numFound, numAfterFraction, unirefVer, isUnirefRequired) {
    var showFn = function(continueSubmissionFn) {
        var warningDialog = $("#family-warning");
        $("#family-warning-total-size").text(commaFormatted(numFound.toString()));
        if (numAfterFraction > 0) {
            $("#family-warning-fraction-size").text(" (" + commaFormatted(numAfterFraction.toString()) + " after applying a fraction)");
        }
    
        if (!isUnirefRequired)
            $("#family-warning-size-info").hide();
        else
            $("#family-warning-size-info").show();
    
        $(".family-warning-uniref").text(unirefVer);
    
        var warningOkFn = function() {
            $(this).dialog("close");
            continueSubmissionFn(); // this is a callback from the submit.js functions that allows the submission to continue
        };
    
        var warningCancelFn = function() {
            $(this).dialog("close");
        };
    
        warningDialog.dialog({resizeable: false, draggable: false, autoOpen: false, height: 425, width: 500, modal: true,
            buttons: { "Ok": warningOkFn, "Cancel": warningCancelFn }
        }).prev(".ui-dialog-titlebar").css("color","red");
    
        warningDialog.dialog("open");
    };
    return showFn;
}



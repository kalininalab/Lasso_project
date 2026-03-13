

function doFormPost(formAction, formData, messageId, fileHandler, completionHandler) {

    formData.append("submit", "submit");

    var xhr = new XMLHttpRequest();
    if (typeof fileHandler === "function")
        fileHandler(xhr);

    xhr.open("POST", formAction, true);
    console.log(formData);
    xhr.send(formData);
    xhr.onreadystatechange  = function(){
        console.log(xhr);
        console.log(xhr.responseText);
        if (xhr.readyState == 4  ) {
            // Javascript function JSON.parse to parse JSON data
            var jsonObj = JSON.parse(xhr.responseText);

            // jsonObj variable now contains the data structure and can
            // be accessed as jsonObj.name and jsonObj.country.
            if (jsonObj.valid) {
                if (jsonObj.cookieInfo)
                    document.cookie = jsonObj.cookieInfo;
                completionHandler(jsonObj);
            }
            if (!jsonObj.valid && jsonObj.message) {
                document.getElementById(messageId).innerHTML = jsonObj.message;
            } else {
                if (messageId)
                    document.getElementById(messageId).innerHTML = "";
            }
        }
    }
}

function addCbParam(fd, param, id) {
    var val = $("#" + id).prop("checked");;
    if (typeof val !== "undefined") {
        fd.append(param, val);
        return true;
    } else {
        return false;
    }
}

function addRadioParam(fd, param, groupName) {
    var value = $("input[name='" + groupName + "']:checked").val();
    if (value)
        fd.append(param, value);
}

function addParam(fd, param, id) {
    var val = $("#" + id).val();
    if (typeof val !== "undefined")
        fd.append(param, val);
}



function addUploadStuff(xhr, progressNumId, progressBarId) {
    xhr.upload.addEventListener("progress", function(evt) { uploadProgress(evt, progressNumId, progressBarId);}, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
}

function uploadProgress(evt, progressTextId, progressBarId) {
    console.log(evt);
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        document.getElementById(progressTextId).innerHTML = percentComplete.toString() + '%';
        var bar = document.getElementById(progressBarId);
        bar.value = percentComplete;
    }
}

function uploadComplete(evt) {
}

function uploadFailed(evt) {
    alert("There was an error attempting to upload the file.");
    console.log(evt);
}

function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
}



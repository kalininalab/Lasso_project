
function initArchiveButton(getExtraData) {
    $(".archive-btn").click(function() {
        var id = $(this).data("id");
        var key = $(this).data("key");
        var jobType = $(this).data("type");
        var requestType = $(this).data("rt");

        var extra = getExtraData($(this));
        console.log(extra);
        var otherIds = extra[0];
        var onRequestCompletion = extra[1];

        showArchiveDialog(id, key, requestType, jobType, otherIds, onRequestCompletion); 
    });
}


function requestJobUpdate(id, jobKey, requestType, jobType, otherIds, completionHandler) {
    var fd = new FormData();
    fd.append("id", id);
    fd.append("key", jobKey);
    if (requestType == "cancel") {
        fd.append("rt", "c");
    } else if (requestType == "archive") {
        fd.append("rt", "a");
    }
    for (var i = 0; i < otherIds.length; i++) {
        fd.append(otherIds[i][0], otherIds[i][1]);
    }

    var fileHandler = function(xhr) { };

    var script = "update_job_status.php";
    doFormPost(script, fd, "", fileHandler, completionHandler);
}


function showArchiveDialog(id, key, requestType, jobType, otherIds, elementHideFn) {
    $("#archive-confirm").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Archive Job": function() {
                requestJobUpdate(id, key, requestType, jobType, otherIds, elementHideFn);
                $( this ).dialog("close");
            },
            Cancel: function() {
                $( this ).dialog("close");
            }
        }
    });
}



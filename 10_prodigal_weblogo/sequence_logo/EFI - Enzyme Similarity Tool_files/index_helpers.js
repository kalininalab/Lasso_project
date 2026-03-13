

function setupArchiveUi() {
    initArchiveButton(getExtraData);
}


function getExtraData(element) {
    var id = element.data("id");
    var aid = element.data("analysis-id");
    var trElem = element.parent().parent();

    var elemList = [trElem];
    if (!aid) {
        aid = 0;
        var idQuery = `[data-parent-id='${id}']`;
        var kids = $(".archive-btn"+idQuery);
        var aids = [];
        for (kid of kids) {
            var jKid = $(kid);
            if (jKid.data("analysis-id"))
                aids.push(jKid.data("analysis-id"));
            elemList.push(jKid.parent().parent());
        }
        for (kidAid of aids) {
            idQuery = `[data-parent-aid='${kidAid}']`;
            kids = $(".archive-btn"+idQuery);
            for (kid of kids) {
                var jKid = $(kid);
                elemList.push(jKid.parent().parent());
                var jKidId = jKid.data("id");
                var cKidQuery = `[data-parent-id='${jKidId}']`;
                var cKids = $(".archive-btn"+cKidQuery);
                for (ckid of cKids) {
                    var cKid = $(ckid);
                    elemList.push(cKid.parent().parent());
                }
            }
        }
    } else {
        var idQuery = `[data-parent-aid='${aid}']`;
        var kids = $(".archive-btn"+idQuery);
        // To hide child elements
        for (kid of kids) {
            var jKid = $(kid);
            elemList.push(["aid", jKid.parent().parent()]);
            var jKidId = jKid.data("id");
            var cKidQuery = `[data-parent-id='${jKidId}']`;
            var cKids = $(".archive-btn"+cKidQuery);
            for (ckid of cKids) {
                var cKid = $(ckid);
                elemList.push(cKid.parent().parent());
            }
        }
    }

    var elementHideFn = function() {
        elemList.map(x => x.hide());
    };

    var otherIds = aid ? [["aid", aid]] : [];

    return [otherIds, elementHideFn];
}



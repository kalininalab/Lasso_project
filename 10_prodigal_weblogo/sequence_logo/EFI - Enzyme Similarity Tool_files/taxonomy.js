

function AppTF(containerIdFn, searchApp) {
    this.containerIdFn = containerIdFn;
    this.preselects = {};
    this.searchApp = searchApp;
}


AppTF.prototype.addTaxPreselectSet = function(name, nameId, set, containerClasses) {
    this.preselects[name] = set;
    var selects = $(containerClasses);
    selects.each(function(selIdx) {
        $(this).append('<option value="' + nameId + '">' + name + '</option>');
    });
};


AppTF.prototype.getTaxonomyCategories = function() {
    var cats = ["Superkingdom", "Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    return cats;
};


AppTF.prototype.addTaxCondition = function(opt, defaultSelected = "", defaultSearch = "", showCondition = true) {
    var typeSelect = $('<select class="tax-select bigger m-5"></select>');
    var cats = this.getTaxonomyCategories();
    for (var i = 0; i < cats.length; i++) {
        var selected = cats[i] == defaultSelected ? " selected" : "";
        typeSelect.append('<option' + selected + ' value="' + cats[i] + '">' + cats[i] + '</option>');
    }
    var div1 = $('<div style="display: inline-block"></div>').append(typeSelect);

    var searchText = "";
    if (defaultSearch)
        searchText = ' value="' + defaultSearch + '"';
    var valueInput = $('<input class="tax-search small" type="text" ' + searchText + '/>');
    if (defaultSelected)
        this.setupTaxonomyTypeahead(valueInput, defaultSelected);

    var div2 = $('<div style="display: inline-block"></div>').append(valueInput);

    var visibleStyle = showCondition ? "" : "display: none";
    var mainDiv = $('<div class="tax-group" style="'+visibleStyle+'"></div>').append(div1).append(div2);

    var div3 = $('<div style="display: inline-block; cursor: pointer"><i class="fas fa-trash m-5"></i></div>');
    div3.click(function() {
        mainDiv.remove();
    });

    var that = this;
    // When the taxonomic category changes, we need to reset the typeahead.
    typeSelect.change(function() {
        var taxCategory = $(this).val();
        var val = valueInput.text();
        if (val)
            val = ' value="' + val + '"';
        div2.empty();
        var newInput = $('<input class="tax-search small" type="text" ' + val + '/>');
        that.setupTaxonomyTypeahead(newInput, taxCategory);
        div2.append(newInput);
    });

    mainDiv.append(div3);

    var containerId = this.containerIdFn(opt);
    $(containerId).append(mainDiv);
};


AppTF.prototype.addTaxPreselectConditions = function(opt, preselectName, showConditions = true) {
    if (!(preselectName in this.preselects))
        return false;
    var containerId = this.containerIdFn(opt);
    $(containerId).empty();
    var preselect = this.preselects[preselectName];
    for (var i = 0; i < preselect.length; i++) {
        this.addTaxCondition(opt, preselect[i][0], preselect[i][1], showConditions);
    }
};


AppTF.prototype.getTaxSearchConditions = function(opt) {
    var taxGroups = [];
    var containerId = this.containerIdFn(opt);
    $(containerId + " .tax-group").each(function(index) {
        var divs = $(this).children();
        var taxSelect = divs[0].children[0].value;
        var taxSearch = divs[1].children[0].value;
        if (taxSelect && taxSearch) {
            var taxGroup = taxSelect + ":" + taxSearch;
            taxGroups.push(taxGroup);
        }
    });
    return taxGroups;
};


AppTF.prototype.setupTaxonomyTypeahead = function(inputObj, category) {

    var that = this;
    inputObj.autocomplete({
        source: function (request, response) {
            $.ajax({
                url: that.searchApp,
                dataType: "json",
                data: {
                    q: request.term,
                    t: "tax-auto",
                    c: category
                },
                success: function(data) {
                    response(data);
                }
            });
        },
        minLength: 3,
        select: function (evt, ui) {
            //console.log(ui.item.value + " " + ui.item.id);
        }
    });
};





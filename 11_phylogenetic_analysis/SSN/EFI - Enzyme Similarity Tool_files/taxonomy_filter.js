
function setupTaxonomyUi(taxonomyApp) {
    var addTaxCatBtn = function() {
        var optionId = $(this).data("option-id");
        var firstSel = taxonomyApp.getTaxonomyCategories()[0];
        taxonomyApp.addTaxCondition(optionId, firstSel);
    };
    var clearTaxBtn = function() {
        var optionId = $(this).data("option-id");
        var theId = "#taxonomy-" + optionId + "-container";
        $(theId).empty();
        var sel = $("#taxonomy-" + optionId + "-select").get(0);
        sel.selectedIndex = 0;
        var optIdStr = optionId ? optionId + "-" : "";
        $("#taxonomy-" + optIdStr + "add-btn").off("click").click(addTaxCatBtn);
        $("#taxonomy-" + optIdStr + "add-btn").text("Add taxonomic condition");
        $("#taxonomy-" + optIdStr + "preset-name").val("");
    };

    $("button.add-tax-btn").click(addTaxCatBtn);
    //$("button.taxonomy-clear-preselect").click(clearTaxBtn);

    $(".taxonomy-preselects").change(function() {
        var optionId = $(this).data("option-id");
        var name = $(this).children("option:selected").text();
        var nameId = $(this).children("option:selected").val();
        taxonomyApp.addTaxPreselectConditions(optionId, name, true);
        var optIdStr = optionId ? optionId + "-" : "";
        $("#taxonomy-" + optIdStr + "add-btn").off("click").click(clearTaxBtn);
        $("#taxonomy-" + optIdStr + "add-btn").text("Reset");
        $("#taxonomy-" + optIdStr + "preset-name").val(nameId + "|" + name);
        alert("#taxonomy-" + optIdStr + "preset-name");
    });

    var bafPreselect = [
            ["Superkingdom", "Bacteria"],
            ["Superkingdom", "Archaea"],
            ["Phylum", "Ascomycota"],
            ["Phylum", "Basidiomycota"],
            ["Phylum", "Fungi incertae sedis"],
            ["Phylum", "unclassified fungi"],
        ];
    taxonomyApp.addTaxPreselectSet("Bacteria, Archaea, Fungi", "bacteria_fungi", bafPreselect, ".taxonomy-preselects");

    var eukPreselect = [
            ["Superkingdom", "Eukaryota"],
            ["Phylum", "NOT Ascomycota"],
            ["Phylum", "NOT Basidiomycota"],
            ["Phylum", "NOT Fungi incertae sedis"],
            ["Phylum", "NOT unclassified fungi"],
            ["Species", "NOT metagenome"],
        ];
    taxonomyApp.addTaxPreselectSet("Eukaryota, no Fungi", "eukaroyta_no_fungi", eukPreselect, ".taxonomy-preselects");

    var fungiPreselect = [
            ["Phylum", "Ascomycota"],
            ["Phylum", "Basidiomycota"],
            ["Phylum", "Fungi incertae sedis"],
            ["Phylum", "unclassified fungi"],
        ];
    taxonomyApp.addTaxPreselectSet("Fungi", "fungi", fungiPreselect, ".taxonomy-preselects");

    var virPreselect = [
            ["Superkingdom", "Viruses"],
        ];
    taxonomyApp.addTaxPreselectSet("Viruses", "viruses", virPreselect, ".taxonomy-preselects");

    var bacPreselect = [
            ["Superkingdom", "Bacteria"],
        ];
    taxonomyApp.addTaxPreselectSet("Bacteria", "bacteria", bacPreselect, ".taxonomy-preselects");

    var allEukPreselect = [
            ["Superkingdom", "Eukaryota"],
        ];
    taxonomyApp.addTaxPreselectSet("Eukaryota", "eukaryota", allEukPreselect, ".taxonomy-preselects");

    var arcPreselect = [
            ["Superkingdom", "Archaea"],
        ];
    taxonomyApp.addTaxPreselectSet("Archaea", "archaea", arcPreselect, ".taxonomy-preselects");
}



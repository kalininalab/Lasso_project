
var FORM_ACTION = "create.php";
var DEBUG = 0;
var ARCHIVE = 2;

//TODO: switch everything over to jQuery (currently the file upload stuff is in vanilla JS)

function AppEstSubmit(idData, familySizeHelper, taxonomyApp) {
    this.famHelper = familySizeHelper;
    this.idData = idData;
    this.taxApp = taxonomyApp;
}


function getDefaultCompletionHandler() {
    var handler = function(jsonObj) {
        var nextStepScript = "stepb.php";
        window.location.href = nextStepScript + "?id=" + jsonObj.id;
    };
    return handler;
}

AppEstSubmit.prototype.addCommonFormData = function(opt, fd) {
    var email = $("#email-" + opt).val();
    var jobName = $("#job-name-" + opt).val();
    var famInput = $("#families-input-" + opt).val();
    var evalue = $("#evalue-" + opt).val();
    var dbMod = $("#db-mod-" + opt).val();
    var useUniref = $("#use-uniref-" + opt).prop("checked");
    var unirefVer = $("#uniref-ver-" + opt).val();
    var fraction = $("#fraction-" + opt).val();
    var cpuX2 = $("#cpu-x2-" + opt).prop("checked");
    var largeMem = $("#large-mem-" + opt).prop("checked");
    var exlFrag = $("#exclude-fragments-" + opt).prop("checked");
    var allSeq = $("#include-all-seq-" + opt).prop("checked");
    var program = $("#program-" + opt).val();
    var programSens = $("#program-sens-" + opt).val();
    var programHits = $("#program-hits-" + opt).val();

    fd.append("email", email);
    fd.append("job-name", jobName);
    fd.append("families_input", famInput);
    fd.append("families_use_uniref", useUniref);
    fd.append("families_uniref_ver", unirefVer);
    if (evalue)
        fd.append("evalue", evalue);
    if (fraction)
        fd.append("fraction", fraction);
    fd.append("db-mod", dbMod);
    fd.append("cpu-x2", cpuX2);
    fd.append("large-mem", largeMem);
    if (exlFrag)
        fd.append("exclude-fragments", exlFrag);
    if (allSeq)
        fd.append("include-all-seq", allSeq);
    if (program) {
        fd.append("program", program);
        if (programSens)
            fd.append("program-sens", programSens);
        if (programHits)
            fd.append("program-hits", programHits);
    }
    
    var extraRamId = opt + "-extra-ram";
    var extraRamChecked = $("#" + extraRamId).prop("checked");
    if (typeof extraRamChecked !== "undefined") {
        if (extraRamChecked) {
            var val2 = $("#" + extraRamId + "-val").val();
            if (typeof val2 !== "undefined" && val2 > 1)
                fd.append("extra_ram", val2);
        }
    }

    var taxGroups = this.taxApp.getTaxSearchConditions(opt);
    taxGroups.forEach((group) => fd.append("tax_search[]", group));
    var taxPresetNameId = opt ? "taxonomy-" + opt + "-preset-name" : "taxonomy-preset-name";
    var taxPresetName = $("#" + taxPresetNameId).val();
    if (taxPresetName)
        fd.append("tax_name", taxPresetName);
};

AppEstSubmit.prototype.submitOptionForm = function(optionId) {
    var submitFn = false;
    var outputIds = this.idData[optionId].output;
    if (optionId == "opta")
        submitFn = this.getOptionAFormFn(outputIds);
    else if (optionId == "optb")
        submitFn = this.getOptionBFormFn(outputIds);
    else if (optionId == "optc")
        submitFn = this.getOptionCFormFn(outputIds);
    else if (optionId == "optd")
        submitFn = this.getOptionDFormFn(outputIds);
    else if (optionId == "opte")
        submitFn = this.getOptionEFormFn(outputIds);

    if (typeof submitFn === "function") {
        var result = this.famHelper.checkUnirefRequirement2(optionId);
        if (result === false) {
            return false;
        } else if (typeof result === "function") {
            result(submitFn);
        } else {
            submitFn();
        }
    }
}

AppEstSubmit.prototype.getOptionAFormFn = function(outputIds) {

    var that = this;

    var optionId = "opta";

    var submitFn = function() {
        var fd = new FormData();
        fd.append("option_selected", "A");
        that.addCommonFormData(optionId, fd);
        addParam(fd, "blast_input", "blast-input");
        addParam(fd, "blast_evalue", "blast-evalue");
        addParam(fd, "blast_max_seqs", "blast-max-seqs");
        addParam(fd, "blast_db_type", "blast-db-type");
        
        var fileHandler = function(xhr) {};
        var completionHandler = getDefaultCompletionHandler();
    
        doFormPost(FORM_ACTION, fd, outputIds.warningMsg, fileHandler, completionHandler);
    };

    if (!checkSequence($("#blast-input").val())) {
        $("#blast-input").addClass("input-error");
        $("#" + outputIds.warningMsg).text("Invalid Query Sequence.  Please input a protein sequence.");
        return false;
    }

    return submitFn;
};

AppEstSubmit.prototype.getOptionBFormFn = function(outputIds) {

    var that = this;

    var optionId = "optb";

    var submitFn = function() {
        var fd = new FormData();
        fd.append("option_selected", "B");
        that.addCommonFormData(optionId, fd);
        addCbParam(fd, "domain", "domain-optb");
        if ($("#domain-optb").prop("checked")) {
            addRadioParam(fd, "domain_region", "domain-region-optb");
        }
        addParam(fd, "pfam_seqid", "pfam-seqid");
        addParam(fd, "pfam_length_overlap", "pfam-length-overlap");
        
        var fileHandler = function(xhr) {};
        var completionHandler = getDefaultCompletionHandler();
    
        doFormPost(FORM_ACTION, fd, outputIds.warningMsg, fileHandler, completionHandler);
    };

    return submitFn;
};

AppEstSubmit.prototype.getOptionCFormFn = function(outputIds) {

    var that = this;

    var optionId = "optc";

    var submitFn = function() {
        var source = $("#optionC-src-tabs").data("source");

        var fd = new FormData();
        fd.append("option_selected", "C");
        that.addCommonFormData(optionId, fd);
        //addParam(fd, "fasta_input", "fasta-input");
        //addCbParam(fd, "fasta_use_headers", "fasta-use-headers");
        if (source == "uniprot")
            fd.append("accession_seq_type", "uniprot");
        else
            addParam(fd, "accession_seq_type", "fasta-seq-type");
    
        if ($("#domain-optc").prop("checked")) {
            fd.append("domain", true);
            addParam(fd, "domain_family", "domain-family-optc");
            addRadioParam(fd, "domain_region", "domain-region-optc");
        }

        if ($("#family-filter-optc").val().length >= 7) {
            addParam(fd, "family_filter", "family-filter-optc");
        }
    
        var completionHandler = getDefaultCompletionHandler();
        var fileHandler = function(xhr) {};
        var files = document.getElementById("fasta-file-" + source).files;
        if (files.length > 0) {
            fd.append("file", files[0]);
            fileHandler = function(xhr) {
                addUploadStuff(xhr, "progress-num-fasta", "progress-bar-fasta");
            };
        }
    
        doFormPost(FORM_ACTION, fd, outputIds.warningMsg, fileHandler, completionHandler);
    };

    return submitFn;
};

AppEstSubmit.prototype.getOptionDFormFn = function(outputIds) {

    var that = this;

    var optionId = "optd";

    var submitFn = function() {
        var source = $("#optionD-src-tabs").data("source");
        
        var fd = new FormData();
        fd.append("option_selected", "D");
        that.addCommonFormData(optionId, fd);
        addParam(fd, "accession_input", "accession-input-" + source);
        if (source == "uniprot")
            fd.append("accession_seq_type", "uniprot");
        else
            addParam(fd, "accession_seq_type", "accession-seq-type");
        addParam(fd, "accession_tax_job_id", "tax-source-job-id");
        addParam(fd, "accession_tax_job_key", "tax-source-job-key");
        addParam(fd, "accession_tax_tree_id", "tax-source-tree-id");
        addParam(fd, "accession_tax_id_type", "tax-source-id-type");

        if ($("#domain-optd").prop("checked")) {
            fd.append("domain", true);
            addParam(fd, "domain_family", "domain-family-optd");
            addRadioParam(fd, "domain_region", "domain-region-optd");
        }

        if ($("#family-filter-optd").val().length >= 7) {
            addParam(fd, "family_filter", "family-filter-optd");
        }
    
        var completionHandler = getDefaultCompletionHandler();
        if (!$("#tax-source-job-id").val()) {
            var fileHandler = function(xhr) {};
            var files = document.getElementById("accession-file-" + source).files;
            if (files.length > 0) {
                fd.append("file", files[0]);
                fileHandler = function(xhr) {
                    addUploadStuff(xhr, "progress-num-accession-" + source, "progress-bar-accession-" + source);
                };
            }
        }
    
        doFormPost(FORM_ACTION, fd, outputIds.warningMsg, fileHandler, completionHandler);
    };

    return submitFn;
};

AppEstSubmit.prototype.getOptionEFormFn = function(outputIds) {

    var that = this;

    var optionId = "opte";

    var submitFn = function() {
        var fd = new FormData();
        fd.append("option_selected", "E");
        that.addCommonFormData(optionId, fd);
        addCbParam(fd, "pfam_domain", "domain-opte");
        addParam(fd, "pfam_seqid", "seqid-opte");
        addParam(fd, "pfam_min_seq_len", "min-seq-len-opte");
        addParam(fd, "pfam_max_seq_len", "max-seq-len-opte");
        addParam(fd, "pfam_length_overlap", "length-overlap-opte");
        addCbParam(fd, "pfam_demux", "demux-opte");
    
        var fileHandler = function(xhr) {};
        var completionHandler = getDefaultCompletionHandler();
    
        doFormPost(FORM_ACTION, fd, outputIds.warningMsg, fileHandler, completionHandler);
    };

    return submitFn;
};

function submitTaxonomyForm(option) {
    option = option || "opt_tax";

    var app = new AppEstSubmit();

    var messageId = "message-" + option;

    var fd = new FormData();
    fd.append("option_selected", option);

    app.addCommonFormData(option, fd);
    
    var completionHandler = getDefaultCompletionHandler();
    var fileHandler = function(xhr) {};

    doFormPost(FORM_ACTION, fd, messageId, fileHandler, completionHandler);
}

AppEstSubmit.prototype.submitColorSsnForm = function(type) { // the parameters are optional
    type = type || "";

    var option = type ? type : "colorssn";
    var messageId = "message-" + option;

    var fd = new FormData();
    fd.append("option_selected", option);
    addParam(fd, "email", "email-" + option);
    addParam(fd, "efiref", option + "-efiref");
    addCbParam(fd, "skip_fasta", option + "-skip-fasta");
    
    var id = option + "-extra-ram";
    var val = $("#" + id).prop("checked");
    if (typeof val !== "undefined") {
        if (val) {
            var val2 = $("#" + id + "-val").val();
            if (typeof val2 !== "undefined" && val2> 1)
                fd.append("extra_ram", val2);
        }
    }

    if (type == "cluster") {
        var hmmOpt = "";
        if ($("#" + "make-weblogo-" + option).prop("checked"))
            hmmOpt = "WEBLOGO";
        if ($("#" + "make-hmm-" + option).prop("checked"))
            hmmOpt += ",HMM";
        if ($("#" + "make-cr-" + option).prop("checked"))
            hmmOpt += ",CR";
        if ($("#" + "make-hist-" + option).prop("checked"))
            hmmOpt += ",HIST";
        fd.append("make-hmm", hmmOpt);
        addParam(fd, "aa-threshold", "aa-threshold-" + option);
        addParam(fd, "hmm-aa", "hmm-aa-list-" + option);
        addParam(fd, "min-seq-msa", "min-seq-msa-" + option);
        addParam(fd, "max-seq-msa", "max-seq-msa-" + option);
    } else if (type == "cr") {
        addParam(fd, "ascore", option + "-ascore");
        addParam(fd, "color-ssn-source-color-id", "color-ssn-source-color-id");
    }
    addParam(fd, "ssn-source-id", "ssn-source-id-" + option);
    addParam(fd, "ssn-source-idx", "ssn-source-idx-" + option);
    addParam(fd, "ssn-source-key", "ssn-source-key-" + option);
    //addCbParam(fd, "exlude-fragments", "exclude-" + option);
    
    var completionHandler = getDefaultCompletionHandler();
    var fileHandler = function(xhr) {};
    var files = document.getElementById(option + "-file").files;
    if (files.length > 0) {
        fd.append("file", files[0]);
        fileHandler = function(xhr) {
            addUploadStuff(xhr, "progress-num-" + option, "progress-bar-" + option);
        };
    }

    doFormPost(FORM_ACTION, fd, messageId, fileHandler, completionHandler);
}

function submitStepEColorSsnForm(analysisId, ssnIndex) {

    var fd = new FormData();
    fd.append("option_selected", "colorssn");
    fd.append("ssn-source-id", analysisId);
    fd.append("ssn-source-idx", ssnIndex);

    var completionHandler = getDefaultCompletionHandler();
    var fileHandler = function(xhr) {};

    doFormPost(FORM_ACTION, fd, "", fileHandler, completionHandler);
}

function toggleUniref(comboId, unirefCheckbox) {
    if (unirefCheckbox.checked) {
        document.getElementById(comboId).disabled = false;
    } else {
        document.getElementById(comboId).disabled = true;
    }
}



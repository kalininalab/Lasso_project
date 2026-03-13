

function setupFileInputEvents() {
    $("#fasta-file").on("change", function(e) {
        var fileName = '';
        fileName = e.target.value.split( '\\' ).pop();
        if (fileName && !$("#job-name-optc").val())
            $("#job-name-optc").val(fileName);
    });

    $("#accession-file-uniprot").on("change", function(e) {
        var fileName = '';
        fileName = e.target.value.split( '\\' ).pop();
        if (fileName && !$("#job-name-optd").val())
            $("#job-name-optd").val(fileName);
    });

    $("#accession-file-uniref").on("change", function(e) {
        var fileName = '';
        fileName = e.target.value.split( '\\' ).pop();
        if (fileName) {
            if (fileName.toLowerCase().includes("uniref50"))
                $("#accession-seq-type").val("uniref50");
            else if (fileName.toLowerCase().includes("uniref90"))
                $("#accession-seq-type").val("uniref90");
            else if (fileName.toLowerCase().includes("uniprot"))
                $("#accession-seq-type").val("uniprot");
        }
        if (fileName && !$("#job-name-optd").val())
            $("#job-name-optd").val(fileName);
    });
}



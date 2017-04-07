/**
 * @author Guo
 */
var abGbRptCertLogController = View.createController('abGbRptCertLogController', {


    // ----------------------- event handlers -------------------------    
    
    /**
     * This event handler is called when user click "DOC" button in title bar of Top console
     */
    abGbRptCertProjForm_onDoc: function(){
    	var parameters = {
				 'printRestriction':true 
				 };
    	// Create the restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_cert_proj.bl_id', this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.bl_id'), '=');
		restriction.addClause('gb_cert_proj.project_name', this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.project_name'), '=');		
		restriction.addClause('gb_cert_proj.cert_std', this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.cert_std'), '=');	
		//	paired dataSourceId with Restriction objects
		var passedRestrictions = {'abGbRptCertPaginateProjFormDS': restriction};				
        View.openPaginatedReportDialog("ab-gb-rpt-cert-log-paginate.axvw", passedRestrictions,parameters);
    },
    
    /**
     * This event handler is called when Top-Right Certification Rating Project details form is refreshed
     */
    abGbRptCertProjForm_afterRefresh: function(){
    
        // Construct a restriction from fields value of Certification Rating Project details form include "gb_cert_proj.proj_name", "gb_cert_proj.bl_id", then show and refresh Project Activity logs grid by this restriction.
        // Do same thing as above to Project Documents grid 
        var project = this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.project_name');
        var blId = this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.bl_id');
		var certStd = this.abGbRptCertProjForm.getFieldValue('gb_cert_proj.cert_std');
        this.abGbRptCertProjLogGrid.addParameter('project_name', project);
        this.abGbRptCertProjLogGrid.addParameter('bl_id', blId);
		this.abGbRptCertProjLogGrid.addParameter('cert_std', certStd);
        this.abGbRptCertProjDocGrid.addParameter('project_name', project);
        this.abGbRptCertProjDocGrid.addParameter('bl_id', blId);
		this.abGbRptCertProjDocGrid.addParameter('cert_std', certStd);
        this.abGbRptCertProjLogGrid.refresh();
        this.abGbRptCertProjDocGrid.refresh();
    }
    
});

/**
 * This event handler is called when user click any row in Project Documents grid.
 */
function onSelectDocumentRow(row){
    // Show Project Document Form in a pop-up dialog restricted by clicked document row 
    var record = row.row.getRecord();
    var docId = record.getValue('gb_cert_docs.cert_doc_id');
    var docName = record.getValue('gb_cert_docs.doc');
    var keys = {
        'cert_doc_id': docId
    };
    View.showDocument(keys, 'gb_cert_docs', 'doc', docName);
}


var abReportDocController = View.createController('abReportDocController', {

	
	/**
	 * Set the grid cell content of doc field to be rewritten after being filled;
	 * bind event listeners for doc field in form
	 */
    afterViewLoad: function(){
	    this.documentsGrid.afterCreateCellContent = abCompDocCommonController.customAfterCreateCellContentForDoc.createDelegate();
	},

	documentsGrid_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var id = record.getValue("docs_assigned.doc_id");
		if (valueExistsNotEmpty(id)) {
			restriction.addClause('docs_assigned.doc_id', id, '=');
		}	
		var panel=this.abCompDocumentRegulationForm;
		panel.refresh(restriction);
		panel.show(true);
		this.abCompDocumentRegulationForm.showInWindow({
			width: 800,
			height: 500
		});
		
		var mainController = View.getOpenerView().controllers.get(0);
		var clickedNodeName = mainController.clickedNodeName;
		if(typeof(clickedNodeName)!="undefined"){
			if(clickedNodeName=="regulation"){
				commLocationsController.abCompDocumentRegulationForm.setTitle(getMessage('formTitleRegulation'));
			}else if(clickedNodeName=="comprogram"){
				commLocationsController.abCompDocumentRegulationForm.setTitle(getMessage('formTitleProgram'));
			}else{
				commLocationsController.abCompDocumentRegulationForm.setTitle(getMessage('formTitleRequirement'));
			}
		}
		
	},

	/**
	 * Events Handler after column report is refreshed.
	 * For the document link in the columnReport,if the user or his role does not have security group, then remove the link (leave as static text). 
	 */
	abCompDocumentRegulationForm_afterRefresh: function(){

		var securityGrup = this.abCompDocumentRegulationForm.getFieldValue("docs_assigned.doc_review_grp");
		var docName = this.abCompDocumentRegulationForm.getFieldValue("docs_assigned.doc");
		if(securityGrup && !View.user.isMemberOfGroup(securityGrup)){
			//remove link
			$('abCompDocumentRegulationForm_docs_assigned.doc').innerHTML=docName;
		} 

	},
	
	/**
	* Event Handler of action "Doc"
	*/
	documentsGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.documentsGrid.restriction?this.documentsGrid.restriction:"1=1";
		View.openPaginatedReportDialog("ab-comp-document-paginate-rpt.axvw" ,null, parameters);

	}
});
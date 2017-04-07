 /**
  * @author  MuLiang
  */
var abWasteRptContainerLabelsController = View.createController('abWasteRptContainerLabelsController',
  {
	/**
	* Generate Selected Labels invoke workflow
	*/
	abWasteRptContainerLabelsGridPanel_onGenerateLabels: function(){
    	var gridForm=this.abWasteRptContainerLabelsGridPanel;
    	var records = gridForm.getPrimaryKeysForSelectedRows();
    	if(records.length < 1 ){
    		View.showMessage(getMessage('noRecordSelected'));
    		return false;
    	}
    	try{  
    		//Pass an array parameters about 'waste_out.id' to workflow.
    		var jobId = Workflow.startJob('AbRiskWasteMgmt-WasteService-generateSelectedLabels', records);
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		    View.openDialog(url);
    	}catch(e){
    		Workflow.handleError(e);
    	}  
	}
				  
  });
/**
 * When any Tree level 1 node be clicked will expand this tree.
 */
function selectValueFromSiteTree(){
	var curTreeNode = View.panels.get("abWasteRptContainerLabelsSiteTree").lastNodeClicked;
	curTreeNode.expand();
}
/**
 * Restriction records that  'storage_location' has been clicked , apply to details panel. 
 */
function restrictStorageData(){
	var curTreeNode = View.panels.get("abWasteRptContainerLabelsSiteTree").lastNodeClicked;
	var detailFrom = abWasteRptContainerLabelsController.abWasteRptContainerLabelsGridPanel;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel 
	restriction.addClause('waste_out.storage_location', curTreeNode.data['waste_areas.storage_location']);
	detailFrom.refresh(restriction);
}
/**
 * Set all rows as unselected, setting each checkbox to false
 */
function unselectAllRecords() {
    var grid = Ab.view.View.getControl('', 'abWasteRptContainerLabelsGridPanel');
	var selectedRows = grid.setAllRowsSelected(false);
}

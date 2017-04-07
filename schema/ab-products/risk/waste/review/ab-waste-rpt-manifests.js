/**

* @author xianchao

*/
var abWasteRptMainfestsController = View.createController('abWasteRptMainfestsController',
{


	/**
	* This event handler is called by clear button in abWasteRptMainfestsConsole.
	*/
	abWasteRptMainfestsConsole_onClear : function() {
		this.abWasteRptMainfestsConsole.clear();
	},
	/**
	* This event handler is called by show button in abWasteRptMainfestsConsole.
	*/
	abWasteRptMainfestsConsole_onShow : function() {
		this.abWasteRptMainfestsGrid.addParameter('conRes', this.getRes());
		this.abWasteRptMainfestsGrid.refresh();
		this.abWasteRptMainfestsGrid.show(true);
	},
	/**
	* after abWasteRptMainfestsForm refresh 
	*/
	abWasteRptMainfestsForm_afterRefresh: function(){
		this.abWasteRptMainfestsForm.getFieldElement('waste_facilities.facility_name').disabled= true;
		this.abWasteRptMainfestsForm.getFieldElement('waste_facilities.vn_id').disabled= true;
	},
	/**
	* This event handler is called by Generate Selected Manifest(s) button in abWasteRptMainfestsGrid.
	*/
	abWasteRptMainfestsGrid_onGenerateManifestsPdf: function(){
		var  manifestNumbers = this.abWasteRptMainfestsGrid.getPrimaryKeysForSelectedRows();
		if(manifestNumbers.length==0){
			View.showMessage(getMessage("noRecordsSelected"));
			return;
		}
		callWfr(manifestNumbers);
	},
	/**
	* get restriction of abWasteRptMainfestsGrid
	*/
	getRes: function(){
		var res="1=1 ";
		var num=this.abWasteRptMainfestsConsole.getFieldValue('waste_manifests.manifest_number');
		var facName=this.abWasteRptMainfestsConsole.getFieldValue('waste_facilities.facility_name');
		var genId=this.abWasteRptMainfestsConsole.getFieldValue('waste_generators.generator_id');
		if(''!=num){
			res=res+" and waste_manifests.manifest_number like '%"+num+"%'";
		}
		if(''!=facName){
			res=res+ " and waste_facilities.facility_name='"+facName+"'";
		}
		if(''!=genId){
			
			res=res+" and  waste_manifests.manifest_number in( select distinct manifest_number from waste_out where waste_out.generator_id='"+genId+"')";
		}
		return res;
	},
	/**
	* This event handler is called by Generate Manifest button in abWasteRptMainfestsForm.
	*/
	abWasteRptMainfestsForm_onGenerateManifestPdf: function(){
		var  manifestNumber = this.abWasteRptMainfestsForm.getFieldValue('waste_manifests.manifest_number');
		var manifest = new Array();
		var record=this.abWasteRptMainfestsForm.getRecord();
		var keys = new Object();
		keys["waste_manifests.manifest_number"]=manifestNumber;
	                manifest.push(keys);
	                callWfr(manifest);
	}
});
//after click manifest 
function clickManifest(){
	var grid = abWasteRptMainfestsController.abWasteRptMainfestsGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var num = rows[num]['waste_manifests.manifest_number'];
	abWasteRptMainfestsController.num=num;
	var res=new Ab.view.Restriction();
	res.addClause('waste_manifests.manifest_number', num);
	abWasteRptMainfestsController.abWasteRptMainfestsForm.clear();
	abWasteRptMainfestsController.abWasteRptMainfestsForm.newRecord = false;
	abWasteRptMainfestsController.abWasteRptMainfestsForm.refresh(res);
	var res=new Ab.view.Restriction();
	res.addClause('waste_out.manifest_number', num);
	var rec=abWasteRptMainfestsController.abWasteRptMainfestsWasteOut.getRecord(res);
	var generatorId=rec.getValue("waste_out.generator_id");
	var generator = $('generator_id');
	if(generatorId!=''&&generatorId!=null){
		abWasteRptMainfestsController.generatorId=generatorId;
		generator.value=generatorId;
	}
	generator.disabled= true;
}
//call generator pdf WFR
function callWfr(manifests){
	try {
		var jobId = Workflow.startJob('AbRiskWasteMgmt-WasteService-generateManifestPdf', manifests);
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	    var result=Workflow.getJobStatus(jobId);
	    while (result.jobFinished != true && result.jobStatusCode != 8 ) {
	    	result=Workflow.getJobStatus(jobId);
	    var message=result.jobMessage;
	   if(message.indexOf(".")!=-1){
		   var blank=message.split(".")[1];
		   if(blank!=""){
			   View.showMessage(getMessage("blankWarning").replace('{0}',blank));
		   }
	   }
	    }
	    var genPdf=result.jobMessage;
	    if(genPdf.substring(0,1)=="("){
	    	View.showMessage(getMessage("checkGenId"));
	    }
	} catch (e) {
		Workflow.handleError(e);
	}
}




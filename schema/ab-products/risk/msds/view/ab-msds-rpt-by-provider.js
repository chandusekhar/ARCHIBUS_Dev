/**

* @author xianchao

*/
var abRiskMsdsRptByProviderController = View.createController('abRiskMsdsRptByProviderController',
{	
	vn_id:null,
	
	afterInitialDataFetch: function(){
		disableTabs();
	},
	
	applyCustomCompanyFilter: function(){
		var restriction = new Ab.view.Restriction();
		for (var i=0; i<this.abRiskMsdsRptByProConsole.fields.length; i++){
			   var thisField = this.abRiskMsdsRptByProConsole.fields.keys[i];
			   var fieldValue = this.abRiskMsdsRptByProConsole.getFieldValue(thisField);
			   if (fieldValue != ''){
				   if (thisField == 'company.comments'){
					   restriction.addClause(thisField, '%'+fieldValue+'%', 'LIKE');
				   }
				   else {
					   restriction.addClause(thisField, fieldValue+'%', 'LIKE');
				   }
			   }
		}
		this.abRiskMsdsRptByProGrid.show(true);
		this.abRiskMsdsRptByProGrid.refresh(restriction);
		
		disableTabs();
	}
});
//after click provider 
function clickPro(){
	var grid = abRiskMsdsRptByProviderController.abRiskMsdsRptByProGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var company = rows[num]['company.company'];
	var res="msds_data.distributor_id='"+company+"' or  msds_data.manufacturer_id='"+company+"' or  msds_data.preparer_id='"+company+"'";
	abRiskMsdsRptByProviderController.abRiskMsdsRptMsdsGrid.refresh(res);
	var tabs=abRiskMsdsRptByProviderController.tabsBldgManagement;
	tabs.selectTab('msdsGrid');
	disableTabs();
}
//after click Msds 
function clickMsds(){
	var controller = abRiskMsdsRptByProviderController;


	var grid = controller.abRiskMsdsRptMsdsGrid;
	var msdsId = grid.rows[grid.selectedRowIndex]['msds_data.msds_id'];
	var res=new Ab.view.Restriction();
	res.addClause('msds_data.msds_id', msdsId);
	for(var i=1; i<controller.tabsBldgManagement.tabs.length;i++){
		controller.tabsBldgManagement.tabs[i].restriction=res;
	}
	
	controller.abRiskMsdsRptMsdsDocForm.refresh(res);
	
	controller.abRiskMsdsRptMsdsClassGrid.refresh(res);
	controller.abRiskMsdsRptMsdsClassForm.show(false);

	controller.abRiskMsdsRptMsdsConstGrid.refresh(res);

	controller.abRiskMsdsRptMsdsPhysicalForm.refresh(res);

	controller.tabsBldgManagement.selectTab('identification');
	enableTabs();
}
//after click view document 
function clickViewDocument(){
	clickMsds();
	abRiskMsdsRptByProviderController.tabsBldgManagement.selectTab('document');
	showDocument();
}
/**
 * The showDocument command does the job.
 */
function showDocument() {
	var form=abRiskMsdsRptByProviderController.abRiskMsdsRptMsdsDocForm;
	var keys = {"msds_id": form.getFieldValue("msds_data.msds_id")};//form.getDocSvcPrimaryKeyFieldValues();
	var tableName = "msds_data";
	var fieldName = "doc";
	var fileName = form.getFieldValue("msds_data.doc");
	DocumentService.show(keys, tableName, fieldName, fileName, '', true, 'showDocument', {
        callback: function(fileTransfer) {
            dwr.engine.openInDownload(fileTransfer);
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
}
function enableTabs(){
	var tabs=abRiskMsdsRptByProviderController.tabsBldgManagement;
	tabs.enableTab("identification", true);
	tabs.enableTab("document", true);
	tabs.enableTab("hazardClassification", true);
	tabs.enableTab("constituents", true);
	tabs.enableTab("physicalProperties", true);
}
function disableTabs(){
	var tabs=abRiskMsdsRptByProviderController.tabsBldgManagement;
	tabs.enableTab("identification", false);
	tabs.enableTab("document", false);
	tabs.enableTab("hazardClassification", false);
	tabs.enableTab("constituents", false);
	tabs.enableTab("physicalProperties", false);
}
/**
 * function to be invoked by callFunction in order to apply the custom filter restriction with open search on comments
 */
function applyCustomCompanyFilter() {
	var controller = View.controllers.get('abRiskMsdsRptByProviderController');
	controller.applyCustomCompanyFilter();
}
/**

* @author xianchao

*/
var abWasteRptProByCodeController = View.createController('abWasteRptProByCodeController',{
	
	profile : '',
	
	/**
	 * Set the value of MSDS Code field as a link to MSDS Details 
	 * if user has the AbRiskMSDS - Review MSDSs process assigned
	 */
	abWasteRptProByCodeForm_afterRefresh:function(){
		var msds_id = this.abWasteRptProByCodeForm.getFieldValue("waste_profiles.msds_id");
		var hasMsdsProcess = (this.abWasteRptProfileByCat_viewMsdsDs.getRecords().length > 0) ? true : false;
		if(valueExistsNotEmpty(msds_id) && hasMsdsProcess){
			document.getElementById("html_msds_id_div").innerHTML = "<a href='javascript:void(0)' onClick='showMSDSDetails();'>"+msds_id+"</a>";
		}else if(valueExistsNotEmpty(msds_id)){
			document.getElementById("html_msds_id_div").innerHTML = msds_id;
		}else{
			document.getElementById("html_msds_id_div").innerHTML = "";
		}
	},
	
	//PDF_LiveCycle action
	abWasteRptProByCodeForm_onDoc:function(){
		
		var reportViewName = "ab-waste-rpt-profile-by-cat-paginate.axvw";
		var proRes;
		if(this.profile==''){
			proRes=" is not null";
		 }else{
			 proRes="='"+this.profile+"'";
		 } 
		//paired parameter names with parameter values
		var parameters = {'proRes':proRes};
		//passing parameters
		View.openPaginatedReportDialog(reportViewName, null, parameters);
   	
   }
});

/**
* event click category node.
*/
function selectCatFromTree() {
	abWasteRptProByCodeController.abWasteRptProByCodeForm.show(false);
	abWasteRptProByCodeController.abWasteRptProByCodeGrid.show(false);
	var curTreeNode = View.panels.get("abWasteRptProByCodeTree1").lastNodeClicked;
	curTreeNode.expand();
	abWasteRptProByCodeController.curTreeNode = curTreeNode;
}

/**
* event click profile node.
*/
function selectProFromTree() {
	var curTreeNode = View.panels.get("abWasteRptProByCodeTree1").lastNodeClicked;
	var proForm=abWasteRptProByCodeController.abWasteRptProByCodeForm;
	var profile = curTreeNode.data['waste_profiles.waste_profile'];
	abWasteRptProByCodeController.profile=profile;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_profiles.waste_profile', profile);
	proForm.refresh(restriction);
	var restriction1 = new Ab.view.Restriction();
	restriction1.addClause('waste_profile_reg_codes.waste_profile', profile);
	abWasteRptProByCodeController.abWasteRptProByCodeGrid.refresh(restriction1);
}

/**
 * event handler of click event for msds_id field in
 * abWasteRptProByCodeForm
 */
function showMSDSDetails() {
	var restriction = new Ab.view.Restriction();
	var msds_id = abWasteRptProByCodeController.abWasteRptProByCodeForm.getFieldValue("waste_profiles.msds_id");
	restriction.addClause("msds_data.msds_id", msds_id, "=");
	View.openDialog('ab-msds-rpt-map-msds-tab.axvw', restriction);
}
/**
*
* Compliance Violations Select  view, used for:  Manage Compliance Violations View - first tab
* 
* @author Zhang Yi
*/
var abCompViolationSelectController = View.createController('abCompViolationSelectController',
{
	//top controller
	topCtrl:null,
		
	/**
	* Event Handler of action "Doc"
	*/
	abCompViolationGrid_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.consoleRes?this.consoleRes:" 1=1 ";
		setLocationFieldTitle(parameters);
		View.openPaginatedReportDialog("ab-comp-violation-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Add New"
	*/
	abCompViolationGrid_onAddNew : function(){

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//set proper signs of top controller
		this.topCtrl.isAddNew=true;
		this.topCtrl.initialTabRefreshed();

		//Call function of top controller to select and refresh second tab
		this.topCtrl.selectDefineTab();
	},

	/**
	 * Events Handler for row action "Edit" in grid 
	 */
	abCompViolationGrid_edit_onClick: function(row){

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}

		//set proper variables and signs of top controller
		var violationNumber =  row.getFieldValue('regviolation.violation_num');
		this.topCtrl.violation=violationNumber;
		this.topCtrl.isAddNew=false;
		this.topCtrl.needRefreshRestTab=true;
		this.topCtrl.initialTabRefreshed();

		//Call function of top controller to select and refresh second tab
		this.topCtrl.selectDefineTab(violationNumber);
	},
	
	/**
	* refresh grid
	*/
	onRefresh:function(res){
		this.consoleRes = res;
		this.abCompViolationGrid.refresh(res);
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
	},

	/**
      * Public function: refresh the select document grid  when first tab is selected.
      */
	refreshGrid: function(){
		this.abCompViolationGrid.refresh();
		hideEmptyColumnsByPrefix(this.abCompViolationGrid, "compliance_locations.");
    }

});
/**
*
* Compliance Violations Grid - Column report, used for:  
*
* 1.	Operational Report - Compliance Violations
* 2.	Other Management Reports and Charts 
*
* @author Zhang Yi
*/
var abCompViolationGridRptController = View.createController('abCompViolationGridRptController',
{
	parentController:null,
	
	openerView: null,
	
	afterInitialDataFetch:function(){
		var index = View.controllers.length;
		this.parentController = View.controllers.get(index-1);
		
		if(this.openerView && "report" ==this.openerView.mode && this.openerView.popUpRestriction){
			this.abCompViolationGrid.actions.get('doc').show(false);
			this.abCompViolationGrid.refresh(this.openerView.popUpRestriction);
		}
	},
	
	afterViewLoad: function(){
		//if this view is opened as popup and report mode hide the filter action
		this.openerView = View.getOpenerView();
		if(this.openerView && "report" ==this.openerView.mode){
			hideActionsOfPanel(this.abCompViolationGrid, new Array("filter","hideTree") ,false);
		}
	},

	/**
	* Event Handler of action "Doc"
	*/
	abCompViolationGrid_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.abCompViolationGrid.restriction?this.abCompViolationGrid.restriction:" 1=1 ";
		setLocationFieldTitle(parameters);
		View.openPaginatedReportDialog("ab-comp-violation-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	 * Events Handler after form is refreshed:  Hide ¡°Compliance Location Information¡± section if regviolation.regloc_id IS NULL 
	 */
	abCompViolationGrid_afterRefresh: function(){
		if(this.isReportMode()){
			hideActionsOfPanel(this.abCompViolationGrid, new Array("addNew") ,false);
			this.abCompViolationGrid.gridRows.each(function(row) {
				row.actions.get("edit").setTitle(getMessage("View")); 
			});
		}
	},

	/**
	 * Events Handler for row action "View" in grid
	 */
	onEdit: function(){
		//construct restriction from row's key
		var vNumber = this.abCompViolationGrid.rows[this.abCompViolationGrid.selectedRowIndex]['regviolation.violation_num'];
		var res = "regviolation.violation_num="+vNumber;

		View.openDialog('ab-comp-violation-details.axvw',res);
	},
	
	/**
	 * If this view is opened as report mode reture true else return false. 
	 */
	isReportMode: function(){
		var flag = false;
		if((this.parentController && "report" ==this.parentController.mode)||
				this.openerView && "report" ==this.openerView.mode){
			flag = true;
		}
		
		return flag;
	}
});
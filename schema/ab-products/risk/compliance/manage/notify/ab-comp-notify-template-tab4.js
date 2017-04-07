/**
*
*  Added for 20.1 Compliance  :  'Assigned Compliance Requirement' view, the third tab view of "Manage Notification Templates", 
*
* @author Zhang Yi
*
*/
var assignedNotifyRequirementController = View.createController('assignedNotifyRequirementController',
{
	// parent tabs
	tabs: null,

	/**
	 * Events Handler: called when the view is loaded into tab firstly
	 */
	afterInitialDataFetch: function(){
		// store parent tabs
		this.tabs = View.parentTab.parentPanel;
		// when the view is loaded into the tab first time, refresh the grid with proper restriction from parent tabs
		this.onRefresh();
    },

	/**
	 * Refresh the grid when select change in first tab
	 */
	onRefresh:function(controller){
		// refresh the grid with selected notification template id
		var restriction = " regnotify.reg_requirement IS NOT NULL and regnotify.template_id='"+this.tabs.selectedTemplateId+"'";
		this.abCompRequirementNotifyGrid.refresh(restriction);
	},

	/**
	 * Events Handler for  row action "UnAssign" in grid: delete row's record
	 */
	onUnAssign:function(){

		//get row and its record, then delete it 
		var selectedIndex = this.abCompRequirementNotifyGrid.selectedRowIndex;
		this.abCompNotifyDS.deleteRecord(this.abCompRequirementNotifyGrid.gridRows.get(selectedIndex).getRecord());
		
		//refresh grid
		this.abCompRequirementNotifyGrid.refresh();

		//refresh grid in tab1
		var index = View.getOpenerView().controllers.length-1;
		var topController = View.getOpenerView().controllers.get(index);
		if(topController){
			topController.needRefreshSelectList=true;				
		}
	}
});
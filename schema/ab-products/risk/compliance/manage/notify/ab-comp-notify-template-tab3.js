/**
*
*  Added for 20.1 Compliance  :  'Assigned Compliance Program' view, the third tab view of "Manage Notification Templates", 
*
* @author Zhang Yi
*
*/
var assignedNotifyProgramController = View.createController('assignedNotifyProgramController',
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
		var restriction = " regnotify.reg_program IS NOT NULL and regnotify.reg_requirement IS NULL and regnotify.template_id='"+this.tabs.selectedTemplateId+"'";
		this.abCompProgramNotifyGrid.refresh(restriction);

	},

	/**
	 * Events Handler for  row action "UnAssign" in grid: delete row's record
	 */
	onUnAssign:function(){

		//get row and its record, then delete it 
		var selectedIndex = this.abCompProgramNotifyGrid.selectedRowIndex;
		this.abCompNotifyDS.deleteRecord(this.abCompProgramNotifyGrid.gridRows.get(selectedIndex).getRecord());
		
		//refresh grid
		this.abCompProgramNotifyGrid.refresh();
		
		//refresh grid in tab1
		var index = View.getOpenerView().controllers.length-1;
		var topController = View.getOpenerView().controllers.get(index);
		if(topController){
			topController.needRefreshSelectList=true;				
		}
	}

});
/**
* Added for 20.1 Compliance  : "Manage Notification Templates" view
*
* @author Zhang Yi
*/
var abCompManageNotifyTemplateController = View.createController('abCompManageNotifyTemplateController', {

	//variables indicates whether need to refresh Select Grid in first tab
	needRefreshSelectList: false, 

	//variables indicates whether need to refresh rest tabs
	needRefreshRestTab: false, 

	//variables indicates whether the sub tab is refreshed after select changed
	refreshedTab: {}, 

	//variables indicates whether need to refresh refresh rest tabs
	tabCtrl:{},

	//variables indicates current view is manage view or report view
	mode: 'manage',
	
	// This name is expected in some files for the tab controller
	sbfDetailTabs: null, 
	
    afterViewLoad: function(){
    this.sbfDetailTabs = this.notifyTemplateTabs;
		//store gloabl variable 'configureForAssignProgram' used for all other sub tab views
		//'configureForAssignProgram' is used when the 'Select Program' view is loaded in tab "Assign Compliance Program"
		this.notifyTemplateTabs.configureForAssignProgram=true;
 		this.notifyTemplateTabs.configureForAssignRequirement=true;
		this.notifyTemplateTabs.addEventListener('beforeTabChange', beforeTabChange);
		//this.notifyTemplateTabs.addEventListener('afterTabChange', afterTabChange);
   },
	
	afterInitialDataFetch: function(){
		this.enableRestTabs(false);
		this.initialTabRefreshed();
		this.initialTabCtrl();
	},

	onSelectChanged: function(){
		this.needRefreshRestTab = true;
		this.initialTabRefreshed();
	},


   enableRestTabs: function(enable){
		this.notifyTemplateTabs.enableTab('editTemplate',enable);
		this.notifyTemplateTabs.enableTab('assignedProgram',enable);
		this.notifyTemplateTabs.enableTab('assignedRequirement',enable);
		this.notifyTemplateTabs.enableTab('assignProgram',enable);
		this.notifyTemplateTabs.enableTab('assignRequirement',enable);
   },

   initialTabRefreshed: function(){
		this.refreshedTab['editTemplate'] = false;
		this.refreshedTab['assignedProgram'] = false;
		this.refreshedTab['assignedRequirement'] = false;
		this.refreshedTab['assignProgram'] = false;
		this.refreshedTab['assignRequirement'] = false;
   },

   initialTabCtrl: function(){
		this.tabCtrl['assignedProgram'] = 'assignedNotifyProgramController';
		this.tabCtrl['assignedRequirement'] = 'assignedNotifyRequirementController';
		this.tabCtrl['assignProgram'] = 'assignedNotifyProgramController';
		this.tabCtrl['assignRequirement'] = 'assignedNotifyRequirementController';
   }

});    
    
/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function beforeTabChange(tabPanel,newTab, currentTab){

	var controller = abCompManageNotifyTemplateController;
	var newTab = tabPanel.findTab(currentTab);

	if(newTab.isContentLoaded) {	
		if(newTab.name=="selectTemplate"){
			 //for first select tabs
			if(controller.needRefreshSelectList){
				 //refresh the select list in first tab
				var selectTab = tabPanel.findTab("selectTemplate");
				var selectControl = selectTab.getContentFrame().View.controllers.get('selectNotificationController');
				if(selectControl){
					selectControl.refreshGrid();
					controller.needRefreshSelectList = false;
				}
			}
		 } else if (newTab.name=='editTemplate'){
			if(controller.notifyTemplateTabs.addNew){
				if(controller.needRefreshRestTab && !controller.refreshedTab['editTemplate']){
					controller.notifyTemplateTabs.refreshTab('editTemplate');
					controller.refreshedTab[newTab.name] = true;
				}

				controller.enableRestTabs(false);
				controller.notifyTemplateTabs.enableTab('editTemplate',true);
			} else {
				if(controller.needRefreshRestTab && !controller.refreshedTab['editTemplate']){
					controller.enableRestTabs(true);
					newTab.refresh();
					controller.refreshedTab[newTab.name] = true;
				}
			}
		 } else { //for rest tabs except select and define
			if(controller.needRefreshRestTab && !controller.refreshedTab[newTab.name]){
				var ctrlId = controller.tabCtrl[newTab.name];
				var ctrl = newTab.getContentFrame().View.controllers.get(ctrlId);
				if(ctrl && ctrl.onRefresh){
					ctrl.onRefresh(controller);
				}
				controller.refreshedTab[newTab.name] = true;
			}
		 }
	} else {
		if(newTab.name=='editTemplate' && controller.needRefreshRestTab){
			controller.enableRestTabs(true);
			controller.notifyTemplateTabs.enableTab('editTemplate',true);
		}
		newTab.loadView();
		controller.refreshedTab[newTab.name] = true;
	}
}
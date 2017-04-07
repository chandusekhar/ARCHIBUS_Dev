/**
*
* Added for 20.1 Compliance  :   Select Notification Templates view,  loaded in first tab of  "Manage Notification Templates" view
*
* @author Zhang Yi
*/
var selectNotificationController = View.createController('selectNotificationController',
{
	//grid's initial restriction 
	consoleRes: " 1=1 ",

	//grid's initial restriction 
	perRes: "  (activity_id IS NULL OR activity_id = 'AbRiskCompliance') "+ 
		" AND template_id NOT IN (select template_id from regnotify where reg_requirement IS NULL AND reg_program IS NULL) ",

	//top level controller:  'abCompManageNotifyTemplateController'
	topController: null,

	//handler for sub menu item click 
	subMenuHandler:null,
	//array of sub menu item titles
	subMenuTitles: new Array(),		

	//parent tabs object
	tabs: null,
	
	// Assign Selected sub menu
	menu: null,

	//arrays of console fields, used  to generate restriction string
	consoleFieldsArraysForRes: new Array(['notify_templates.template_id'], ['notify_templates.notify_recipients','like'],['notify_templates.notify_cat'],['notify_templates.trigger_lead_seq'],['notify_templates.trigger_lead']),		
	
	afterViewLoad: function(){
		this.topController = View.getOpenerView().controllers.get(index);

		//initial sub menus inside action "Assign Selected"
		this.initialSubMenus();

		//set top controller
		var index = View.getOpenerView().controllers.length-1;
		this.topController = View.getOpenerView().controllers.get(index);
    },

	afterInitialDataFetch: function(){
		//set parent tabs object
		this.tabs = View.parentTab.parentPanel;
	},

	//initial sub menus inside action "Assign Selected"
	initialSubMenus: function(){

		//initial sub menu titles array
		this.subMenuTitles.push(getMessage("program"));
		this.subMenuTitles.push(getMessage("requirement"));

		var titles = this.subMenuTitles;
		var menuItems = [];
		for(var i=0; i<titles.length;i++){
			menuItems.push({
				text: titles[i],
				handler: this.onAssignSelectedButtonPush
			});
		}

		this.menu = new Ext.menu.Menu({
			items: menuItems
		});

		//attach sub menu event to action object
	  var titleObj = Ext.get('assignSelected');
    titleObj.on('click', this.showSubMenu, this, this);
	},

	//show sub menus of clicked action button on title bar
	showSubMenu: function(e, item){
		this.menu.showAt(e.getXY());
	},

	/**
	 * Events Handler for 'Show' action on console 
	 */
	abCompNotificationConsole_onShow: function(){
		//get string format restriction from console
		this.consoleRes = getRestrictionStrFromConsole(this.abCompNotificationConsole, this.consoleFieldsArraysForRes);
		
		this.abCompNotificationGrid.refresh(this.consoleRes);
    },


	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.perRes+" and "+ this.consoleRes;
		parameters.yes = getMessage('yes');
		parameters.no = getMessage('no');
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notify-template-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	 * Events Handler for 'Add New' action on grid 
	 */
	abCompNotificationGrid_onAddNew: function(){
		//get string format restriction from console
		this.tabs.addNew=true;
		this.topController.onSelectChanged();
		this.tabs.selectTab("editTemplate",null,true,true,null);
		View.getOpenerView().setTitle(getMessage("addNewTitle"));
    },

	/**
	 * Events Handler of sub menus of "Assign Selected" action is clicked
	 */
	onAssignSelectedButtonPush: function(menuItemId){
		var controller = selectNotificationController;
		var grid = controller.abCompNotificationGrid;
		//if none rows are selected, show alert message
		if(grid.getSelectedRows().length==0){
			View.showMessage(getMessage("noneSelected"));
			return;
		}
		// Hide the menu before switching tabs
		controller.menu.hide();
		
		//if current clicked sub menu is "Assign To Programs"
		if(getMessage("program")==menuItemId.text){
			//select 'Assign  Compliance Programs' tab and disable all other tabs
			controller.tabs.selectedTemplateIds = grid.getFieldValuesForSelectedRows("notify_templates.template_id");
			controller.tabs.setAllTabsEnabled(false);
			controller.tabs.selectTab("assignProgram");
			controller.tabs.showTab("assignProgram",true);
		}
		else{
				//select 'Assign  Compliance Requirements' tab and disable all other tabs
				controller.tabs.selectedTemplateIds = grid.getFieldValuesForSelectedRows("notify_templates.template_id");
				controller.tabs.setAllTabsEnabled(false);
				controller.tabs.selectTab("assignRequirement");
				controller.tabs.showTab("assignRequirement",true);
		}
    },

	/**
	 * Refresh grid of first Tab when  there are any changes in Edit form of second Tab
	 */
	refreshGrid: function(){		
		this.abCompNotificationGrid.refresh();
    },

	/**
	 * Refresh grid of first Tab when  there are any changes in Edit form of second Tab
	 */
	onSelect: function(){
		this.tabs.selectedTemplateId = this.abCompNotificationGrid.rows[this.abCompNotificationGrid.selectedRowIndex]['notify_templates.template_id'];
		this.tabs.addNew = false;
		View.getOpenerView().setTitle(getMessage("originalTitle")+": "+this.tabs.selectedTemplateId);
		if(this.topController){
			this.topController.onSelectChanged();
		}
	},

	/**
	 * Events Handler for 'View Default Notifications' action button
	 */
	abCompNotificationGrid_onDefault:function(){
		var perRes = "  template_id IN (select template_id from regnotify where reg_program IS NULL) ";
		View.openDialog('ab-comp-notify-template-default.axvw',perRes, false);
	}
});
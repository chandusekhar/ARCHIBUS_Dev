/**
* Added for 20.1 Compliance 
*
* This view is used for three places: 
*	1. PNAV taks: Define Notification Templates
*	2. Opened as a pop-up dialog for "View Default Notification"
*	3. Load to sub-tab of some manage views
*
* @author Zhang Yi
*/
var defNotificationController = View.createController('defNotificationController',
{
	//sign indicate if  view is opened by clicking "View Default Notifications"
	isView:false,

	//sign indicate if  view is loaded in sub tab of Manage views
	isLoadInTab:false,

	//restriction from parent view or tabs
	gridRestriction: ' 1=1 ',
	
	//restriction from parent view or tabs
	parentTabs:null,

	afterInitialDataFetch: function(){
		//set default title of grid
		this.abCompNotificationGrid.setTitle(getMessage("original"));

		//if this view is opened by other views
		var controller = View.getOpenerView().controllers.get(0);
		if(controller&&View.getOpenerView().controllers.length>1){
			controller = View.getOpenerView().controllers.get(1);
		}

		//if view is not loaded from PNAV task  'Define Notification Tempalte' 
		if("defNotificationController"!=controller.id && "navigator"!=controller.id){
			//if current view loads from a selected tab
			if(View.parentTab){
				this.configureForLoadInTab();
				if (!View.parentTab.isContentLoaded) {
					this.abCompNotificationFrom.show(false);
				}
				this.isLoadInTab = true;
				showHideColumns(this.abCompNotificationGrid,"notify_templates.isDefault",true);
			}
		} else {
			this.configureForDefine();
 			this.abCompNotificationFrom.show(false);
				showHideColumns(this.abCompNotificationGrid,"notify_templates.isAssigned",true);
		}
		//call API grid.update() to make the multiple selection check-box column hiden for now.
		this.abCompNotificationGrid.update();
		this.localizeYesNo();
		this.abCompNotificationGrid.refresh();
    },

  // Hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
  afterTabChange: function(){    	
    this.abCompNotificationFrom.show(false);
	},

	abCompNotificationGrid_afterRefresh: function(){
		// On View Load, Select the checkbox for all rows: 
		this.abCompNotificationGrid.gridRows.each(function(row) {
			if(defNotificationController.parentTabs){
				var isCheck = row.getRecord().getValue("notify_templates.isCheck");
				if(isCheck==1){
					row.select();
				}
			}
			// where template_id is in (SELECT template_id FROM regnotify WHERE regrequierment_id IS NULL AND reg_program IS NULL)
			var isEmpty = row.getRecord().getValue("notify_templates.isEmpty");
			if (isEmpty==1) {
					row.select();
			}
		}); 					
    },

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.gridRestriction?this.gridRestriction:" 1=1 ";
		parameters.yes = getMessage('yes');
		parameters.no = getMessage('no');
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notify-template-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	 * when row action title of clicked row is 'View', set a sign for showing form in report mode
	 */
	setIfView: function(){
		var grid = this.abCompNotificationGrid;
		if(grid.gridRows.get(grid.selectedRowIndex).getFieldValue("notify_templates.isView")==1){
			this.isView = true;
		} else{
			this.isView = false;
		};
	},

	/**
	 * Events Handler for 'Save Selected' action button
	 */
	abCompNotificationGrid_onSaveSelected:function(){
		//TODO:Reconcile ¡°default records¡± in regnotify (select template_id from regnotify where regrequierment_id is null and reg_program is null) with selected records:
		//Remove ¡°default records¡± from regnotify which are not selected, and add records to regnotify which are selected and don¡¯t already exist in regnotify.
		//Call WFR assignNotifyTemplates.  If no error, display temporary message (like when Saving): ¡°Default Notification Templates have been saved
		var selectedIds= new Array();
		var selectedRows = this.abCompNotificationGrid.getSelectedRows();
		if(selectedRows && selectedRows.length>0){
			for(var i=0; i<selectedRows.length;i++){
				selectedIds.push(selectedRows[i]["notify_templates.template_id"]);
			}
		} 

		var key = {};
		var assignTo = "program";
		if(this.parentTabs){
            key = {
                reg_program: this.parentTabs.regprogram,
                regulation: this.parentTabs.regulation
            };
			if(this.parentTabs.regrequirement){
				assignTo = "requirement";
				key['reg_requirement'] = this.parentTabs.regrequirement;
			}
		}
		try{
			var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-assignNotifyTemplates', selectedIds, assignTo,key);

			//kb#3036291: In Notification Templates tab of Manage Programs, Requirements,  Change confirmation message after clicking Save Selections to
			// "Notification Template assignments have been saved." 
			if(this.parentTabs){
				View.showMessage(getMessage("saved"));
			} 
			//Keep original confirm message for default. 
			else {
				View.showMessage(getMessage("savedDefault"));
			}

			this.abCompNotificationGrid.refresh();

		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},

	/**
	 * Events Handler for 'View Default Notifications' action button
	 */
	abCompNotificationGrid_onDefault:function(){
		// this restriction is used to when 'View Default Notifications' is clicked in 'Define Notification Template' view or  in sub tab of ' Manage Programs' view.
		var perRes = "  template_id IN (select template_id from regnotify where reg_program IS NULL) ";

		// this restriction is used to when 'View Default Notifications' is clicked in sub tab of ' Manage Requirements' view.
		if( this.parentTabs && this.parentTabs.regrequirement){
			 perRes = " template_id IN (select template_id from regnotify where reg_program IS NULL OR "+
			 " ( reg_requirement is NULL and regulation='"+this.parentTabs.regulation+"' and reg_program='"+this.parentTabs.regprogram+"')) ";
		}

		View.openDialog('ab-comp-notify-template-default.axvw',perRes, false);
	},

	/**
	 * For "View Default Notifications", hide all actions, remove multiple selection check box column and change title of grid
	 */
	configureGridForViewDefaultNotification:function(){
		showAllActionsOfPanel(this.abCompNotificationGrid,false);
		showHideColumns(this.abCompNotificationGrid,"multipleSelectionColumn",true);
		this.abCompNotificationGrid.setTitle(getMessage("defGrid"));
	},

	/**
	 * For Load in tab
	 */
	configureForLoadInTab:function(){

				var tabs = View.parentTab.parentPanel;
				this.parentTabs = tabs;
				//if current view loads from a selected tab, then  use parent restriction to refresh the grid
				var restriction=" 1=1 "; 
				this.abCompNotificationGrid.addParameter("refCountRes", " (select count(1) from regnotify where  regnotify.template_id=notify_templates.template_id ) ");
				var progSql =  " regulation='"+tabs.regulation+"' AND reg_program ='"+tabs.regprogram+"' ";
				if(tabs.regrequirement){
					this.abCompNotificationGrid.setTitle(getMessage("forReq"));
					this.abCompNotificationGrid.setInstructions(getMessage("instReqText"));				
					var reqSql = progSql + " AND reg_requirement ='"+tabs.regrequirement+"' ";
					var checkRes =  reqSql;
					var perRes = " template_id  NOT IN  ( select template_id from regnotify where reg_program IS NULL OR ( reg_requirement IS NULL AND "+progSql+") )";
					var viewRes = " template_id NOT IN  ( select template_id from regnotify where regnotify.template_id=notify_templates.template_id AND  "+reqSql+") ";
				} else {
					this.abCompNotificationGrid.setTitle(getMessage("forProgram"));				
					this.abCompNotificationGrid.setInstructions(getMessage("instProgText"));				
					var perRes = " template_id  NOT IN  ( select template_id from regnotify where reg_program IS NULL ) ";
					var checkRes = " reg_requirement IS NULL AND "+progSql+" ";
					var viewRes = " template_id NOT IN  ( select template_id from regnotify where regnotify.template_id=notify_templates.template_id AND  "+progSql+") ";
				}
				this.abCompNotificationGrid.addParameter("checkRes", checkRes);
				this.abCompNotificationGrid.addParameter("perRes", perRes);
				this.abCompNotificationGrid.addParameter("viewRes", viewRes);
				//store restriction of grid
				this.gridRestriction = perRes;
	},

	/**
	 * For Load From PNAV as define
	 */
	configureForDefine:function(){
		var resSql =  "template_id NOT IN (select template_id from regnotify where reg_program IS NOT NULL) ";
		this.abCompNotificationGrid.addParameter("perRes", resSql);
		this.abCompNotificationGrid.addParameter("checkRes", "  reg_program IS  NULL ");
		this.abCompNotificationGrid.addParameter("viewRes", " 1=0 ");
		this.abCompNotificationGrid.addParameter("refCountRes", "0");
	    this.abCompNotificationGrid.actions.get("default").show(false);
		//store restriction of grid
		this.gridRestriction = resSql;
	},

	/**
	 * Private function: localize the values show in column 'Assigned?' of grid
	 */
	localizeYesNo:function(){
		this.abCompNotificationGrid.addParameter("yes",getMessage('yes'));
		this.abCompNotificationGrid.addParameter("no",getMessage('no'));
	}
});

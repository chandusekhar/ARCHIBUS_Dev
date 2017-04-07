/**
*
* Added for 20.1 Compliance : Manage Compliance Notifications view
*
* @author Zhang Yi
*/
var notificationTabController = View.createController('notificationTabController',
{

	//restriction of console
	consoleRes: " 1=1 ", 

	//variables indicates current view is manage view or report view
	mode: 'report', 

	mainController:null,

	//restriction from select  grid in first tab
	selectRes: " 1=1 ", 

	/**
	* @inherit.
	*/
	afterInitialDataFetch:function(){
		
		//get common event controller as parent controller
		this.mainController = View.getOpenerView().controllers.get(0);
		if(this.mainController.event){
			this.selectRes = "notifications.activity_log_id="+this.mainController.event;
			this.abCompNotificationGrid.refresh(this.selectRes);
		}

		this.notificationTabs.enableTab("viewNotifyTemplate",false);

	},
  
	// Hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
	afterTabChange: function(){    	
		this.abCompNotificationForm.show(false);
	},

		
	/**
	* Event handler for afterRefresh of grid.
	*/
	abCompNotificationGrid_afterRefresh: function(){    	
		var grid = this.abCompNotificationGrid;
		grid.gridRows.each(function(row) {

			var record = row.getRecord();
			var status = record.getValue("activity_log.status");

			//If Event Status is in (completed, completed-v, closed), change Edit button title to ¡°View¡± 
			if( "COMPLETED"==status || "COMPLETED-V"==status || "CLOSED"==status ){
				row.actions.get("edit").setTitle(getMessage("View")); 
			}  
		});

		//if current view is load in a report
		if("report" ==this.mainController.mode){
			//change panel title for report
			grid.setTitle(getMessage("reportTitle"));

		} else{
			//change panel title for Manage view
			grid.setTitle(getMessage("manageTitle"));			
		}
	},


	/**
	* Event handler for action 'Save and Add New' of grid.
	*/
	abCompNotificationGrid_onAddNew: function() {
		this.notificationTabs.selectTab("editNotification");
		this.abCompNotificationForm.refresh(null, true);
		this.abCompNotificationForm.setFieldValue("notifications.activity_log_id", this.mainController.event);
	},

	/**
	* Event handler for afterRefresh of form.
	*/
	abCompNotificationForm_afterRefresh: function() {
		//refresh notificaiton template tab
		var templateId = this.abCompNotificationForm.getFieldValue("notifications.template_id");
		if(templateId){
			var restriction = "notify_templates.template_id='"+templateId+"'";
			this.notificationTabs.enableTab("viewNotifyTemplate",true);
			var templateTab = this.notificationTabs.findTab("viewNotifyTemplate");
			templateTab.restriction = "notify_templates.template_id='"+templateId+"'";
		} 
		else {
			this.notificationTabs.enableTab("viewNotifyTemplate",false);
		}

		//restore form
		this.setReportMode(false);

		//determine if need to set form to report mode
		if(!this.abCompNotificationForm.newRecord){
			var grid = this.abCompNotificationGrid;
			if(grid.selectedRowIndex<0) return;

			//If Event Status is in (completed, completed-v, closed), shows record in Panel 3 in report or read-only mode, hide actions 
			var status = grid.rows[grid.selectedRowIndex].row.getRecord().getValue("activity_log.status");
			if( "COMPLETED"==status || "COMPLETED-V"==status || "CLOSED"==status ){
				this.setReportMode(true);
			}
		}

	},

	/**
	* Private function: for report mode initialize actions, fields of form.
	*
	* @param isReport
	*/
	setReportMode:function(isReport){
		//hiden panel's action
		hideActionsOfPanel(this.abCompNotificationForm, new Array("save", "delete", "cancel"),!isReport);
		//enable or disable fields of form.
		this.abCompNotificationForm.enableField("notifications.is_active",!isReport);
		this.abCompNotificationForm.enableField("notifications.template_id",!isReport);
	},

	/**
     * Private Function: called to refresh the grid when there are restriction condition changes
     */
	onRefresh:function(){
		if(this.mainController.event){
			this.abCompNotificationForm.show(false);
			this.selectRes = "notifications.activity_log_id="+this.mainController.event;
			this.abCompNotificationGrid.refresh(this.selectRes);
		}
	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc: function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.selectRes;
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notification-paginate-rpt.axvw" ,null, parameters);
	}
});


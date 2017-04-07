/**
*
* Added for 20.2 Compliance, used for four View and Reports: 
*	
*	1. Manage Compliance Event Notifications 
*	2. Compliance Event Notifications report
*
* @author Zhang Yi
*/
var abCompNotificationGridController = View.createController('abCompNotificationGridController',
{

	//parent controller
	mainController:null,
	
	/**
	 * @inherit
	 */
	afterInitialDataFetch:function(){
		
		//initial parent controller
		var index = View.controllers.length;
		this.mainController = View.controllers.get(index-1);

		//update the grid after grid is refreshed and then perform some structure changes happened in event handler 'afterRefresh' 
		this.abCompNotificationGrid.update();
	},

	/**
	 * Events Handler:  configure the row actions and titles of grid 
	 */
	abCompNotificationGrid_afterRefresh: function(){

		if(!this.mainController){
			var index = View.controllers.length;
			this.mainController = View.controllers.get(index-1);
		}

		//define a variable since in grid's each function 'this.mainController' is not recognized 
		var mainCtrl = this.mainController;
		var grid = this.abCompNotificationGrid;
		//loop through each row of grid
		grid.gridRows.each(function(row) {
			// Event Status is in (completed, completed-v, closed), change Edit button title to ¡°View
			var status = row.getRecord().getValue("activity_log.status");
			if ("COMPLETED-V"==status || "COMPLETED"==status || "CLOSED"==status ||  ("report" ==mainCtrl.mode) ) {
				var action = row.actions.get("edit");
				if(action){
					action.setTitle(getMessage("view")); 
				}
			}
		});

		//if current view is load in a report
		if("report" ==mainCtrl.mode){
			//change panel title for report
			grid.setTitle(getMessage("reportTitle"));

		} else{
			//change panel title for Manage view
			grid.setTitle(getMessage("manageTitle"));			
		}

	},

	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc: function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.mainController.consoleRes;
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notification-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event handler for row action "Edit"/"View": Show Notification Tab.
	*/
	abCompNotificationGrid_edit_onClick: function(row) {
		if(this.mainController){
			//construct restriction from clicked row
			var notifyId = row.getRecord().getValue("notifications.notify_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause("notifications.notify_id", notifyId, '=');

			//if current clicked button is "View" then set "report" mode; else set "manage" mode
			var status = row.getRecord().getValue("activity_log.status");
			if ("COMPLETED-V"==status || "COMPLETED"==status || "CLOSED"==status  ) {
				this.mainController.mode="report";
			} else {
				this.mainController.mode="manage";
			}

			//select and refresh Notification Tab by restricting with clicked row 
			this.mainController.notificationTabs.selectTab("editNotification",restriction);
			//enable rest two sub tabs
			this.mainController.notificationTabs.enableTab("viewEvent",true);
			this.mainController.notificationTabs.enableTab("viewNotifyTemplate",true);
		}
	}
});
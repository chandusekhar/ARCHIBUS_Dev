
var abReportNotificationsController = View.createController('abReportNotificationsController', {

	abCompNotificationGrid_onView: function(row){
		
		var record = row.getRecord();
		var id = record.getValue("notify_templates.template_id");
		
		if (valueExistsNotEmpty(id)) {
			var restriction = {
					'notify_templates.template_id': id
			};
			Ab.view.View.openDialog('ab-comp-notify-template-column-rpt.axvw', restriction, false, 0, 0, 800, 400);  
		}	
	},
	
	/**
	* Event handler for "Doc" action of grid.
	*/
	abCompNotificationGrid_onDoc : function() {
		//set restriction parameters of paginate report
		var parameters = {};
		parameters.consoleRes = this.abCompNotificationGrid.restriction?this.abCompNotificationGrid.restriction:"1=1";;
		parameters.yes = getMessage('yes');
		parameters.no = getMessage('no');
		//open paginated report
		View.openPaginatedReportDialog("ab-comp-notify-template-paginate-rpt.axvw" ,null, parameters);
	},

});


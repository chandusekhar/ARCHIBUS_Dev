var controller = View.createController('abExCalendarActivityDialogController',{
	
	afterInitialDataFetch: function(){
		if(this.gridPanel.newRecord){
			var rest = this.gridPanel.restriction;
			
			if(valueExistsNotEmpty(rest['activity_log.date_scheduled'])){
				this.gridPanel.setFieldValue('activity_log.date_scheduled',rest['activity_log.date_scheduled']);
			}
			if(valueExistsNotEmpty(rest['activity_log.date_scheduled_end'])){
				this.gridPanel.setFieldValue('activity_log.date_scheduled_end',rest['activity_log.date_scheduled_end']);
			}
		}
		
	}
	
});

function refreshCalendar(){
	View.getOpenerView().controllers.get('showCalendarActivity').consolePanel_onFilter();
}
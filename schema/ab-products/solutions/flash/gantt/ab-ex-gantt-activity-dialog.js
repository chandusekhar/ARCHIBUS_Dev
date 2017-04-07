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
		
	},
	
	gridPanel_onSave: function(){
		this.gridPanel.save();
		var isoDateStart = getDateWithISOFormat(this.gridPanel.getFieldElement('activity_log.date_scheduled').value);
		var isoDateEnd = getDateWithISOFormat(this.gridPanel.getFieldElement('activity_log.date_scheduled_end').value);
		View.getOpenerView().controllers.get('showCalendarActivity').updateGanttItem(this.gridPanel.getFieldValue('activity_log.activity_log_id'),
				isoDateStart,isoDateEnd,this.gridPanel.getFieldValue('activity_log.action_title'));
		View.closeThisDialog();
	}


	
});

function refreshGantt(){
	View.getOpenerView().controllers.get('showCalendarActivity').consolePanel_onFilter();
}
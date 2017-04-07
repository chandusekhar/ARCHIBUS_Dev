

var helpdeskRequestShowHistoryController = View.createController("helpdeskRequestShowHistoryController",{
	
	afterViewLoad: function(){
	},
	
	afterInitialDataFetch: function(){
		//this.request_form.show(false,false);
		//this.panel_location.show(false,false);
		//this.panel_equipment.show(false,false);
	},
	
	
	request_form_afterRefresh: function(){
	}
});

function refreshDetailPanels() {
	var panel = View.panels.get("request_form");
	
	if(panel.containsField("activity_log.activity_type") != null) {
		var act_type = panel.getFieldValue("activity_log.activity_type");
		var quest = new AFM.questionnaire.Quest(act_type,true);
		quest.showQuestions('request_form');
	}	
}	

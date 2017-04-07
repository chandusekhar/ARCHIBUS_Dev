/**
 * Controller for the form enable or disable actions example.
 * Zhang Yi
 */
var abExFormEnableFieldActionsCtrl = View.createController('abExFormEnableFieldActionsCtrl', {

	afterInitialDataFetch:function(){
		//this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", false);
	},

	abExFormEnableFieldActions_form_onEnableFieldActions: function(){
		// enable the select-value button
		this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", true);
		
		//this.abExFormEnableFieldActions_form.actions.get("enableFieldActions").enable(false);
		//this.abExFormEnableFieldActions_form.actions.get("disableFieldActions").enable(true);

		//set form title 
		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldActionEnabled") );
	},
	
	abExFormEnableFieldActions_form_onDisableFieldActions: function(){
		// disable the select-value button
		this.abExFormEnableFieldActions_form.enableFieldActions("activity_log.location_id", false);

		//this.abExFormEnableFieldActions_form.actions.get("disableFieldActions").enable(false);
		//this.abExFormEnableFieldActions_form.actions.get("enableFieldActions").enable(true);

		//set form title 
		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldActionDisabled") );
	},

    abExFormEnableFieldActions_form_onEnableField: function(){
   		// enable the field and its actions
   		this.abExFormEnableFieldActions_form.enableField("activity_log.location_id", true);

   		//this.abExFormEnableFieldActions_form.actions.get("enableField").enable(false);
   		//this.abExFormEnableFieldActions_form.actions.get("disableField").enable(true);

   		//set form title
   		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldEnabled") );
   	},

   	abExFormEnableFieldActions_form_onDisableField: function(){
   		// disable the field and its actions
   		this.abExFormEnableFieldActions_form.enableField("activity_log.location_id", false);
        // KB 3040750: displaying a field after disabling it should keep field actions disabled
        this.abExFormEnableFieldActions_form.showField("activity_log.location_id", true);

   		//this.abExFormEnableFieldActions_form.actions.get("disableField").enable(false);
   		//this.abExFormEnableFieldActions_form.actions.get("enableField").enable(true);

   		//set form title
   		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldDisabled") );
   	},
   	
    abExFormEnableFieldActions_form_onShowField: function(){
   		// show the field, preserve enabled/disabled status of select value button
   		this.abExFormEnableFieldActions_form.showField("activity_log.location_id", true);
   		this.abExFormEnableFieldActions_form.showField("activity_log.date_required", true);

   		//this.abExFormEnableFieldActions_form.actions.get("showField").enable(false);
   		//this.abExFormEnableFieldActions_form.actions.get("hideField").enable(true);

   		//set form title
   		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldShown") );
   	},

   	abExFormEnableFieldActions_form_onHideField: function(){
   		// hide the field and its actions
   		this.abExFormEnableFieldActions_form.showField("activity_log.location_id", false);
   		this.abExFormEnableFieldActions_form.showField("activity_log.date_required", false);

   		//this.abExFormEnableFieldActions_form.actions.get("hideField").enable(false);
   		//this.abExFormEnableFieldActions_form.actions.get("showField").enable(true);

   		//set form title
   		this.abExFormEnableFieldActions_form.setTitle(getMessage("fieldHidden") );
   	}
   	
});
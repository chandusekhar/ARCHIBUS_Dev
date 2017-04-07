var planTypesGroupDialogController = View.createController('planTypesGroupDialogController', {
	
	/**
	 * The callback of the save action.
	 */
	callback: null,
	
	/**
	 * Option value user selected last time.
	 */
	initialOptionValue: null,

	/**
	 * We set the value for the plan types select list.
	 */
	afterInitialDataFetch: function() {
		var dataSources = View.dataSources.get('planTypeGroupsDs');
		var records = dataSources.getRecords();
		this.addPlanTypesOption(records);
		this.setSelectedOption();
	},
	
	/**
	 * Plan types select option value.
	 */
	addPlanTypesOption: function(records) {
		var planTypeSelect = jQuery('#planTypesSelectList');
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			var planType = record.getValue('plantype_groups.plan_type');
			var title = record.getValue('active_plantypes.title');
			planTypeSelect.append("<option value='" + planType + "'>" + title + "</option>");
		}
	},
	
	/**
	 * Handle the event when the user click Save action.
	 */
	planTypesGroupPanel_onSavePlanType: function() {
		var planType = jQuery('#planTypesSelectList').find('option:selected').val();
		planType = jQuery.trim(planType);
		View.closeThisDialog();
		if(this.callback) {
			this.callback(planType);
		}
	},

	/**
	 * Initially select the option that previously selected by user.
	 */
	setSelectedOption: function() {
		// get dropdown list by itemSelectId
		var itemSelect = $("planTypesSelectList");
		// select given value as selected in dropdown list 
		var index = 0;
		for (var i = 0; i < itemSelect.options.length; i++) {
			var option = itemSelect.options[i];
			if(option.value==this.initialOptionValue){
				index = i;
				break;
			}
		}
		//set  value to dropdown list
		itemSelect.options[index].setAttribute('selected', true);
	}
});
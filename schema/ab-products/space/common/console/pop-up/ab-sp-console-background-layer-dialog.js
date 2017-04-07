var backgroundLayerSelectController = View.createController('backgroundLayerSelectController', {
	
	/**
	 * The callback function when the user saves background layer.
	 */
	callback: null,
	
	/**
	 * Option value user selected last time.
	 */
	initialOptionValue: null,

	/**
	 * Rule suffix json array.
	 */
	ruleSuffixArray:{},
	
	/**
	 * We set the value for the plan types select list.
	 */
	afterInitialDataFetch: function() {
		var dataSources = View.dataSources.get('afmDwgPubDs');
		var records = dataSources.getRecords();
		this.addBackgroundLayerOption(records);
		this.setSelectedOption();
	},
	
	/**
	 * Plan types select option value.
	 */
	addBackgroundLayerOption: function(records) {
		var backgroundLayerSelect = jQuery('#backgroundSelectList');
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			var title = record.getValue('afm_dwgpub.title');
			var ruleCode = record.getValue('afm_dwgpub.rule_id');
			var ruleSuffix = record.getValue('afm_dwgpub.rule_suffix');
			this.ruleSuffixArray[ruleCode] = ruleSuffix;
			backgroundLayerSelect.append("<option value='" + ruleCode + "'>" + "<span>" + title + "</span>" + "</option>");
		}
	},
	
	/**
	 * Handle the event when the user click Save action.
	 */
	backgroundLayerPanel_onSaveBackgroundLayer: function() {
		var backgroundLayerTitle = jQuery('#backgroundSelectList').find('option:selected').text();
		var ruleId = jQuery("#backgroundSelectList").val();
		var parameters = {};
		parameters['title'] = backgroundLayerTitle;
		parameters['rule_id'] = ruleId;
		parameters['rule_suffix'] = this.ruleSuffixArray[ruleId];
		View.closeThisDialog();
		if(this.callback) {
			this.callback(parameters);
		}
	},

	/**
	 * Initially select the option that previously selected by user.
	 */
	setSelectedOption: function() {
		// get dropdown list by itemSelectId
		var itemSelect = $("backgroundSelectList");
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
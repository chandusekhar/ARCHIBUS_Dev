var abAllocSpReqCtrl = View.createController('abAllocSpReqCtrl', {
	
	callback: null,
	
	sbLevel: '',

	scenarioId: '',
	scenarioName: '',
	
	asOfDate: '',

	separator: '- \u200C',
	
	multipleValueSeparator: Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
		
	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callback = View.parameters.callback;
			this.sbLevel =  View.parameters.sbLevel;
			this.scenarioId = View.parameters.scenarioId;
			this.scenarioName = View.parameters.scenarioName;
			this.asOfDate = View.parameters.asOfDate;
			this.unitTitle = View.parameters.unitTitle;
		}
	},
	
	afterInitialDataFetch: function(){
		for (var i=1; i<=12; i++ ) {
			this.abAllocSpReq_form.showField("period"+i, false);
			this.abAllocSpReq_form.showField("p"+i+"DateStart", false);
			this.abAllocSpReq_form.showField("p"+i+"EventName", false);
		}
		
		//kb#3050025: set the 'Space Requirement Name' to be read-only, while enable its select-value action. 
        this.abAllocSpReq_form.enableField("gp.name", false);
		this.abAllocSpReq_form.enableFieldActions("gp.name", true);
	},
	
	showPeriodsBySbName: function(sbName){
		var record = this.abAllocSpReqSb_ds.getRecord("sb.sb_name='"+sbName+"'");
		if (record) {
			for (var i=1; i<=12; i++ ) {
				var hasPeriodValue = record.getValue("sb.period"+i+"HasValue");
				var isShow = hasPeriodValue==1 ? true : false;
				this.abAllocSpReq_form.showField("period"+i, isShow);
				this.abAllocSpReq_form.showField("p"+i+"DateStart", isShow);
				this.abAllocSpReq_form.showField("p"+i+"EventName", isShow);
			}
			$('period1').checked = true;
		}
	},
		
	abAllocSpReq_form_onSubmit: function(){
		var controller = this;
		if (this.canSave()) {
			try{
				var periodsData=[];
				for (var i=1; i<=12; i++ ) {
					var isChecked = $('period'+i).checked;
					if (isChecked) {
						var period = {};
						period['periodIndex'] = i;
						period['eventName'] = controller.abAllocSpReq_form.getFieldValue("p"+i+"EventName");
						period['dateStart'] = controller.abAllocSpReq_form.getFieldValue("p"+i+"DateStart");
						periodsData.push(period);
					}
				}

				var sbName = controller.abAllocSpReq_form.getFieldValue('gp.name');	
				
				var result = Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-allocateGroupFromSpaceRequirements', sbName, controller.scenarioId, controller.asOfDate, periodsData, controller.unitTitle);
				if(result.code == 'executed'){
					if(valueExists(this.callback)){
						this.callback(controller.abAllocSpReq_form.getFieldValue("p1DateStart"));
					}
					View.closeThisDialog();
					return true;
				}
				
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	},

	// validate form settings
	canSave: function(){
		var canSave = true;
		this.abAllocSpReq_form.clearValidationResult();
		var fields = ['gp.name'];
		for(var i=0; i < fields.length; i++){
			var value = this.abAllocSpReq_form.getFieldValue(fields[i]);
			if(!valueExistsNotEmpty(value)){
				canSave = false;
				this.abAllocSpReq_form.addInvalidField(fields[i], '');
				this.abAllocSpReq_form.validationResult.valid = false;
				this.abAllocSpReq_form.validationResult.message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			}
		}

		for (var i=1; i<=12; i++ ) {
			var isChecked = $('period'+i).checked;
			if (isChecked) {
				var eventName = this.abAllocSpReq_form.getFieldValue("p"+i+"EventName");
				if(!valueExistsNotEmpty(eventName)){
					canSave = false;
					this.abAllocSpReq_form.addInvalidField("p"+i+"EventName", '');
					this.abAllocSpReq_form.validationResult.valid = false;
					this.abAllocSpReq_form.validationResult.message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				}
			}
		}

		if(!canSave){
			this.abAllocSpReq_form.displayValidationResult();
		}
		return canSave;
	},

	/**
	 * Prompt the user to select a Space Requirements record that has the same level as the scenario (sb.level  = portfolio_scenario.scn_level).
	 */
	selectSbName: function(){
		var restriction = "sb.sb_level='"+this.sbLevel+"'";
		restriction = restriction+ " and ( sb.sb_name !='"+this.scenarioName+"'"; 
		restriction = restriction+ " or sb.sb_level != 'fg') "; 
		View.selectValue("abAllocSpReq_form",getMessage('sbNameTitle'),["gp.name"],"sb",["sb.sb_name"],["sb.sb_name","sb.sb_level","sb.sb_desc"],restriction, "afterSelectSbName" , false , true ,null , 800, 600);
	}
});

/**
* Action Lisenter of custom select value command for field "Event Id"
*/
function afterSelectSbName(fieldName, selectedValue, previousValue){

	var ctrl = abAllocSpReqCtrl;
	if ( fieldName == "gp.name" ) {
		if ( selectedValue ) {
			//set location form properly
			ctrl.showPeriodsBySbName(selectedValue);
		} else {
			//hide all period fields
		}
	}
}

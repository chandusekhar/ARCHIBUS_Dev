/**
 * @author Song
 */

var abRiskMsdsDefPropController = View.createController('abRiskMsdsDefPropController', {
	/**
	 * This event handler is called by the view after the view loading and
	 * initial data fetch for all panels is complete.
	 */
	afterInitialDataFetch : function() {
		this.fieldsControl();
	},
	/**
	 * private method
	 */
	fieldsControl: function(){
		showOrHiddenMin("msds_data.voc_operator","msds_data.voc_low");
		showOrHiddenMin("msds_data.density_operator","msds_data.density_low");
		showOrHiddenMin("msds_data.vapor_density_operator","msds_data.vapor_density_low");
		showOrHiddenMin("msds_data.specific_gravity_operator","msds_data.specific_gravity_low");
		
		this.operatorOnChange("msds_data.voc_operator","msds_data.voc_low");
		this.operatorOnChange("msds_data.density_operator","msds_data.density_low");
		this.operatorOnChange("msds_data.vapor_density_operator","msds_data.vapor_density_low");
		this.operatorOnChange("msds_data.specific_gravity_operator","msds_data.specific_gravity_low");
	},
	/**
	 * private method
	 */
	operatorOnChange: function(operator,low){
		var pct_operator = this.abRiskMsdsDefMsdsPhysicalForm.getFieldElement(operator);
		pct_operator.onchange=function(){
			if(pct_operator.value!="Range"){
				abRiskMsdsDefPropController.abRiskMsdsDefMsdsPhysicalForm.showField(low, false);
			}else{
				abRiskMsdsDefPropController.abRiskMsdsDefMsdsPhysicalForm.showField(low, true);
			}
		}
	},

	/**
	 * checks boundaries of field values before saving
	 */	
  abRiskMsdsDefMsdsPhysicalForm_beforeSave: function(){
  	this.checkRangeValues('msds_data.voc_low', 'msds_data.voc_high', 'msds_data.voc_operator', 'msds_data.voc_units');
  	this.checkRangeValues('msds_data.density_low', 'msds_data.density_high', 'msds_data.density_operator', 'msds_data.density_units');
  	this.checkRangeValues('msds_data.vapor_density_low', 'msds_data.vapor_density_high', 'msds_data.vapor_density_operator', 'msds_data.vapor_density_units');
  	this.checkRangeValues('msds_data.specific_gravity_low', 'msds_data.specific_gravity_high', 'msds_data.specific_gravity_operator', '');
  	
  	this.checkFieldPercentOrNegative('msds_data.voc_high', 'msds_data.voc_units');
  	this.checkFieldPercentOrNegative('msds_data.density_high', 'msds_data.density_units');
  	this.checkFieldPercentOrNegative('msds_data.vapor_density_high', 'msds_data.vapor_density_units');
  	this.checkFieldPercentOrNegative('msds_data.specific_gravity_high', '');
  	
  	var evacuation_radius =this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue('msds_data.evacuation_radius');
  	if(0>evacuation_radius){
  		this.abRiskMsdsDefMsdsPhysicalForm.fields.get('msds_data.evacuation_radius').setInvalid(getMessage('msg_too_small'));
  	}
	},

	/**
	 * checks boundaries for min and max values where the operator = 'Range'
	 * if operator is something other than range, set the min value to empty just before the save
	 * this way, the min value still exists when switching the operator value, but 
	 */
  checkRangeValues: function(minField, maxField, operatorField, unitsField){
		var operator = this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue(operatorField);

		if (operator == 'Range'){
			var minValue = this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue(minField);
			var maxValue = this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue(maxField);
			var warningMsg = getMessage('msg_too_large') + ' ' + maxValue;
						
			if(!maxValue){
				this.abRiskMsdsDefMsdsPhysicalForm.fields.get(maxField).setInvalid(getMessage('fieldValid'));
			}
			if(!minValue){
				this.abRiskMsdsDefMsdsPhysicalForm.fields.get(minField).setInvalid(getMessage('fieldValid'));
			}
			
			if(Math.round(parseFloat(minValue)*1000)/1000 > Math.round(parseFloat(maxValue)*1000)/1000){
				this.abRiskMsdsDefMsdsPhysicalForm.fields.get(minField).setInvalid(warningMsg);
			}
			
			this.checkFieldPercentOrNegative(minField, unitsField);
		
		} else if((operator == '>') || (operator == '<') || (operator == '=')){
			this.abRiskMsdsDefMsdsPhysicalForm.setFieldValue(minField, '');
		}
	},

	/**
	 * checks boundaries for min and max values where the operator = 'Range'
	 * if operator is something other than range, set the min value to empty 
	 */	
	checkFieldPercentOrNegative: function (fieldName, unitsField){	
		var units = this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue(unitsField);
		var value=this.abRiskMsdsDefMsdsPhysicalForm.getFieldValue(fieldName);
		if(units == '%'){
			if(0>value||value>100){
				this.abRiskMsdsDefMsdsPhysicalForm.fields.get(fieldName).setInvalid(getMessage('fieldValid'));
			}
		} else {
			if(0>value){
				this.abRiskMsdsDefMsdsPhysicalForm.fields.get(fieldName).setInvalid(getMessage('msg_too_small') + ' 0');
			}
		}
	}	
});

/**
 * visible/active in the form only if pct_operator is 'R' for 'range' as in a range spanning from pct_high to pct_low
 */
function showOrHiddenMin(operator,low){
	var pct_operator = abRiskMsdsDefPropController.abRiskMsdsDefMsdsPhysicalForm.getFieldElement(operator);
	if(pct_operator.value!="Range"){
		abRiskMsdsDefPropController.abRiskMsdsDefMsdsPhysicalForm.showField(low, false);
	}else{
		abRiskMsdsDefPropController.abRiskMsdsDefMsdsPhysicalForm.showField(low, true);
	}
}




/**
 * @author Song
 */

var abRiskMsdsDefConstController = View.createController('abRiskMsdsDefConstController', {
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
		var pct_operator = this.abRiskMsdsDefMsdsConstForm.getFieldElement("msds_constituent.pct_operator");
		if(pct_operator.value!="R"){
			this.abRiskMsdsDefMsdsConstForm.showField("msds_constituent.pct_low", false);
		}else{
			this.abRiskMsdsDefMsdsConstForm.showField("msds_constituent.pct_low", true);
		}
		pct_operator.onchange=function(){
			if(pct_operator.value!="R"){
				abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.showField("msds_constituent.pct_low", false);
			}else{
				abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.showField("msds_constituent.pct_low", true);
			}
		}
	},
	/**
	 * Select selectBl
	 */
	abRiskMsdsDefMsdsConstForm_onChemical: function(){
		/*
		var fieldNames=["msds_constituent.chemical_id"]; 
		var selectFieldNames=["msds_chemical.chemical_id"]; 
		var visibleFieldNames=['msds_chemical.chemical_id','msds_chemical.alias','msds_chemical.cas_number','msds_chemical.un_number','msds_chemical.ec_number','msds_chemical.icsc_number','msds_chemical.rtecs_number','msds_chemical.tier2']; 
		View.selectValue("abRiskMsdsDefMsdsConstForm", getMessage("labelConstituent"), fieldNames, "msds_chemical", 
			selectFieldNames, visibleFieldNames, null,null,false);	
		*/
		var controller = this;
		View.openDialog('ab-msds-select-add-chemical.axvw', null, false, {
			callback: function(record) {
				var value = record.getValue('msds_chemical.chemical_id');
				controller.abRiskMsdsDefMsdsConstForm.setFieldValue('msds_constituent.chemical_id', value);
			}
		});	
	},
	/**
	 * button add new click.
	 * msds_id : from first tab save button.
	 */
	abRiskMsdsDefMsdsConstGrid_onAddNew: function(){
		this.abRiskMsdsDefMsdsConstGridOnAddNew();
		this.fieldsControl();
	},
	/**
	 * sub method for parent js and current 'Add New' calling.
	 */
	abRiskMsdsDefMsdsConstGridOnAddNew: function(msds_id){
		var panelGrid = abRiskMsdsDefMsdsController.abRiskMsdsDefMsdsGrid;
		var index  = 0;
		if(panelGrid.selectedRowIndex&&panelGrid.selectedRowIndex<panelGrid.rows.length){
			index = panelGrid.selectedRowIndex;
		}
		if(msds_id){
			index  = msds_id;
		}
		var row = panelGrid.rows[index];
		
		var panelForm = this.abRiskMsdsDefMsdsConstForm;
		panelForm.newRecord = true;
		panelForm.show(true);
	    if(row){
	    	var msds_id = row['msds_data.msds_id'];
	    	panelForm.setFieldValue('msds_constituent.msds_id',msds_id);
	    }
    	panelForm.setFieldValue('msds_constituent.chemical_id','');
    	panelForm.setFieldValue('msds_constituent.pct_operator','=');
    	panelForm.setFieldValue('msds_constituent.pct_high','');
    	panelForm.setFieldValue('msds_constituent.pct_low','');
	
	}, 
	abRiskMsdsDefMsdsConstForm_beforeSave: function(){
		var operator = this.abRiskMsdsDefMsdsConstForm.getFieldValue('msds_constituent.pct_operator');
		if (operator == 'R'){
			var minValue = this.abRiskMsdsDefMsdsConstForm.getFieldValue('msds_constituent.pct_low');
			var maxValue = this.abRiskMsdsDefMsdsConstForm.getFieldValue('msds_constituent.pct_high');

			if(!minValue){
				abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.fields.get('msds_constituent.pct_low').setInvalid(getMessage('fieldValid'));
			}
			if(!maxValue){
				abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.fields.get('msds_constituent.pct_high').setInvalid(getMessage('fieldValid'));
			}
						
			if(Math.round(parseFloat(minValue)*1000)/1000 > Math.round(parseFloat(maxValue)*1000)/1000){
				var warningMsg = getMessage('msg_too_large') + ' ' + maxValue;
				this.abRiskMsdsDefMsdsConstForm.fields.get('msds_constituent.pct_low').setInvalid(warningMsg);
			}
						
			estimateFieldConst('msds_constituent.pct_low');
		}
		estimateFieldConst('msds_constituent.pct_high');
	}	
});

function estimateFieldConst(fieldName){	
	var value=abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.getFieldValue(fieldName);
	if(0>value||value>100){
		abRiskMsdsDefConstController.abRiskMsdsDefMsdsConstForm.fields.get(fieldName).setInvalid(getMessage('fieldValid'));
	}
}
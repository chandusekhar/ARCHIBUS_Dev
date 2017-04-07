/**
 * 22.1 : Add new a feature of supporting multiple edition of Space Requirement Items.
 * By Zhang Yi, 2015-11-27.
 */
var abSpEditMultiSbItemCtrl = View.createController('abSpEditMultiSbItemCtrl', {
	
	callbackMethod: null,
	
	sbItemRecords:null,
	
	fieldNameArray:['fg_title', 'rm_std_area', 'unit_headcount', 'cost_of_space', 'cost_of_furn', 'cost_of_move'],
	fieldValueArray:[],

	afterViewLoad: function(){
		if(valueExists(this.view.parameters)
				&& valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
			this.sbItemRecords =  this.view.parameters.sbItemRecords;
		}
	},
	
	
	abSpEditMultiSbItemForm_afterRefresh: function(){
		if ( this.sbItemRecords && this.sbItemRecords.length>0)	{
			//prepare field name array
			var firstRecord = this.sbItemRecords[0];
			for ( var i=0; i<this.fieldNameArray.length; i++){
				var fieldObject = {};
				fieldObject['value'] = firstRecord.values['sb_items.'+this.fieldNameArray[i]];
				fieldObject['same'] = true;
				this.fieldValueArray[i] = fieldObject;
			}

			//prepare field name array
			for ( var j=1; j<this.sbItemRecords.length; j++ ) {
				var record = this.sbItemRecords[j];
				for ( var i=0; i<this.fieldValueArray.length; i++){
					if ( this.fieldValueArray[i]['same'] && this.fieldValueArray[i]['value']!= record.values['sb_items.'+this.fieldNameArray[i]] ){ 
						this.fieldValueArray[i]['same'] = false;
						this.fieldValueArray[i]['value'] = "<"+getMessage('vary')+">";
					}
				}
			}

			var numberFieldDef = this.abSpEditMultiSbItemDs.fieldDefs.get("sb_items.rm_std_area");
			for ( var i=0; i<this.fieldNameArray.length; i++){
				var fieldId = 'sb_items.'+this.fieldNameArray[i]; 
				var fieldValue = this.fieldValueArray[i]['value']; 
				if ( ("<"+getMessage('vary')+">")===fieldValue ) {
					this.abSpEditMultiSbItemForm.setFieldValue(fieldId, fieldValue, null, false);
				}
				else {
					if ("fg_title"===this.fieldNameArray[i]) {
						this.abSpEditMultiSbItemForm.setFieldValue(fieldId, fieldValue, fieldValue, false);
					}
					else {
						var localFieldValue = numberFieldDef.formatValue(fieldValue, true, false); 
						this.abSpEditMultiSbItemForm.setFieldValue(fieldId, localFieldValue, fieldValue, false);
					}
				}
			}
		}
	},
	
	abSpEditMultiSbItemForm_onSave: function(){
		var newRecord = this.abSpEditMultiSbItemForm.getRecord();
		for ( var j=0; j<this.sbItemRecords.length; j++ ) {
			var record = this.sbItemRecords[j];
			for ( var i=0; i<this.fieldNameArray.length; i++){
				var formValue = newRecord.getValue('sb_items.'+this.fieldNameArray[i]);
				if ( ("<"+getMessage('vary')+">")!=formValue && formValue != this.fieldValueArray[i]['value'] ){
					record.setValue( 'sb_items.'+this.fieldNameArray[i], formValue);  
				}
			}
		}
		this.abSpEditMultiSbItemDs.saveRecords(this.sbItemRecords);

		if(this.callbackMethod){
			this.callbackMethod();
		}
	}
});
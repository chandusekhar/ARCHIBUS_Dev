/**
 * Added for 22.1 Space and Portfolio Planning : Negative Allocation.
 */
var abAllocSpReqNegativeGpCtrl = View.createController('abAllocSpReqNegativeGpCtrl', {
	/**
	 * Maps DOM events to event listeners.
	 */
	events : {
		"click #calculateReduction" : 'calculateReduction'
	},

	// id of gp that has the negative area_manual
	negativeGpId : 0,
	negativeGpRecord : null,
	negativeArea : null,
	remainingArea : 0,
		
	gpId : 0,
	gpRecord : null,

	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callback = View.parameters.callback;
			this.gpId = View.parameters.gpId;
			this.negativeGpId = View.parameters.negativeGpId;
			this.scenarioId = View.parameters.scenarioId;
			this.asOfDate = View.parameters.asOfDate;
		}
	},

	afterInitialDataFetch: function(){
		// If there are multiple groups match the organization of negative Gp on the target floor, the application can choose any of them for the Reduce Allocated Space form.  
		// get the group need reduction.
		this.getGroupToReduceArea();
		
		// initial values of form
		this.initialGroupForm();
	},

	getGroupToReduceArea: function(){
		this.gpRecord=this.abAllocSpNegativeGp_ds.getRecord('gp_id='+this.gpId);
		this.negativeGpRecord=this.abAllocSpNegativeGp_ds.getRecord('gp_id='+this.negativeGpId);
		this.negativeArea= parseFloat(this.negativeGpRecord.getValue("gp.area_manual"));
	},

	initialGroupForm: function(){
		this.abAllocNegativeForm.refresh('gp.gp_id='+this.gpId, false);
		var afterValue = (parseFloat(this.gpRecord.getValue("gp.area_manual"))-parseFloat(this.negativeGpRecord.getValue("gp.area_manual"))).toFixed(2);
		if ( afterValue>0 )	{
			$('actual').value=this.negativeGpRecord.getValue("gp.area_manual");
			this.abAllocNegativeForm.setFieldValue("gp.area_manual.after", afterValue);
			this.remainingArea = 0;
		} else {
			$('actual').value=this.gpRecord.getValue("gp.area_manual");
			this.abAllocNegativeForm.setFieldValue("gp.area_manual.after",0);
			this.remainingArea = (-afterValue).toFixed(2);
			this.abAllocNegativeForm.setFieldValue("remaining", this.remainingArea);
		}
		this.abAllocNegativeForm.setFieldValue("gp.event_name",this.negativeGpRecord.getValue("gp.event_name"));
		this.abAllocNegativeForm.setFieldValue("gp.description", getMessage("defaultDesc"));
		this.abAllocNegativeForm.setFieldValue("gp.date_end.negative_date", this.asOfDate);
	},

	chooseActual: function(){
		$("percentage").disabled=true;
		$("actual").disabled=false;
	},

	choosePercentage: function(){
		$("actual").disabled=true;
		$("percentage").disabled=false;
	},

	/**
	* Calculate the reduction area.
	 */
	calculateReduction: function() {
		if ($("percentage").disabled){
			this.calculateActualReduction();
		} else {
			this.calculatePctReduction();
		}
	},

	calculateActualReduction: function(){
		var actualValue = $('actual').value;
		if ( !actualValue ) {
			View.alert(getMessage("incorrectActual"));
			return;
		}
		try {
			actualValue = parseFloat(actualValue);
			if ( actualValue>this.negativeArea ){
				View.alert(getMessage("wrongActual2"));
				return;
			}
			if ( actualValue<0  || actualValue>this.abAllocNegativeForm.getFieldValue("gp.area_manual") ){
				View.alert(getMessage("wrongActual"));
				return;
			}
			var afterReduction = this.abAllocNegativeForm.getFieldValue("gp.area_manual")-actualValue;
			this.abAllocNegativeForm.setFieldValue("gp.area_manual.after",afterReduction.toFixed(2));
			this.remainingArea = this.negativeArea-actualValue;
			this.abAllocNegativeForm.setFieldValue("remaining",this.remainingArea.toFixed(2));
		}	catch (e)	{
			View.alert(getMessage("wrongActual"));
			return;
		}
	},

	calculatePctReduction: function(){
		var pctValue = $('percentage').value;
		if ( !pctValue ) {
			View.alert(getMessage("incorrectPct"));
			return;
		}
		try {
			pctValue = parseFloat(pctValue);
			if (pctValue<0  || pctValue>100 ){
				View.alert(getMessage("wrongPct"));
				return;
			}
			var reducedArea =   this.abAllocNegativeForm.getFieldValue("gp.area_manual")*pctValue/100;
			if (reducedArea>this.negativeArea){
				$('percentage').value = (this.negativeArea/this.abAllocNegativeForm.getFieldValue("gp.area_manual")*100).toFixed(2);
				var afterReduction = this.abAllocNegativeForm.getFieldValue("gp.area_manual")-this.negativeArea;
				this.abAllocNegativeForm.setFieldValue("gp.area_manual.after",afterReduction.toFixed(2));
				this.remainingArea = 0;
			}  else {
				var afterReduction = this.abAllocNegativeForm.getFieldValue("gp.area_manual")*(100-pctValue)/100;
				this.abAllocNegativeForm.setFieldValue("gp.area_manual.after",afterReduction.toFixed(2));
				this.remainingArea = this.negativeArea - reducedArea;
			}
			// set remaining area
			this.abAllocNegativeForm.setFieldValue("remaining",this.remainingArea);

		}	catch (e)	{
			View.alert(getMessage("wrongPct"));
			return;
		}
	},

	abAllocNegativeForm_onConfirm: function(){
		if (this.abAllocNegativeForm.canSave()){
			this.updateExistingGroup();
			this.insertNewGroup();
			this.updateNegativeGroup();

			this.abAllocNegativeForm.displayTemporaryMessage(getMessage("saved"));

			if (this.callback)	{
				this.callback();
			}
		}
	},
		
	updateExistingGroup: function(){
		var oldGpRecord = this.abAllocNegativeForm.getRecord();

		var originalDate = Date.parseDate(this.abAllocNegativeForm.getFieldValue("gp.date_end.negative_date"), 'Y-m-d');
		var dateEnd = new Date(originalDate.getTime() - 24*60*60*1000 );

		//kb#3049877: keep parent's group's event name and description
		oldGpRecord.setValue("gp.event_name", oldGpRecord.oldValues['gp.event_name']);
		oldGpRecord.setValue("gp.description", oldGpRecord.oldValues['gp.description']);

		oldGpRecord.setValue("gp.date_end", dateEnd);
		this.abAllocSpNegativeGp_ds.saveRecord(oldGpRecord);
	},

	insertNewGroup: function(){
		//kb#3049759: only insert new group when area_manual is not 0
		if ( this.abAllocNegativeForm.getFieldValue("gp.area_manual.after")!=0 ) {
			var newGpRecord = this.abAllocNegativeForm.getRecord();
			newGpRecord.isNew = true;
			newGpRecord.setValue("isNew", true);
			newGpRecord.setValue("gp.gp_id", "");
			newGpRecord.setValue("gp.parent_group_id", this.gpId);
			newGpRecord.setValue("gp.area_manual", this.abAllocNegativeForm.getFieldValue("gp.area_manual.after"));
			newGpRecord.setValue("gp.date_start", this.abAllocNegativeForm.getFieldValue("gp.date_end.negative_date"));
			newGpRecord.setValue("gp.date_end", "");
			newGpRecord.setValue("gp.sort_order", this.abAllocNegativeForm.getFieldValue("gp.sort_order"));
			newGpRecord.setValue("gp.allocation_type", "Allocated Area");
			newGpRecord.setValue("gp.event_name", this.abAllocNegativeForm.getFieldValue("gp.event_name"));
			this.abAllocSpNegativeGp_ds.saveRecord(newGpRecord);

			// kb#3051111: update remaining area by 'Allocated Area After Reduction'  
			this.remainingArea = ( this.negativeArea - (this.abAllocNegativeForm.getFieldValue("gp.area_manual") - this.abAllocNegativeForm.getFieldValue("gp.area_manual.after"))).toFixed(2);
		}
	},

	updateNegativeGroup: function(){
		if (this.remainingArea==0){
			this.abAllocSpNegativeGp_ds.deleteRecord(this.negativeGpRecord);
		} else {
			this.negativeGpRecord.setValue("gp.area_manual", this.remainingArea);
			this.abAllocSpNegativeGp_ds.saveRecord(this.negativeGpRecord);
		}
	}
});
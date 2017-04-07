/**
 * @song
 */
var abRiskMsdsDefMsdsTabController = View.createController('abRiskMsdsDefMsdsTabController', {
	/**
	 * private method
	 * change all the fields to readOnly and remove all the button.
	 */
	afterInitialDataFetch: function(){

		this.abRiskMsdsDefMsdsTabs.addEventListener('afterTabChange', afterTabChange);

		this.abRiskMsdsDefMsdsTabs.selectTab("identification", null, false, false, false);
		this.panelForReprot();
	},
	/**
	 * private method
	 * change all the fields to readOnly and remove all the button.
	 */
	panelForReprot: function(){
		var panels = [this.abRiskMsdsDefMsdsForm,this.abRiskMsdsDefMsdsDocForm,this.abRiskMsdsDefMsdsClassForm,this.abRiskMsdsDefMsdsClassGrid,
		              this.abRiskMsdsDefMsdsConstForm,this.abRiskMsdsDefMsdsConstGrid,this.abRiskMsdsDefMsdsPhysicalForm];
		for(var j=0;j<panels.length;j++){
			var panel = panels[j];
			if(panel){
				if(panel.fields){
					var items = panel.fields.items;
					for(var i=0;i<items.length;i++){
						var fieldEl = items[i];
						panel.enableField(fieldEl.fieldDef.id, false);
					}
				}
				var actions = panel.actions.items;
				for(var i=0;i<actions.length;i++){
					var action = actions[i];
					action.show(false);
				}
			}
		}
		//kb#3034554: enable all document actions in read-only mode.
		var docField = this.abRiskMsdsDefMsdsDocForm.fields.get("msds_data.doc");
		docField.actions.each(function(action) {
			if("abRiskMsdsDefMsdsDocForm_msds_data.doc_showDocument"==action.id){
				action.enable(true);
			}
		});
	}

});
/**
 * called when click change tab
 * @param selectedTabName : selected Tab Name
 */
function afterTabChange(panel,selectedTabName){
	abRiskMsdsDefMsdsTabController.panelForReprot();

	//visible/active in the form only if pct_operator is 'R' for 'range' as in a range spanning from pct_high to pct_low
	abRiskMsdsDefPropController.fieldsControl();
}
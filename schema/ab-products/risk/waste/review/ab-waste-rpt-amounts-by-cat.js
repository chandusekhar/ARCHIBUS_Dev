/**
 * @author Song
 */
var abWasteRptAmountsByCatController = View.createController('abWasteRptAmountsByCatController', {
	/**
	 *  console restriction
	 */
	originalRes: null,
	/**
	 * console and group restriction
	 */
	res: null,
	/**
	 * afterInitialDataFetch
	 */
	afterInitialDataFetch: function(){
		this.abWasteRptAmountsDrillDownGrid.show(false);
		resetStatusOption('abWasteRptAmountsByCatConsole');
//		  Kb 3031472
//		 this.abWasteRptAmountsByCatConsole_onShow();
		this.originalRes=this.getOriginalConsoleRestriction();
		this.res=addDispositionTypeRestriction(this.originalRes, 'abWasteRptAmountsByCatConsole');
		this.abWasteRptAmountsByCatTab.addEventListener('afterTabChange', afterTabChange);
		
		var groupByField="wp.waste_category";
		this.abWasteRptAmountsByCatMassChart.addParameter("groupByField",groupByField);
		this.abWasteRptAmountsByCatLiquidChart.addParameter("groupByField",groupByField);
		this.abWasteRptAmountsByCatGasChart.addParameter("groupByField",groupByField);
	},
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_profiles.waste_category',,'waste_profiles.waste_category'], 
			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			//['waste_profiles.is_recyclable',,'waste_profiles.is_recyclable'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_out.waste_disposition',,'waste_out.waste_disposition'], 
			['waste_dispositions.disposition_type',,'waste_dispositions.disposition_type'], 
			['waste_out.status',,'waste_out.status']
	),
	/**
	 * Show grid by console restriction
	 */
	abWasteRptAmountsByCatConsole_onShow: function(){
		this.abWasteRptAmountsDrillDownGrid.show(true);
		this.originalRes=this.getOriginalConsoleRestriction();
		this.res=addDispositionTypeRestriction(this.originalRes, 'abWasteRptAmountsByCatConsole');
		var selectedTabName = this.abWasteRptAmountsByCatTab.selectedTabName;
		afterTabChange(null, selectedTabName);
	},
	/**
	 * original restriction
	 */
	getOriginalConsoleRestriction: function(){
		var console = this.abWasteRptAmountsByCatConsole;
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var dateEndFrom=console.getFieldValue("date_end.from");
		var dateEndTo=console.getFieldValue("date_end.to");

		if(valueExistsNotEmpty(dateEndFrom)){
			restriction+=" AND waste_out.date_end &gt;=${sql.date(\'" + dateEndFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateEndTo)){
			restriction+=" AND waste_out.date_end &lt;=${sql.date(\'" + dateEndTo + "\')}";
		}
		var dateStartFrom=console.getFieldValue("date_start.from");
		var dateStartTo=console.getFieldValue("date_start.to");
		
		if(valueExistsNotEmpty(dateStartFrom)){
			restriction+=" AND waste_out.date_start &gt;=${sql.date(\'" + dateStartFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateStartTo)){
			restriction+=" AND waste_out.date_start &lt;=${sql.date(\'" + dateStartTo + "\')}";
		}
		if (document.getElementById("is_recyclable").checked) {
			restriction+=" AND waste_profiles.is_recyclable = 1 ";
		} else {
			//restriction+=" AND waste_profiles.is_recyclable = 0 ";
		}
		Ext.select('input[name="radioUnits"]:checked').each(function(val){
			var val = val.dom.value;
			if (valueExistsNotEmpty(val)) {
				restriction+=" AND waste_out.units_type = '"+val+"'";
			}
		});
		return restriction;
	}
});
/**
 * called when click change tab
 * @param selectedTabName : selected Tab Name
 */
function afterTabChange(panel,selectedTabName){
	var controller = View.controllers.get('abWasteRptAmountsByCatController');
	var gridRestriction = addDispositionTypeRestriction(controller.originalRes +" and waste_out.units_type = '"+selectedTabName+"'", 'abWasteRptAmountsByCatConsole'); 
	switch (selectedTabName) {
	case 'MASS':
		View.panels.get('abWasteRptAmountsByCatMassChart').refresh(controller.res+" and waste_out.units_type = '"+selectedTabName+"'");
		View.panels.get('abWasteRptAmountsDrillDownGrid').refresh(gridRestriction);
		break;
	case 'VOLUME-LIQUID':
		View.panels.get('abWasteRptAmountsByCatLiquidChart').refresh(controller.res+" and waste_out.units_type = '"+selectedTabName+"'");
		View.panels.get('abWasteRptAmountsDrillDownGrid').refresh(gridRestriction);
		break;
	case 'VOLUME-GAS':
		View.panels.get('abWasteRptAmountsByCatGasChart').refresh(controller.res+" and waste_out.units_type = '"+selectedTabName+"'");
		View.panels.get('abWasteRptAmountsDrillDownGrid').refresh(gridRestriction);
		break;
	default:
		break;
	}
}

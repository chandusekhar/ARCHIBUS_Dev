/**
 * @author Song
 */
var abWasteRptTotalsByCatController = View.createController('abWasteRptTotalsByCatController', {
	/**
	 *  console restriction
	 */
	originalRes: null,
	/**
	 * console and group restriction
	 */
	res: null,
	/**
	 * restriction fields
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_profiles.waste_category',,'waste_profiles.waste_category'], 
			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_dispositions.disposition_type',,'waste_dispositions.disposition_type'], 
			['waste_out.status',,'waste_out.status']
	),
	/**
	 * afterInitialDataFetch
	 */
	afterInitialDataFetch: function(){
		  var groupByOfRadios = document.getElementsByName("groupBy");
          groupByOfRadios[0].checked = true;
		  setPanelShowFalse();
		  resetStatusOption("abWasteRptTotalsByCatConsole");
		  
		  //register onClickItem event
		  this.abWasteRptTotalsByCatSiteCrossTable.onClickItem = this.show;
		  this.abWasteRptTotalsByCatBuildingCrossTable.onClickItem = this.show;
		  this.abWasteRptTotalsByCatDivisionCrossTable.onClickItem = this.show;
		  this.abWasteRptTotalsByCatDepartmentCrossTable.onClickItem = this.show;
		  
		  //set the generic grouping by field
		  this.abWasteRptTotalsByCatSiteCrossTable.addParameter("groupByField","wo.site_id");
		  this.abWasteRptTotalsByCatBuildingCrossTable.addParameter("groupByField","wo.bl_id");
		  this.abWasteRptTotalsByCatDivisionCrossTable.addParameter("groupByField","wo.dv_id");
		  this.abWasteRptTotalsByCatDepartmentCrossTable.addParameter("groupByField","wo.dp_id");
	},
	/**
	 * On item click event handler
	 */
	show: function(id){
		showDetails(this, id, "abWasteRptTotalsByCatController", "abWasteRptTotalsByCatConsole");
	},
	/**
	 * Show grid by console restriction
	 */
	abWasteRptTotalsByCatConsole_onShow: function(){
		this.originalRes = getOriginalConsoleRestriction("abWasteRptTotalsByCatConsole", this.fieldsArraysForRestriction);
		this.res = addDispositionTypeRestriction(this.originalRes, "abWasteRptTotalsByCatConsole");
        var groupByOfRadios = document.getElementsByName("groupBy");
		if (groupByOfRadios) {
			setPanelShowFalse();
			if (groupByOfRadios[0].checked) {
				this.abWasteRptTotalsByCatSiteCrossTable.refresh(this.res);
			}else if(groupByOfRadios[1].checked){
				this.abWasteRptTotalsByCatBuildingCrossTable.refresh(this.res);
			}else if(groupByOfRadios[2].checked){
				this.abWasteRptTotalsByCatDivisionCrossTable.refresh(this.res);
			}else {
				this.abWasteRptTotalsByCatDepartmentCrossTable.refresh(this.res);
			}
		}
	}
});
/**
 * @author Song
 */
var abWasteRptTotalsByCatHandlerController = View.createController('abWasteRptTotalsByCatHandlerController', {
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
	 * Is a panel of the view ab-waste-rpt-map.axvw or not.
	 */
	isChildPanel: false,
	/**
	 * afterInitialDataFetch
	 */
	afterInitialDataFetch: function(){
		  var groupByOfRadios = document.getElementsByName("groupBy");
          groupByOfRadios[0].checked = true;
		  setPanelShowFalse();
		  resetStatusOption("abWasteRptTotalsByCatHandlerConsole");

		  //register onClickItem event
		  this.abWasteRptTotalsByCatHandlerGeneratorCrossTable.onClickItem = this.show;
		  this.abWasteRptTotalsByCatHandlerTransporterCrossTable.onClickItem = this.show;
		  this.abWasteRptTotalsByCatHandlerFacilityCrossTable.onClickItem = this.show;
		  
		  //set the generic grouping by field
		  this.abWasteRptTotalsByCatHandlerGeneratorCrossTable.addParameter("groupByField","wo.generator_id");
		  this.abWasteRptTotalsByCatHandlerTransporterCrossTable.addParameter("groupByField","wo.transporter_id");
		  this.abWasteRptTotalsByCatHandlerFacilityCrossTable.addParameter("groupByField","wo.facility_id");
		  
		  if(View.parentTab){
			  this.isChildPanel = true;
			  this.fieldsArraysForRestriction.push(['waste_out.storage_location',,'waste_out.storage_location']);
			  this.initializeView();
		  }else{
			  this.abWasteRptTotalsByCatHandlerConsole.showField("waste_out.storage_location", false);
		  }
	},
	
	/**
	 * On item click event handler
	 */
	show: function(id){
		showDetails(this, id, "abWasteRptTotalsByCatHandlerController", "abWasteRptTotalsByCatHandlerConsole");
	},
	
	/**
	 * Show grid by console restriction
	 */
	abWasteRptTotalsByCatHandlerConsole_onShow: function(){
		this.originalRes = getOriginalConsoleRestriction("abWasteRptTotalsByCatHandlerConsole", this.fieldsArraysForRestriction);
		this.res = addDispositionTypeRestriction(this.originalRes, "abWasteRptTotalsByCatHandlerConsole");
        var groupByOfRadios = document.getElementsByName("groupBy");
		if (groupByOfRadios) {
			setPanelShowFalse();
			if (groupByOfRadios[0].checked) {
				this.abWasteRptTotalsByCatHandlerGeneratorCrossTable.refresh(this.res);
			}else if(groupByOfRadios[1].checked){
				this.abWasteRptTotalsByCatHandlerTransporterCrossTable.refresh(this.res);
			}else {
				this.abWasteRptTotalsByCatHandlerFacilityCrossTable.refresh(this.res);
			}
		}
	},
	
	initializeView:function(){
		var storeageLocation=View.getOpenerView().controllers.get('blDetail').storage_location;
		var siteId=View.getOpenerView().controllers.get('blDetail').site_id;
		this.abWasteRptTotalsByCatHandlerConsole.setFieldValue("waste_out.storage_location",storeageLocation);
		this.abWasteRptTotalsByCatHandlerConsole.setFieldValue("waste_out.site_id",siteId);
		this.abWasteRptTotalsByCatHandlerConsole_onShow();
	},
	
	/**
	 * after Refresh console 
	 */
	abWasteRptTotalsByCatHandlerConsole_afterRefresh: function(){
		if(this.isChildPanel){
			this.abWasteRptTotalsByCatHandlerConsole.clear();
			var blId=View.getOpenerView().controllers.get('blDetail').bl_id;
			var siteId=View.getOpenerView().controllers.get('blDetail').site_id;
			this.abWasteRptTotalsByCatHandlerConsole.setFieldValue("waste_out.bl_id",blId);
			this.abWasteRptTotalsByCatHandlerConsole.setFieldValue("waste_out.site_id",siteId);
		}
	}

});


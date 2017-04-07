View.createController('findPartsController',{
	//Define work request code got from opener select value form
	workRequestIds:[],
	
	afterInitialDataFetch: function(){
		
		//this.workRequestId=View.getOpenerView().workRequestId;
		this.workRequestIds=View.getOpenerView().workRequestIds;
		
		if(this.workRequestIds.length>0){
			var wrLocation=this.getWorkRequestLocationByWrId(this.workRequestIds);
			if(valueExistsNotEmpty(wrLocation)){
				document.getElementById('workrequest_location').innerHTML=wrLocation;
			}else{
				document.getElementById('workrequest_locate_img').hidden=true;
			}
			
		}else{
			document.getElementById('workrequest_locate_img').hidden=true;
		}
		
		//Disable Quantity Avaliable default value
		var qtyOnHandFieldElement=this.consoleForm.fields.get('pt_store_loc_pt.qty_on_hand');
		qtyOnHandFieldElement.fieldDef.defaultValue='';
	},
	/**
	 * Bind event when click show button
	 */
	consoleForm_onBtnShow: function(){
		var record=this.consoleForm.getRecord();
		var partCode=record.getValue('pt.part_id');
		var partClass=record.getValue('pt.class');
		var partDescription=record.getValue('pt.description');
		var whQuatity=record.getValue('pt_store_loc_pt.qty_on_hand');
		
		
		//The Quantity Available field requires that at least one of the Part Code/Part Classification fields also be populated.
		if(valueExistsNotEmpty(whQuatity)){
			
			if((!valueExistsNotEmpty(partCode))&&(!valueExistsNotEmpty(partClass))&&(!valueExistsNotEmpty(partDescription))){
				View.alert(getMessage('quantity_need_other_field'));
				return;
			}
			
			var isNaNCheck=isNaN(whQuatity);
			if(isNaNCheck){
				View.alert(getMessage('quntity_number'));
				return;
			}else{
				if(parseFloat(whQuatity)<=0){
					View.alert(getMessage('qtyOnHandShouldGreaterThan0'));
					return;
				}
			}
			
		}
		//bind event listener
		this.trigger("app:operation:express:mpiw:onShowButtonClicked",record);
	},
	/**
	 * Clear the console form when click Clear button.
	 */
	consoleForm_onBtnClear: function(){
		this.consoleForm.clear();
		//bind event listener
		var record=this.consoleForm.getRecord();
		this.trigger("app:operation:express:mpiw:onClearButtonClicked",record);
	},
	
	/**
	 * Get work request location by work request code
	 * @param workrequestID work request code
	 */
	getWorkRequestLocationByWrId: function(workrequestIDs){
		var res=new Ab.view.Restriction();
		res.addClause('wr.wr_id',workrequestIDs,'IN');
		var records=this.wrptDS.getRecords(res);
		//Define part storage location
		var displayLocations="";
		for(var i=0;i<records.length;i++){
			var record=records[i];
			var blId=record.getValue('wr.bl_id');
			var flId=record.getValue('wr.fl_id');
			var rmId=record.getValue('wr.rm_id');
			
			var wrLocation="";
			
			if(valueExistsNotEmpty(blId)){
				wrLocation=blId;
			}
			if(valueExistsNotEmpty(flId)){
				wrLocation=wrLocation+"-"+flId;
			}
			if(valueExistsNotEmpty(rmId)){
				wrLocation=wrLocation+"-"+rmId;
			}
			
			if(i!=records.length-1){
				wrLocation+=';';
			}
			
			displayLocations+=wrLocation;
		}
		
		
		return displayLocations;
	}
	
	
	
});

function onLocateWorkRequest(){
	var findPartsController=View.controllers.get('findPartsController');
	if(findPartsController.workRequestIds.length>0){
		var warehouseMapTab=findPartsController.partInventoryLocationTabs.findTab('warehouseMapTab');
		findPartsController.partInventoryLocationTabs.selectTab('warehouseMapTab');
		
		var mapController=warehouseMapTab.getContentFrame().View.controllers.get('mapController');
		mapController.locateAndCenterMapByWrId();
		
	}else{
		View.alert(getMessage('wr_no_location'));
	}
}
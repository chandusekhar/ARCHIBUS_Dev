var ctrlGpdFilter = View.createController('ctrlGpdFilter', {
	
	// selected method type, default  value 'location'
	selectedMethod: 'location',
	
	objFilter: {},
	
	//filter restriction as an instruction label
	instructionLabel: '',
	
	dropDownsConfig: {
		tableMap: {
			'organization': ['bu', 'dv', 'dp', 'bl'],
			'location': ['geo_region', 'ctry', 'site', 'bl']
		},
		idMap: {
			'organization': ['bu.bu_id', 'dv.dv_id', 'dp.dp_id', 'bl.use1'],
			'location': ['geo_region.geo_region_id', 'ctry.ctry_id', 'site.site_id', 'bl.use1']
		},
		nameName: {
			'organization': ['bu.name', 'dv.name', 'dp.name', 'bl.use1'],
			'location': ['geo_region.geo_region_name', 'ctry.name', 'site.name', 'bl.use1']
		}
	},
	
	afterViewLoad: function(){
		   // Automatically Collapse the Process Navigator 
		var toCollapse = View.getOpenerView().getLayoutAndRegionById('navigatorRegion');	    
	    if (toCollapse){
	    	var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
	    	panel.collapse(false);
	    }		
		// set custom labels
		this.setCustomLabels();

		this.setRadioValue("radSwitchTo", this.selectedMethod);
		this.initializeDropDowns(1);
		// we must load some panels without frames
		this.loadDashboardPanels.defer(1000, this);
	},
	
	/**
	 * SwitchTo onClick event handler.
	 * @param method - selected type ('organization', 'location') 
	 */
	onClick_SwitchTo: function(method){
		this.selectedMethod = method;
		this.setDropDownLabels(method);
		this.initializeDropDowns(1, true);
	},
	
	/**
	 * Filter onClick event handler
	 */
	onClick_BtnFilter: function(){
		// read filter settings
		var arrIds = this.dropDownsConfig.idMap[this.selectedMethod];
		this.objFilter = {};
		for (var i = 0; i < arrIds.length; i++){
			var id = arrIds[i].slice(arrIds[i].indexOf(".")+1);
			var objSelect = $("listLevel" + (i+1));
			var value = (valueExists(objSelect.value)?objSelect.value: "");
			this.objFilter[id] = value;
		}
		this.setRestrictionAsLabel();
		// we must refresh all panels
		this.refreshDashboard();
	},
	
	/**
	 * Clear onClick event handler
	 */
	onClick_BtnClear: function(){
		this.initializeDropDowns(1, true);
	},
	
	/**
	 * Sets the filter restriction as a text to the this.instructionLabel.
	 */
	setRestrictionAsLabel: function(){
		this.instructionLabel = '';
		
		if (this.objFilter != null) {
			if (valueExists(this.objFilter.bu_id)) {
				// is organization
				if(valueExistsNotEmpty(this.objFilter.bu_id)){
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel1_organization') + ":</font> " + this.objFilter.bu_id + "; " ;
				}
				if(valueExistsNotEmpty(this.objFilter.dv_id)){
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel2_organization') + ":</font> " + this.objFilter.dv_id + "; ";
				}
				if(valueExistsNotEmpty(this.objFilter.dp_id)){
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel3_organization') + ":</font> " + this.objFilter.dp_id + "; ";
				}
			}else {
				// is location
				if (valueExistsNotEmpty(this.objFilter.geo_region_id)) {
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel1_location') + ":</font> " + this.objFilter.geo_region_id + "; ";
				}
				if (valueExistsNotEmpty(this.objFilter.ctry_id)) {
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel2_location') + ":</font> " + this.objFilter.ctry_id + "; ";
				}
				if (valueExistsNotEmpty(this.objFilter.site_id)) {
					this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel3_location') + ":</font> " + this.objFilter.site_id + "; ";
				}
			}
			
			if (valueExistsNotEmpty(this.objFilter.use1)) {
				this.instructionLabel += "<font color=\"red\">" + getMessage('msgLevel4') + ":</font> " + this.objFilter.use1 + "; ";
			}
		}
	},
	
	/**
	 * set custom labels for filter bar.
	 */
	setCustomLabels: function(){
		//radio selection label
		$("labelSwitchTo_org").innerHTML = getMessage("msgSwitchTo_organization");
		$("labelSwitchTo_loc").innerHTML = getMessage("msgSwitchTo_location");
		
		this.setDropDownLabels(this.selectedMethod);
	},
	
	/**
	 * Set drop down labels for selected method.
	 */
	setDropDownLabels: function(method){
		// drop down titles
		$("labelLevel1").innerHTML = getMessage(this.getLabelId("1", method));
		$("labelLevel2").innerHTML = getMessage(this.getLabelId("2", method));
		$("labelLevel3").innerHTML = getMessage(this.getLabelId("3", method));
		$("labelLevel4").innerHTML = getMessage(this.getLabelId("4", ""));
	},
	
	/**
	 * Get message id for level and method.
	 */
	getLabelId: function(level, method) {
		return "msgLevel" + level + (valueExistsNotEmpty(method)? "_"+ method: "");
	},
	
	/**
	 * Initialize/refresh drop down list
	 */
	initializeDropDowns: function(startFromLevel, resetAll){
		if(resetAll == undefined){
			resetAll = false;
		}
		var arrTables = this.dropDownsConfig.tableMap[this.selectedMethod];
		var arrIds = this.dropDownsConfig.idMap[this.selectedMethod];
		var arrNames = this.dropDownsConfig.nameName[this.selectedMethod];
		for (var i = startFromLevel; i < arrTables.length; i++) {
			var table = arrTables[i-1];
			var id = arrIds[i-1];
			var name = arrNames[i-1];

			// get previous level selected value
			var objParentList = $("listLevel" + (i-1));
			var restriction = null;
			if (objParentList) {
				var parentValue = objParentList.value;
				var parentId = arrIds[i-2];
				parentId = parentId.slice(parentId.indexOf("."));
				if (valueExistsNotEmpty(parentValue)) {
					restriction = new Ab.view.Restriction();
					restriction.addClause(table + parentId, parentValue, "=");
				}
			}
			// get empty option name
			var emptyOption = "< "+ getMessage("msgSelect") + " " + getMessage(this.getLabelId(i, this.selectedMethod)) + " >";
			var objList = $("listLevel" + (i));
			// if we have a parent value we must reconstruct drop down list
			var objDataSource =  View.dataSources.get("ds_" + table);
			var records = new Array();
			if (restriction != null || i == 1) {
				objList.innerHTML = null;
				records = objDataSource.getRecords(restriction);
				var dropDownControl =  new Ab.dropdown.control(objList, id, name);
				var enumValues = null;
				if (objDataSource.fieldDefs.get(id).isEnum) {
					enumValues = objDataSource.fieldDefs.get(id).enumValues;
				}
				dropDownControl.populateDropDownList(records, emptyOption, enumValues);
			}else {
				objList.innerHTML = null;
			}
		}
		// last level should pe populated always
		var table = arrTables[3];
		var id = arrIds[3];
		var name = arrNames[3];
		var objList = $("listLevel4");
		if (objList.options.length == 0 || resetAll) {
			objList.innerHTML = null;
			var emptyOption = "< "+ getMessage("msgSelect") + " " + getMessage(this.getLabelId(4, "")) + " >";
			var dropDownControl =  new Ab.dropdown.control(objList, id, name);
			// get list records
			var objDataSource =  View.dataSources.get("ds_" + table);
			var records = objDataSource.getRecords(restriction);
			var enumValues = null;
			if (objDataSource.fieldDefs.get(id).isEnum) {
				enumValues = objDataSource.fieldDefs.get(id).enumValues;
			}
			dropDownControl.populateDropDownList(records, emptyOption, enumValues);
		}
	},
	
	/**
	 * On change DDList event.
	 */
	onChangeList: function(level, value){
		this.initializeDropDowns(level + 1);
	}, 
	
	/**
	 * Set radio button value.
	 */
	setRadioValue: function(name, value){
		var objRadio = document.getElementsByName(name);
		if (objRadio) {
			for (var i = 0; i < objRadio.length; i++) {
				objRadio[i].checked = objRadio[i].value == value;
			}
		}
	},
	
	refreshDashboard: function(){
		var objRestriction = this.objFilter;
		View.restriction = objRestriction;
		
		// 1. Summary
		var objSummaryCtrl = View.controllers.get("abRplmGpdSummaryCtrl");
		objSummaryCtrl.objFilter = objRestriction;
		objSummaryCtrl.afterInitialDataFetch();
		
		// 2 Operating Cost Chart
		var objCostTypeCtrl = View.controllers.get("abRplmPfadminGpdCostByTypeCtrl");
		objCostTypeCtrl.objFilter = objRestriction;
		objCostTypeCtrl.afterInitialDataFetch();
		
		// 3 Area by Building Use Chart
		var objAreaByBluseCtrl = View.controllers.get("abRplmPfadminGpdAreaByBluseCtrl");
		objAreaByBluseCtrl.objFilter = objRestriction;
		objAreaByBluseCtrl.afterInitialDataFetch();
		
		// 4 Lease expiration by year
		var objLeaseAgingCtrl = View.controllers.get("abRplmPfadminGpdLeaseAgingCtrl");
		objLeaseAgingCtrl.objFilter = objRestriction;
		objLeaseAgingCtrl.afterInitialDataFetch();

		// 5 Building by Age
		var objBldgAgeCtrl = View.controllers.get("abRplmPfadminGpdBldgAgeCtrl");
		objBldgAgeCtrl.objFilter = objRestriction;
		objBldgAgeCtrl.afterInitialDataFetch();
		
		// 6 Occupancy by Chart
		var objOccupancyByCtrl = View.controllers.get("abRplmPfadminGpdOccupancyByCtrl");
		objOccupancyByCtrl.objFilter = objRestriction;
		objOccupancyByCtrl.afterInitialDataFetch();
		

		// 7 Building values By
		var objBldgValuesByCtrl = View.controllers.get("abRplmPfadminGpdBldgValuesByCtrl");
		objBldgValuesByCtrl.objFilter = objRestriction;
		objBldgValuesByCtrl.afterInitialDataFetch();

		// 8 Owned/ leased by
		var objOwnedByCtrl = View.controllers.get("abRplmPfadminGpdOwnedByCtrl");
		objOwnedByCtrl.objFilter = objRestriction;
		objOwnedByCtrl.afterInitialDataFetch();
		
		// 9 ESRI map
		var objGISCtrl = View.controllers.get("abRplmPfadminGpdGisCtrl");
		if (objGISCtrl == null || objGISCtrl == undefined) {
			objGISCtrl = View.panels.get('abGpdGis').contentView.controllers.get("abRplmPfadminGpdGisCtrl");
		}
		objGISCtrl.objFilter = objRestriction;
		objGISCtrl.afterInitialDataFetch();
	},
	
	loadDashboardPanels: function(){
		// 1. Summary
		var objSummaryCtrl = View.controllers.get("abRplmGpdSummaryCtrl");
		objSummaryCtrl.afterInitialDataFetch();
		
		// 2 Operating Cost Chart
		var objCostTypeCtrl = View.controllers.get("abRplmPfadminGpdCostByTypeCtrl");
		objCostTypeCtrl.afterInitialDataFetch();
		// 3 Area by Building Use Chart
		var objAreaByBluseCtrl = View.controllers.get("abRplmPfadminGpdAreaByBluseCtrl");
		objAreaByBluseCtrl.afterInitialDataFetch();
		
		// 4 Lease expiration by year
		var objLeaseAgingCtrl = View.controllers.get("abRplmPfadminGpdLeaseAgingCtrl");
		objLeaseAgingCtrl.afterInitialDataFetch();

		// 5 Building by Age
		var objBldgAgeCtrl = View.controllers.get("abRplmPfadminGpdBldgAgeCtrl");
		objBldgAgeCtrl.afterInitialDataFetch();
		
		// 6 Occupancy by Chart
		var objOccupancyByCtrl = View.controllers.get("abRplmPfadminGpdOccupancyByCtrl");
		objOccupancyByCtrl.afterInitialDataFetch();
		

		// 7 Building values By
		var objBldgValuesByCtrl = View.controllers.get("abRplmPfadminGpdBldgValuesByCtrl");
		objBldgValuesByCtrl.afterInitialDataFetch();

		// 8 Owned/ leased by
		var objOwnedByCtrl = View.controllers.get("abRplmPfadminGpdOwnedByCtrl");
		objOwnedByCtrl.afterInitialDataFetch();
		
		if (this.view.showLoadProgress) {
			this.view.closeProgressBar()
		}
	}
});



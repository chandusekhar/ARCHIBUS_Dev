var abGbFpDataDetailsController = View.createController('abGbFpDataDetailsCtrl', {
	dataController: View.getOpenerView().controllers.get('abGbFpDataCtrl'),
	dataFootprintsGrid: View.getOpenerView().panels.get("abGbFpData_fpList"),
	
	// true if the footprint record to be saved is a copy of another (click on "Copy as New")
	copyAsNew: false,
	
	// PK restriction of the source-footprint (to be copied)
	sourceFpPkRestriction: null,
	
	afterViewLoad:function(){
		this.abGbFpDataDetails_formFp.setMaxValue('gb_fp_setup.energystar_rating', 100);
		this.abGbFpDataDetails_formFp.setMinValue('gb_fp_setup.energystar_rating', 0);
		this.abGbFpDataDetails_formFp.setMinValue('gb_fp_setup.count_occup', 0);
		this.setMinValueForArea();
		this.abGbFpDataDetails_formFp.getFieldLabelElement("field_FactorsVersions").style.fontWeight = "bold";
		// KB 3031007
		$('postalLookup').value=getMessage('postalLookup');
	},
	
	/**
	 * Set min value for Ext Gross Area
	 * Created the function because min value is set twice in the code (see validateExistence())
	 */
	setMinValueForArea: function(){
		this.abGbFpDataDetails_formFp.setMinValue('gb_fp_setup.area_gross_ext', 0.01);
	},
	
	abGbFpDataDetails_formFp_onSave: function(){
		var form = this.abGbFpDataDetails_formFp;
		var copyAsNew = this.copyAsNew;
		
		if(!this.validateExistence('bl', false, form.getFieldValue("gb_fp_setup.bl_id")))
			return false;
		
		if(!this.validateExistence('scenario', false, form.getFieldValue("gb_fp_setup.scenario_id")))
			return false;
		
		if(!this.validateExistence('em', false, form.getFieldValue("gb_fp_setup.em_id")))
			return false;
		
		if(!this.validateExistence('gb_fp_egrid_subregions', false, form.getFieldValue("gb_fp_setup.subregion_code")))
			return false;
		
		if(!this.validateExistence('gb_fp_sectors', false, form.getFieldValue("gb_fp_setup.sector_name")))
			return false;
						
		if(!this.abGbFpDataDetails_formFp.save())
			return false;
		
		// copy the footprint source records if the user wants it
		this.copyAsNew = copyAsNew;
		var controller = this;
		if(this.copyAsNew){
			View.openDialog("ab-gb-fp-data-copy.axvw", this.sourceFpPkRestriction, false, {
				width: 500, 
			    height: 300,
			    destBl_id: this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.bl_id"),
			    destCalc_year: parseInt(this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.calc_year")),
			    destScenario_id: this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.scenario_id"),
			    callbackAfterCopy: function(){
	                controller.refreshAfterSave();
	    			View.showMessage(getMessage("sourcesCopied"));
	            }
			});
            this.copyAsNew = false;
		} else {
			this.refreshAfterSave();
		}
	},

	refreshAfterSave: function(){
	    /*
	     * Show, set restriction and refresh the other tabs besides Details tab
	     */
		var restriction = this.abGbFpDataDetails_formFp.getPrimaryKeyRestriction();
		var tabs = this.view.parentTab.parentPanel;
		for (var int = 1; int < tabs.tabs.length; int++) {
			var tab = tabs.tabs[int];
			tab.show(true);
			tab.enable(true);
			
			// for the tab Other, "personalize" the restriction 
			if(tab.name == "abGbFpData_tabFpOther") {
				if(restriction &&
						((restriction.clauses && restriction.clauses.length > 0)
								|| (restriction['gb_fp_setup.bl_id']))){
					var otherRestriction = this.dataController.buildRestr(this.dataController.tabsTables[tab.name], restriction);
					tabs.setTabRestriction(tab.name, otherRestriction);
				} else {
					tabs.setTabRestriction(tab.name, restriction);
				}
			} else {
				tabs.setTabRestriction(tab.name, restriction);
			}
			
			tabs.refreshTab(tab.name);
			
			// if the tab has sub-tabs then add tab restriction to all its sub-tabs.
			var tabContentFrame = tab.getContentFrame();
			if(tabContentFrame.View && tabContentFrame.View.panels.get(0).type == 'tabs'){
				this.dataController.addRestrToSubTabs(tabContentFrame.View.panels.get(0), tab.restriction);
			}
			
		}
		
		this.dataFootprintsGrid.refresh();
	},

	abGbFpDataDetails_formFp_onDelete: function(){
		var controller = this;
		var form = controller.abGbFpDataDetails_formFp;
		var bl_id = form.getFieldValue("gb_fp_setup.bl_id");
		var calc_year = form.getFieldValue("gb_fp_setup.calc_year");
		var scenario_id = form.getFieldValue("gb_fp_setup.scenario_id");
		var message = getMessage("confirmDelete").replace("{0}", "<BR/>").replace("{1}", bl_id).replace("{2}", calc_year).replace("{3}", scenario_id);
		
		View.confirm(message, function(button){
            if (button == 'yes') {
            	controller.abGbFpDataDetails_formFp.deleteRecord();
		
				// hide all tabs
				controller.hideAllTabs();
				
				// refresh the list of footprint buildings
				controller.dataFootprintsGrid.refresh();
            }
        })
	},

	/**
	 * Hide all tabs.
	 */
	hideAllTabs:function(){
		this.abGbFpDataDetails_formFp.show(false);
		var tabs = this.view.parentTab.parentPanel;
		for (var i = 0; i < tabs.tabs.length; i++) {
			var tab = tabs.tabs[i];
			tabs.hideTab(tab.name);
		}
	},
	
	
	/**
	 * Call the WFR calculateEmissions
	 */
	abGbFpDataDetails_formFp_onUpdateEmissions: function(){
		
		var bl_id= this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.bl_id");
		var calc_year = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.calc_year");
		var scenario_id = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.scenario_id");
		
		View.openDialog('ab-gb-fp-single-job.axvw', null, false,{
		    width: 880, 
		    height: 580, 
		    blId:bl_id,
		    calcYear: calc_year,
		    scenarioId: scenario_id
		});
		
	},
	
	abGbFpDataDetails_formFp_onCopyAsNew: function(){
		// retain the PK of the record
		this.sourceFpPkRestriction = this.abGbFpDataDetails_formFp.getPrimaryKeyRestriction();

		// copy the source footprint fields
		var sourceValues = this.copySourceFootprintFields();
		
		// call Add New action from Add New button in footprints list grid
		this.dataController.abGbFpData_fpList_onAddNew();
		
		// initialize panel with values from the source footprint
		this.setDestFootprintFields(sourceValues);
		
		// open Select Value of the Building Code field
		var blgSelValueCmd = this.abGbFpDataDetails_formFp.fields.get("gb_fp_setup.bl_id").actions.get('blId').command;
		blgSelValueCmd.handle();

		this.copyAsNew = true;
	},

	abGbFpDataDetails_formFp_afterRefresh: function(){
		this.setSubregionName();
		
		// reset the copy informations
		this.copyAsNew = false;
	},
	
	/**
	 * Copies from the current form the fields to initialize the form on "Copy as New" button
	 */
	copySourceFootprintFields: function(){
		var fieldsToExclude = "gb_fp_setup.bl_id,bl.zip,gb_fp_setup.area_gross_ext,gb_fp_setup.count_occup,gb_fp_setup.energystar_rating,gb_fp_setup.subregion_code,gb_fp_egrid_subregions.subregion_name";
		var form = this.abGbFpDataDetails_formFp;
		var values = [];

		form.fields.each(function(field) {
			var fieldName = field.getFullName();
			if(fieldsToExclude.indexOf(fieldName) == -1){
				values.push({name: fieldName, value: form.getFieldValue(fieldName)});
			}
        });
		
		return values;
	},

	/**
	 * Sets the specified fields with the specified values in the form (to initialize the new record on "Copy as New" button)
	 * @param {Array} sourceValues List of fields with the values to set
	 */
	setDestFootprintFields: function(sourceValues){
		var form = this.abGbFpDataDetails_formFp;

		for (var i = 0; i < sourceValues.length; i++) {
			var field = sourceValues[i];
			form.setFieldValue(field.name, field.value);
		}
	},

	/**
	 * Set Sub-Region Name field if not new record
	 */
	setSubregionName: function(){
		if(this.abGbFpDataDetails_formFp.newRecord)
			return;
		
		this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", "");
		parameters = {
	        tableName: "gb_fp_egrid_subregions",
	        fieldNames: toJSON(['gb_fp_egrid_subregions.subregion_name']),
	        restriction: toJSON(new Ab.view.Restriction({
	        	'gb_fp_egrid_subregions.version_type': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version_type"),
	        	'gb_fp_egrid_subregions.version_name': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version"),
	        	'gb_fp_egrid_subregions.subregion_code': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.subregion_code")
	        }))
	    };

		try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.dataSet.records.length > 0){
				this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", result.dataSet.records[0].getValue("gb_fp_egrid_subregions.subregion_name"));
			}
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Validate existence of values for fields that do not have foreign keys
	 * And set values in read-only fields
	 * @param {String} validationTable
	 * @param {boolean} setValues Set or not the values in read-only fields
	 * @param {String} selectedValue Value to validate in validationTable
	 */
	validateExistence: function(validationTable, setValues, selectedValue){
		var parameters = null;
		var errorMessage = "";
		var valueToValidate = "";
		
		switch (validationTable) {
			// Validate Building Code
			case 'bl':
				var bl_id = (selectedValue != undefined) ? selectedValue : this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.bl_id");
				valueToValidate = bl_id;
				if(valueExistsNotEmpty(bl_id)) {
					parameters = {
				        tableName: validationTable,
				        fieldNames: toJSON(['bl.bl_id','bl.zip','bl.area_gross_ext','bl.count_occup']),
				        restriction: toJSON(new Ab.view.Restriction({
				        	'bl.bl_id': bl_id
				        }))
				    };
					errorMessage = getMessage("errorSelectBuilding");
				}
				break;
	
			// Validate Scenario Code
			case 'scenario':
				var scenario_id = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.scenario_id");
				valueToValidate = scenario_id;
				parameters = {
			        tableName: validationTable,
			        fieldNames: toJSON(['scenario.proj_scenario_id']),
			        restriction: toJSON(new Ab.view.Restriction({
			        	'scenario.proj_scenario_id': scenario_id,
			        	'scenario.scenario_type': "GB-CARBON"
			        }))
			    };
				errorMessage = getMessage("errorSelectScenario");
				break;
	
			// Validate Employee Code
			case 'em':
				var em_id = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.em_id");
				valueToValidate = em_id;
				parameters = {
			        tableName: validationTable,
			        fieldNames: toJSON(['em.em_id']),
			        restriction: toJSON(new Ab.view.Restriction({
			        	'em.em_id': em_id
			        }))
			    };
				errorMessage = getMessage("errorSelectEmployee");
				break;
				
			// Validate Egrid Version Name
			case 'gb_fp_versions':
				var egrid_version = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version");
				valueToValidate = egrid_version;
				parameters = {
			        tableName: validationTable,
			        fieldNames: toJSON(['gb_fp_versions.version_type','gb_fp_versions.version_name']),
			        restriction: toJSON(new Ab.view.Restriction({
			        	'gb_fp_versions.version_type': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version_type"),
			        	'gb_fp_versions.version_name': egrid_version
			        }))
			    };
				errorMessage = getMessage("errorSelectEgridVersion");
				break;
	
			// Validate Egrid subregion Code
			case 'gb_fp_egrid_subregions':
				var subreg_id = (selectedValue != undefined) ? selectedValue : this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.subregion_code");
				valueToValidate = subreg_id;
				if(valueExistsNotEmpty(subreg_id)) {
					parameters = {
				        tableName: validationTable,
				        fieldNames: toJSON(['gb_fp_egrid_subregions.subregion_name']),
				        restriction: toJSON(new Ab.view.Restriction({
				        	'gb_fp_egrid_subregions.version_type': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version_type"),
				        	'gb_fp_egrid_subregions.version_name': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version"),
				        	'gb_fp_egrid_subregions.subregion_code': subreg_id
				        }))
				    };
					errorMessage = getMessage("errorSelectEgridSubregion");
				}
				break;
	
			// Validate Sector name
			case 'gb_fp_sectors':
				var sector_name = this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.sector_name");
				valueToValidate = sector_name;
				parameters = {
			        tableName: validationTable,
			        fieldNames: toJSON(['gb_fp_sectors.sector_name']),
			        restriction: toJSON(new Ab.view.Restriction({
			        	'gb_fp_sectors.sector_name': sector_name
			        }))
			    };
				errorMessage = getMessage("errorSelectSector");
				break;
	
			default:
				break;
		}
		
		if(!parameters){
			if(setValues){
				switch (validationTable) {
					case 'bl':
						this.abGbFpDataDetails_formFp.setFieldValue("bl.zip", "");
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.count_occup", "");
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.area_gross_ext", "");
						break;
		
					case 'gb_fp_egrid_subregions':
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", "");
						break;
		
					default:
						break;
				}
			}
			
			return true;
		}

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(valueToValidate, errorMessage))
			return false;

	    try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.dataSet.records.length <= 0){
				View.showMessage(errorMessage);
				return false;
			} else if(setValues) {
				switch (validationTable) {
					case 'bl':
						//KB 3031006 - format numeric values with decimals before calling setFieldValue, depending on the locale
						var ds = this.abGbFpDataDetails_formFp.getDataSource();

						this.abGbFpDataDetails_formFp.setFieldValue("bl.zip", result.dataSet.records[0].getValue("bl.zip"));
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.count_occup", ds.formatValue("gb_fp_setup.count_occup", result.dataSet.records[0].getValue("bl.count_occup"), true));

						// work around in order to not generate error message if bl.area_gross_ext=0
						this.abGbFpDataDetails_formFp.setMinValue('gb_fp_setup.area_gross_ext', 0);	// temporarily set min val = 0
						//KB 3031006 - format numeric values with decimals before calling setFieldValue, depending on the locale
						//this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.area_gross_ext", result.dataSet.records[0].getValue("bl.area_gross_ext"));
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.area_gross_ext", ds.formatValue("gb_fp_setup.area_gross_ext", result.dataSet.records[0].getValue("bl.area_gross_ext"), true));
						this.setMinValueForArea();	// reset min val = 0.01
						
						this.onChangeEgridVersion();
						break;
	
					case 'gb_fp_egrid_subregions':
						this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", result.dataSet.records[0].getValue("gb_fp_egrid_subregions.subregion_name"));
						break;
	
					default:
						break;
				}
			}
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    },

    /**
     * Gets the subregion(s) for the user selected egrid version and zip of the building;
     * (If not found, gets the subregion(s) for the app default egrid version and zip of the building;
     * If found, check that the subregion exists in subregions table for the user selected egrid version
     * )
     * Sets subregion code and name fields with the first found subregion
     * If more than one subregion found, displays message
     * @param {String} selectedValue Egrid Version Name
     */
    onChangeEgridVersion: function(selectedValue){
    	var selValue = (selectedValue != undefined) ? selectedValue : this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version");
    	var blZip = this.abGbFpDataDetails_formFp.getFieldValue("bl.zip");
    	var displayZipMessage = true;

    	this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.subregion_code", "");
    	this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", "");

    	// do nothing if any of version is empty
    	if(!valueExistsNotEmpty(selValue))
    		return;
    	
    	// validate existence of version if user typed it instead of selecting it
    	if(selectedValue == undefined) {
    		if(!this.validateExistence("gb_fp_versions", true))
    			return;
    	}

    	// search the zip's subregion code for user selected egrid version
    	var ds = this.abGbFpDataDetails_dsSubregions;
    	ds.addParameter("versionName", selValue);
	    var restriction = new Ab.view.Restriction({
        	'gb_fp_egrid_zip.version_type': this.abGbFpDataDetails_formFp.getFieldValue("gb_fp_setup.egrid_version_type"),
        	'gb_fp_egrid_zip.version_name': selValue
        });
	    if(valueExistsNotEmpty(blZip)){
	    	restriction.addClause('gb_fp_egrid_zip.zip', blZip, "=");
	    } else {
	    	displayZipMessage = false;
	    }
	    var records = ds.getRecords(restriction);
	    if(records.length <= 0){
	    	// search the zip's subregion code for app default egrid version
	    	var appDefaultVersion = getActivityParameter("AbRiskGreenBuilding", "egrid_ver_default");
	    	if(valueExistsNotEmpty(appDefaultVersion)){
		    	restriction.addClause('gb_fp_egrid_zip.version_name', appDefaultVersion, "=", "AND", true);
		    	ds.addParameter("versionName", selValue);
		    	records = ds.getRecords(restriction);
	    	}
		}

	    // display message if several subregions found
	    if(records.length > 0){
	    	this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_setup.subregion_code", records[0].getValue("gb_fp_egrid_zip.subregion_code"));
	    	this.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", records[0].getValue("gb_fp_egrid_subregions.subregion_name"));
	    	if(records.length > 1){
	    		var message =  (displayZipMessage ? getMessage('severalSubregionsZip') : getMessage('severalSubregions'));
		    	View.showMessage(message);
	    	}
	    }
    }
})

function afterSelectBl(fieldName, selectedValue, previousValue){
	abGbFpDataDetailsController.validateExistence('bl', true, selectedValue);
}

function afterSelectEgridVersion(fieldName, selectedValue, previousValue){
	if(fieldName == "gb_fp_setup.egrid_version"){
		abGbFpDataDetailsController.onChangeEgridVersion(selectedValue);
	}
}

function afterSelectEgridSubregion(fieldName, selectedValue, previousValue){
	if(fieldName == "gb_fp_setup.subregion_code"){
		abGbFpDataDetailsController.validateExistence('gb_fp_egrid_subregions', true, selectedValue);
	}
}

// set Subregion Name field, as the select value doesn't
function afterSelSubregionOnPostalLookup(fieldName, selectedValue, previousValue){
	if(fieldName == "gb_fp_egrid_subregions.subregion_name"){
		abGbFpDataDetailsController.abGbFpDataDetails_formFp.setFieldValue("gb_fp_egrid_subregions.subregion_name", selectedValue);
	}
}

/**
 * Shows a Select Value popup window on Postal Lookup action
 * Shows Egrid Subregion Postal Codes for the zip of the selected building
 * and (for the egrid version selected by the user
 * or for the app's default egrid version),
 * but testing that the subregion codes of the zips shown exist in Egrid Subregions table
 * @param {Object} commandObject
 */
function selSubregionOnPostalLookup(commandObject){
	//var form = commandObject.getParentPanel();
  var form = View.panels.get("abGbFpDataDetails_formFp")
	var version = form.getFieldValue("gb_fp_setup.egrid_version");
	var blZip = form.getFieldValue("bl.zip");
	
	// do nothing if any of version and zip is empty
	if(!valueExistsNotEmpty(version) || !valueExistsNotEmpty(blZip)){
		View.showMessage(getMessage("selectVersionAndZip"));
		return;
	}

	var appDefaultVersion = getActivityParameter("AbRiskGreenBuilding", "egrid_ver_default");
	var restriction = "gb_fp_egrid_zip.version_type = '" + form.getFieldValue("gb_fp_setup.egrid_version_type") + "'"
			+ " AND ("
			+ "gb_fp_egrid_zip.version_name = '" + version + "'"
			+ (valueExistsNotEmpty(appDefaultVersion) ? " OR gb_fp_egrid_zip.version_name = '" + appDefaultVersion + "'" : "")
			+ ") AND "
			+ "gb_fp_egrid_zip.zip = '" + blZip + "'"
			+ " AND EXISTS("
			+ "SELECT subregion_code FROM gb_fp_egrid_subregions"
			+ " WHERE version_type = 'gb_fp_egrid_subregions'"
			+ " AND version_name = '" + version + "'"
			+ " AND subregion_code = gb_fp_egrid_zip.subregion_code"
			+ ")";
			
 
	View.selectValue(form.id, getMessage('energyGridSubregion'),
					['gb_fp_setup.subregion_code','gb_fp_egrid_subregions.subregion_name'],
					'gb_fp_egrid_zip',
					['gb_fp_egrid_zip.subregion_code','gb_fp_egrid_subregions.subregion_name'],
					['gb_fp_egrid_zip.version_name','gb_fp_egrid_zip.subregion_code','gb_fp_egrid_subregions.subregion_name','gb_fp_egrid_zip.zip'],
					restriction, 'afterSelSubregionOnPostalLookup');
}

/**
 * Listener for 'Select Value' action for 'gb_fp_setup.subregion_code' field.
 */
function selectSubRegion(){
	
	var restriction = "1=1";
	if(View.panels.get('abGbFpDataDetails_formFp').getFieldValue('gb_fp_setup.egrid_version')){
		
		restriction = new Ab.view.Restriction();
		restriction.addClause('gb_fp_egrid_subregions.version_name', View.panels.get('abGbFpDataDetails_formFp').getFieldValue('gb_fp_setup.egrid_version'));
		
	}
	
	View.selectValue('abGbFpDataDetails_formFp', getMessage('energyGridSubregion'),
					['gb_fp_setup.egrid_version_type','gb_fp_setup.egrid_version','gb_fp_setup.subregion_code'],
					'gb_fp_egrid_subregions',
					['gb_fp_egrid_subregions.version_type','gb_fp_egrid_subregions.version_name','gb_fp_egrid_subregions.subregion_code'],
					['gb_fp_egrid_subregions.version_name','gb_fp_egrid_subregions.subregion_code','gb_fp_egrid_subregions.subregion_name'],
					restriction, 'afterSelectEgridSubregion', false);
}

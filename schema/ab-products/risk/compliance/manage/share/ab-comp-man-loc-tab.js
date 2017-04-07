/**
* @author Song
*/
var commLocationsController = View.createController('commLocationsController',{	
	disableTabsArr: new Array(['events',false],['docs',false],['commLogs',false]),
	disableTabsArrForDelete:new Array(['editLocation',false],['events',false],['docs',false],['commLogs',false]),
	enableTabsArr: new Array(['events',true],['docs',true],['commLogs',true]),
	enableTabsArrForOtherSave: new Array(['events',false],['docs',true],['commLogs',true]),

	//restriction from select  grid in first tab
	selectRes: " 1=1 ", 

	/**
     * This function is called when the page is loaded into the browser.
     */
	compLocationTabs:null,
	mainController:null,
	type: 'regulation',
	
	/**
	 * a common grid show the north, for 'regulation' , 'program' or 'requirement'.
	 */
	grid: null,
	/**
	 * main tabs panel 'sbfDetailTabs'. 
	 */
	panelTabs: null,
	
    afterInitialDataFetch: function(){
    	//change 'View.parentTab.parentPanel' to 'this.mainController.sbfDetailTabs', fix 'error View.parentTab is null' issue.
    	this.mainController=View.getOpenerView().controllers.get(0);
    	this.panelTabs = this.mainController.sbfDetailTabs;
    	
    	if(!this.panelTabs.location_id){
    		commLocationsController.regLocForm.showField('regloc.regulation', false);
    		commLocationsController.regLocForm.showField('regloc.reg_program', false);
    		commLocationsController.regLocForm.showField('regloc.reg_requirement', false);
    		var layoutManager = View.getLayoutManager('main');
    		layoutManager.expandRegion('north');
	    	if(this.mainController){
	    		this.mainController.commLocationsController=commLocationsController;
	    	}
	    	
	    	this.setCustomRestriction();
	    	if(this.grid==null){
	    		this.grid=this.regLocGrid;
	    	}
	    	this.grid.refresh();
	    	
			//check if it's report model. 
			if(this.mainController.isReport&&this.mainController.isReport==true){
				this.setReportMode();
			}
//			check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
			if(this.mainController.isCoordinator&&this.mainController.isCoordinator==true){
			  	this.regLocGridForRequirement.actions.get("addNewForRequirement").show(false);
			}
			if(this.grid.rows.length>0){
				hideEmptyColumnsByPrefix(this.grid, "compliance_locations.");
			}
    	}else{
    		this.compLocationTabs=this.mainController.compLocationTabs;
    		this.regLocGrid.show(false);
    		
    		var layoutManager = View.getLayoutManager('main');
    	    layoutManager.collapseRegion('north');
    	    
    		commLocationsController.compLocForm.newRecord = false;
    		commLocationsController.regLocForm.newRecord = false;
    		var restriction = "location_id = "+this.panelTabs.location_id;
    		commLocationsController.compLocForm.refresh(restriction);
    		commLocationsController.regLocForm.refresh(restriction);
    	}
    	
    	setDefineFormAndGridTitle();
    },
    
    // Hide the forms after tab change (IE will crash if panels are hidden beforeTabChange).
    afterTabChange: function(){
    	
    	if(!this.panelTabs.location_id){
    		this.compLocForm.show(false);
    		this.regLocForm.show(false);
    	}
		},
		    
    /**
     * hidden special fields for different restriction.
     */
    hiddenSpecialFileds: function(){
    	//kb 3035751 change according new spec30.
    	if (this.type=="regulation" || this.type=="reg_program") {
    		this.compLocForm.showField("compliance_locations.em_id", false);
    	    this.regLocForm.showField("regloc.event_offset", false);
        }
    },
    /**
     * call after afterInitialDataFetch.
     */
    setCustomRestriction: function(){
    	//for 'ab-comp-requirement.axvw'
    	if(this.mainController.regrequirement){
    		this.type = 'reg_requirement';
    		
    		this.regLocGrid.show(false);
    		this.regLocGridForProgram.show(false);
    		this.regLocGridForRequirement.show(true);
    		
    		this.grid = this.regLocGridForRequirement;
   
			this.selectRes = " regloc.reg_requirement='"+this.mainController.regrequirement+"' and regloc.reg_program='"+this.mainController.regprogram+"' and regloc.regulation='"+this.mainController.regulation+"' ";
    	}
    	//for 'ab-comp-regprogram.axvw'
    	else if(this.mainController.regprogram){
    		this.type = 'reg_program';
    		
    		this.regLocGrid.show(false);
    		this.regLocGridForProgram.show(true);
    		this.regLocGridForRequirement.show(false);
    		
    		this.grid = this.regLocGridForProgram;
			this.selectRes = "regloc.reg_requirement IS NULL and regloc.reg_program='"+this.mainController.regprogram+"' and regloc.regulation='"+this.mainController.regulation+"' ";
    	}
    	//for 'ab-comp-regulation.axvw'
    	else if(this.mainController.regulation){
    		this.type = 'regulation';
    		this.grid = this.regLocGrid;
			this.selectRes = "regloc.reg_program IS NULL and regloc.regulation='"+this.mainController.regulation+"' ";
    	}
		this.grid.addParameter("regRequireRes", this.selectRes);
   		this.hiddenSpecialFileds();
    },

	setReportMode:function(){
		enableAllFieldsOfPanel(this.compLocForm,false);
		hideActionsOfPanel(this.compLocForm, new Array("addNew","saveAndAddNew", "copyAsNew", "save", "delete", "cancel") ,false);
		enableAllFieldsOfPanel(this.regLocForm,false);
		hideActionsOfPanel(this.regLocForm, new Array("addNew","saveAndAddNew", "copyAsNew", "save", "delete", "cancel") ,false);
	},
    
	controlTabs:function(){
		
	},	
	regLocGrid_onAddNewForRegulation:function(){
		this.invokeAddNew();
	},
	regLocGridForProgram_onAddNewForProgram:function(){
		this.invokeAddNew();
	},
	regLocGridForRequirement_onAddNewForRequirement:function(){
		this.invokeAddNew();
	},
	/**
	 * when add new button click.
	 */
	invokeAddNew: function(){
		this.regLocForm.newRecord = true;
		this.regLocForm.refresh();
		if(this.mainController.regulation){
			this.regLocForm.setFieldValue("regloc.regulation",this.mainController.regulation);
		}
    	if(this.mainController.regprogram){
			  this.regLocForm.setFieldValue("regloc.regulation",this.mainController.regulation);
    		this.regLocForm.setFieldValue("regloc.reg_program",this.mainController.regprogram);
    	}
    	if(this.mainController.regrequirement){
			  this.regLocForm.setFieldValue("regloc.regulation",this.mainController.regulation);
    		this.regLocForm.setFieldValue("regloc.reg_program",this.mainController.regprogram);
    		this.regLocForm.setFieldValue("regloc.reg_requirement",this.mainController.regrequirement);
    	}
    	this.regLocForm.setFieldValue("regloc.hcm_labeled",1);
    	

		this.compLocForm.newRecord = true;
		this.compLocForm.refresh();
    	
    	setDefineFormAndGridTitle();
	
	},
	compLocForm_onCopyAsNew:function(){
		var record = this.regLocForm.getRecord();
		this.regLocForm.newRecord = true;
		this.regLocForm.setRecord(record);
		this.regLocForm.setFieldValue('regloc.location_id','');
		
	    record = this.compLocForm.getRecord();
		this.compLocForm.newRecord = true;
		this.compLocForm.setRecord(record);
		this.compLocForm.setFieldValue('compliance_locations.location_id','');
		
		if(this.mainController.regulation){
			this.regLocForm.setFieldValue("regloc.regulation",this.mainController.regulation);
		}
    	//for 'ab-comp-regprogram.axvw'
    	if(this.mainController.regprogram){
    		this.regLocForm.setFieldValue("regloc.reg_program",this.mainController.regprogram);
    	}
    	if(this.mainController.regrequirement){
    		this.regLocForm.setFieldValue("regloc.reg_requirement",this.mainController.regrequirement);
    	}
    	
    	if(this.panelTabs.location_id){
			
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArr);
		}
	},
	/**
	 * check if exists duplicate location.
	 */
	checkIfDuplicateLocation: function(){
		var location_id = -1;
		if (!this.regLocForm.newRecord){
	    location_id = this.regLocForm.getFieldValue("regloc.location_id");			
		}
		
		var regulation = this.regLocForm.getFieldValue("regloc.regulation");
		var regprogram = this.regLocForm.getFieldValue("regloc.reg_program");
		var regrequirement = this.regLocForm.getFieldValue("regloc.reg_requirement");
		
		var compJsonObj={
				'regulation' : regulation,
				'reg_program' : regprogram,
				'reg_requirement' : regrequirement
			}
		if(regulation!=''){
			try{
				//type one of 'regulation'/'reg_program'/'reg_requirement'
				var result = Workflow.callMethod("AbRiskCompliance-ComplianceCommon-chkDupLocations",
						compJsonObj, this.compLocForm.getOutboundRecord().values, this.type, location_id*1);
				if(result.value != ""){
	 				if(result.value=="NULL" || result.value=="null"){
					  setFormFieldValues(this.compLocForm, result.dataSet);
	 					return true;
	 				}else{
	 					return false;
	 				}
	 			}
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	},
	
	/**
	 * save all fields of compliance_locations and related regloc.
	 */
	compLocForm_onSave: function(){
		
		if (!this.compLocForm.hasFieldValues()){
			View.alert(getMessage("addFieldsEmpty"));
			return;
		}
		var lat = this.compLocForm.getFieldValue("compliance_locations.lat");
		var lon = this.compLocForm.getFieldValue("compliance_locations.lon");
		if((valueExistsNotEmpty(lat)&&!valueExistsNotEmpty(lon))||(valueExistsNotEmpty(lon)&&!valueExistsNotEmpty(lat))){
			View.alert(getMessage("checkLatitudeAndLongitude"));
			return;
		}
		//check if exists duplicate location.
		if(!this.checkIfDuplicateLocation()){
			View.alert(getMessage("duplicateLocation"));
			return;
		}
		//kb 3036040 fix the issue: when bad value input and save form. the entire tab region remains disabled. 
//		 There is no way to use the tab again unless you reload the view.
		var saveCompFormResult = this.compLocForm.save();
		if(saveCompFormResult){
			if(this.regLocForm.newRecord){
				var location_id = this.compLocForm.getFieldValue("compliance_locations.location_id");
				this.regLocForm.setFieldValue("regloc.location_id", location_id);
			}
			var saveRegLocResult = this.regLocForm.save();
			if(saveRegLocResult){
				this.grid.refresh();
				var reg_requirement = this.regLocForm.getFieldValue('regloc.reg_requirement');
				if(this.panelTabs.location_id){
					if(this.panelTabs.manageLocationController){
						this.panelTabs.manageLocationController.northConsole_onFilter();
					}
					
					if(this.panelTabs.assignController){
						this.panelTabs.assignController.regLocGrid.refresh();
					}
					
					if(reg_requirement){
						enableAndDisableTabs(this.compLocationTabs,this.enableTabsArr);
					}else{
						enableAndDisableTabs(this.compLocationTabs,this.enableTabsArrForOtherSave);
					}
					
				}
				setDefineFormAndGridTitle();
				//3035722 add this method fix the issue when save with new change grid didn't reflect.
				hideEmptyColumnsByPrefix(this.grid, "compliance_locations.");
			}else{
				if(this.regLocForm.newRecord){
					var record = this.compLocForm.getRecord(); 
	            	var dataSource = View.dataSources.get("dsCompLocForm");
	            	dataSource.deleteRecord(record);
					this.compLocForm.newRecord = true;
					this.compLocForm.refresh();
				}
			}
		}
	},
	
	/**
	 * save and add new.
	 */
	compLocForm_onSaveAndAddNew: function(){
		this.compLocForm_onSave();
		this.regLocGrid_onAddNewForRegulation();
		if(this.panelTabs.location_id){
			if(this.panelTabs.manageLocationController){
				this.panelTabs.manageLocationController.northConsole_onFilter();
			}
			
			if(this.panelTabs.assignController){
				this.panelTabs.assignController.regLocGrid.refresh();
			}
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArr);
		}
	},
	/**
	 * when delete button click.
	 */
	compLocForm_onDelete: function(){
		
        var confirmMessage = getMessage("messageConfirmDelete");
        var innerThis = this;
        //add confirm when on delete.
        View.confirm(confirmMessage, function(button){
        	
            if (button == 'yes') {
            	var location_id = innerThis.compLocForm.getFieldValue("compliance_locations.location_id");
            	var record = innerThis.regLocForm.getRecord(); 
            	var dataSource = View.dataSources.get("dsRegLocForm");
            	dataSource.deleteRecord(record);
            	try{
            		Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteLocation',location_id,0);
            	}catch(e){
            		Workflow.handleError(e);
            	}
            	innerThis.grid.refresh();
            	innerThis.compLocForm.show(false);
            	innerThis.regLocForm.show(false);
            	
            	if(innerThis.panelTabs.location_id){
            		if(innerThis.panelTabs.manageLocationController){
            			innerThis.panelTabs.manageLocationController.northConsole_onFilter();
            		}
            		
            		if(innerThis.panelTabs.assignController){
            			innerThis.panelTabs.assignController.regLocGrid.refresh();
            		}
            		
            		
            		enableAndDisableTabs(innerThis.compLocationTabs,innerThis.disableTabsArrForDelete);
            		innerThis.compLocationTabs.selectTab('manageLocation');
            	}
            }
        });   
	},
	
	compLocForm_onCancel: function(){
         
        this.regLocForm.show(false);
        this.compLocForm.show(false);
		
		if(this.panelTabs.location_id){
			
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArrForDelete);
			this.compLocationTabs.selectTab('manageLocation');
		}
	},

	/**
	* Event Handler of action "Doc"
	*/
	regLocGrid_onDocForRegulation: function(){
		var	parameters = {};
		parameters.selectRes = this.selectRes;
		View.openPaginatedReportDialog("ab-comp-reg-loc-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Doc"
	*/
	regLocGridForProgram_onDocForProgram : function(){
		var	parameters = {};
		parameters.selectRes = this.selectRes;
		View.openPaginatedReportDialog("ab-comp-prog-loc-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Doc"
	*/
	regLocGridForRequirement_onDocForRequirement : function(){
		var	parameters = {};
		parameters.selectRes = this.selectRes;
		View.openPaginatedReportDialog("ab-comp-req-loc-paginate-rpt.axvw" ,null, parameters);
	}
});

/**
 * when click edit button.
 */
function onEdit(){
	commLocationsController.compLocForm.newRecord = false;
	commLocationsController.regLocForm.newRecord = false;
	var grid = commLocationsController.grid;
	var row = grid.rows[grid.selectedRowIndex];
	var location_id = row["regloc.location_id"];
	var restriction = "location_id = "+location_id;
	commLocationsController.compLocForm.refresh(restriction);
	commLocationsController.regLocForm.refresh(restriction);
	setDefineFormAndGridTitle();
	//check if it's coordinator model. use for 'Manage My Permits and Licenses'  and  'Manage My Compliance Requirements'
	// Panel 2 ?Disable all fields except Compliance Level Code, and hide all actions except Save and Cancel.
	if(commLocationsController.mainController.isCoordinator&&commLocationsController.mainController.isCoordinator==true){
		
		enableAllFieldsOfPanel(commLocationsController.compLocForm,false);
		enableAllFieldsOfPanel(commLocationsController.regLocForm,false);
		commLocationsController.regLocForm.enableField("regloc.comp_level", true);
		hideActionsOfPanel(commLocationsController.compLocForm, new Array("saveAndAddNew", "copyAsNew", "delete"), false);
	}
}
/**
 * reset edit form title.
 */
function setDefineFormAndGridTitle(){
	if(commLocationsController.mainController.regrequirement){
		commLocationsController.compLocForm.setTitle(getMessage('formTitleRequirement'));
		commLocationsController.regLocGrid.setTitle(getMessage('gridTitleRequirement'));
	}
	//for 'ab-comp-regprogram.axvw'
	else if(commLocationsController.mainController.regprogram){
		commLocationsController.compLocForm.setTitle(getMessage('formTitleProgram'));
		commLocationsController.regLocGrid.setTitle(getMessage('gridTitleProgram'));
	}
	else if(commLocationsController.mainController.regulation){
		commLocationsController.compLocForm.setTitle(getMessage('formTitleRegulation'));
		commLocationsController.regLocGrid.setTitle(getMessage('gridTitleRegulation'));
	}
}
/**
 * select other fields.
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectOthers(fieldName, selectedValue, previousValue){
//	alert(1);
	var form = View.panels.get("regLocForm");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}	
}

// TODO: remove below useless function since it's not called anymore
function onViewButtonClick(){
    var grid = View.panels.get('regLocGrid');
    var rowIndex = grid.rows[grid.selectedRowIndex];
    var reglocId = rowIndex["regloc.location_id"];
    
    var compLocForm = View.panels.get('compLocForm');
    var regLocForm = View.panels.get('regLocForm');
    compLocForm.refresh("compliance_locations.location_id = "+reglocId);
    compLocForm.showInWindow({
		width: 800,
		height: 500,
		buttonsPosition: "footer",
		closeButton: true
	});
    
    
    var clickedNodeName = commLocationsController.mainController.clickedNodeName;
	if(typeof(clickedNodeName)!="undefined"){
		if(clickedNodeName=="regulation"){
			commLocationsController.compLocForm.setTitle(getMessage('formTitleRegulation'));
		}else if(clickedNodeName=="comprogram"){
			commLocationsController.compLocForm.setTitle(getMessage('formTitleProgram'));
		}else{
			commLocationsController.compLocForm.setTitle(getMessage('formTitleRequirement'));
		}
	}
}

/**
 * Action Listener for select value button 'fl'.
 */
function afterSelectFloorOrRoom(fieldName, selectedValue, previousValue){
	var form = commLocationsController.compLocForm; 
	if(fieldName.indexOf("bl_id")!=-1){
		var bl_id = selectedValue;
    	var dsBlForJS = View.dataSources.get("dsBlForJS");
    	var record = dsBlForJS.getRecords("bl_id = '"+selectedValue+"'")[0];  
        form.setFieldValue("compliance_locations.ctry_id", record.getValue('bl.ctry_id'));
        form.setFieldValue("compliance_locations.site_id", record.getValue('bl.site_id'));
        form.setFieldValue("compliance_locations.regn_id", record.getValue('bl.regn_id'));
        form.setFieldValue("compliance_locations.state_id", record.getValue('bl.state_id'));
        form.setFieldValue("compliance_locations.city_id", record.getValue('bl.city_id'));
        form.setFieldValue("compliance_locations.pr_id", record.getValue('bl.pr_id'));
        form.setFieldValue("compliance_locations.lat", record.getValue('bl.lat'));
        form.setFieldValue("compliance_locations.lon", record.getValue('bl.lon'));
        form.setFieldValue("compliance_locations.geo_region_id", record.getValue('ctry.geo_region_id'));
        form.setFieldValue("compliance_locations.county_id", record.getValue('property.county_id'));
	}
}

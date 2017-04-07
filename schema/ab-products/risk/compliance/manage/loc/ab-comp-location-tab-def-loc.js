/**
* @author lei
*/
var locationsController = View.createController('locationsController',{	
	disableTabsArr: new Array(['events',false],['docs',false],['commLogs',false]),
	disableTabsArrForDelete:new Array(['editLocation',false],['events',false],['docs',false],['commLogs',false]),
	enableTabsArr: new Array(['events',true],['docs',true],['commLogs',true]),
	enableTabsArrForOtherSave: new Array(['events',false],['docs',true],['commLogs',true]),
	
	allFields: new Array(['regloc.event_offset'],['regloc.resp_person'],['regloc.comp_level'],['regloc.vn_id'],['regloc.description']),
	enableFields: new Array(['regloc.resp_person'],['regloc.comp_level'],['regloc.vn_id'],['regloc.description']),
	
	/**
     * This function is called when the page is loaded into the browser.
     */
	compLocationTabs:null,
	mainController:null,
	
    afterInitialDataFetch: function(){
    	if(View.parentTab.parentPanel.location_id){
    		
    		this.mainController=View.getOpenerView().controllers.get(0);
    		
    		this.compLocationTabs=this.mainController.compLocationTabs;
    	    
    		//when we add a new record.
    		if(View.parentTab.parentPanel.creatNewRecord=='newRecord'){
    			//this.regLocForm.clear();
    			View.parentTab.parentPanel.creatNewRecord='oldRecord';
	    		this.compLocForm.newRecord = true;
	    		this.regLocForm.newRecord = true;
	    		this.compLocForm.refresh();
	    		this.regLocForm.refresh();
	    		
    		}else{
	    		//this.regLocForm.clear();
	    		this.compLocForm.newRecord = false;
	    		this.regLocForm.newRecord = false;
	    		var restriction = "location_id = "+View.parentTab.parentPanel.location_id;
	    		
	    		this.compLocForm.refresh(restriction);
	    		this.regLocForm.refresh(restriction);
    		}
    		
    	}
    	//Decide if disable field 
		this.regLocForm_afterRefresh();
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
		
    	if(View.parentTab.parentPanel.location_id){
			
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArr);
		}

    	//Decide if disable field 
		this.regLocForm_afterRefresh();
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
		
		var type='';
		if(regulation!=''&&regprogram==''&&regrequirement==''){
			
			type="regulation";
			
		}else if(regulation!=''&&regprogram!=''&&regrequirement==''){
			
			type="reg_program";
			
		}else if(regulation!=''&&regprogram!=''&&regrequirement!=''){
			
			type="reg_requirement";
			
		}else{
			//if  we do not select any regulation ,we don't check duplicate
			return true;
		}
		if(regulation!=''){
			try{
				
				//type one of 'regulation'/'reg_program'/'reg_requirement'
				var result = Workflow.callMethod("AbRiskCompliance-ComplianceCommon-chkDupLocations",
						compJsonObj, this.compLocForm.getOutboundRecord().values, type, location_id*1);
				if(result.value != ""){
	 				if(result.value=="NULL" || result.value=="null"){
	 					var lat = this.compLocForm.getFieldValue("compliance_locations.lat");
	 					var lon = this.compLocForm.getFieldValue("compliance_locations.lon");
	 					if(!lat && !lon) {
	 						setFormFieldValues(this.compLocForm, result.dataSet);
	 					}
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

		if(!this.compLocForm.hasFieldValues()){
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
		
		var result = this.compLocForm.save();
		
    // If this was a new record and still marked new, then save failed, nothing more to do
    if (this.compLocForm.newRecord || !result) {
      return;
    }
							
		if(this.regLocForm.newRecord){
			var lid = this.compLocForm.getFieldValue("compliance_locations.location_id");
			this.regLocForm.setFieldValue("regloc.location_id", lid);
		}
		result = this.regLocForm.save();

    // If this was a new record and still marked new, then save failed, nothing more to do
    if (this.regLocForm.newRecord || !result) {
      return;
    }
	
		if(View.parentTab.parentPanel.location_id){
			if(View.parentTab.parentPanel.manageLocationController){
				View.parentTab.parentPanel.manageLocationController.northConsole_onFilter();
			}
			
			if(View.parentTab.parentPanel.assignController){
				View.parentTab.parentPanel.assignController.regLocGrid.refresh();
			}
						
		}
	
		locationsController.mainController.setOthersTabRefreshObj(['editLocation'], 1);
		var location_id = this.regLocForm.getFieldValue("regloc.location_id");
		var regulation = this.regLocForm.getFieldValue("regloc.regulation");
		var regprogram = this.regLocForm.getFieldValue("regloc.reg_program");
		var regrequirement = this.regLocForm.getFieldValue("regloc.reg_requirement");
		
		if(valueExistsNotEmpty(regrequirement)){
			enableAndDisableTabs(this.compLocationTabs,this.enableTabsArr);
		}else{
			enableAndDisableTabs(this.compLocationTabs,this.enableTabsArrForOtherSave);
		}
		
		var recordComLoc=this.dsCompLocForm.getRecords('location_id='+location_id)[0];
		var instructionStr=generateInstruction(regulation,regprogram,regrequirement,recordComLoc);
	
		this.mainController.instructionStr=instructionStr;
		this.mainController.location_id=location_id;
		this.mainController.regulation=regulation;
		this.mainController.regprogram=regprogram;
		this.mainController.regrequirement=regrequirement;
		
		//Decide if disable field 
		this.regLocForm_afterRefresh();		
		
	},
	
	
	/**
	 * save and add new.
	 */
	compLocForm_onSaveAndAddNew: function(){
		this.compLocForm_onSave();
		
		
		this.regLocForm.newRecord = true;
		this.regLocForm.refresh();

		this.compLocForm.newRecord = true;
		this.compLocForm.refresh();
		
		if(View.parentTab.parentPanel.location_id){
			if(View.parentTab.parentPanel.manageLocationController){
				View.parentTab.parentPanel.manageLocationController.northConsole_onFilter();
			}
			
			if(View.parentTab.parentPanel.assignController){
				View.parentTab.parentPanel.assignController.regLocGrid.refresh();
			}
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArr);
		}
		
		//Decide if disable field 
		this.regLocForm_afterRefresh();
		
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
            	
                var record = innerThis.regLocForm.getRecord(); 
                var dataSource = View.dataSources.get("dsRegLocForm");
                dataSource.deleteRecord(record);
                
                var location_id = innerThis.compLocForm.getFieldValue("compliance_locations.location_id");
        		
        			try{
        			    Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteLocation',location_id,0);
        			}catch(e){
        				Workflow.handleError(e);
        			}
        		
        		innerThis.compLocForm.show(false);
        		innerThis.regLocForm.show(false);
        		
        		if(View.parentTab.parentPanel.location_id){
        			if(View.parentTab.parentPanel.manageLocationController){
        				View.parentTab.parentPanel.manageLocationController.northConsole_onFilter();
        			}
        			
        			if(View.parentTab.parentPanel.assignController){
        				View.parentTab.parentPanel.assignController.regLocGrid.refresh();
        			}
        			
        			
        			enableAndDisableTabs(innerThis.compLocationTabs,innerThis.disableTabsArrForDelete);
        			innerThis.compLocationTabs.selectTab('manageLocation');
        		}
            }
        });     
	},
	
	/**
	 * Hide regLocForm and compLocForm form and control type if disable
	 */
	compLocForm_onCancel: function(){
         
        this.regLocForm.show(false);
        this.compLocForm.show(false);
		
		if(View.parentTab.parentPanel.location_id){
			
			enableAndDisableTabs(this.compLocationTabs,this.disableTabsArrForDelete);
			this.compLocationTabs.selectTab('manageLocation');
		}
	},
	
	/**
	 * Refresh after form refreshed for 
	 * Disable Event Schedule Offset and all fields below <blank> row, except Description.  When Program Code is populated, 
	 * enable all fields except Event Schedule Offset.  When a Requirement Code is populated, enable all fields including Event Schedule 
	 * Offset.
	 */
	regLocForm_afterRefresh:function(){
		var regulation=this.regLocForm.getFieldValue("regloc.regulation");
		var reg_program=this.regLocForm.getFieldValue("regloc.reg_program");
		var reg_requirement=this.regLocForm.getFieldValue("regloc.reg_requirement");
		
		if(regulation!=""&&reg_program!=""&&reg_requirement!=""){
			//requirent
			enableAndDisableField(1);
			
		}else if(regulation!=""&&reg_program!=""&&reg_requirement==""){
			enableAndDisableField(0);//program
			
		}else{
			//regulation
			enableAndDisableField(2);
		}
	}
	
});

function enableAndDisableField(index){
	  var c=locationsController;
	   if(index==0){  // program
		   for(var i=0;i<locationsController.enableFields.length;i++){
				c.regLocForm.enableField(c.enableFields[i], true) ;
			}
		   c.regLocForm.enableField("regloc.event_offset", false) ;
	   }else if(index==1){  // requirement
		  
		   for(var i=0;i<c.allFields.length;i++){
				c.regLocForm.enableField(c.allFields[i], true) ;
			}
	   }else if(index==2){  // regulation
		   for(var i=0;i<c.allFields.length;i++){
				c.regLocForm.enableField(c.allFields[i], false) ;
			}
			c.regLocForm.enableField('regloc.description', true) ;
	   }
 }
 
function afterSelectChange(fieldName, selectedValue, previousValue){
	 if(fieldName=='regloc.reg_program'){
		 enableAndDisableField(0);
	 }else if(fieldName=='regloc.reg_requirement'){
		 enableAndDisableField(1);
	 }else{
		 enableAndDisableField(2);
	 }
}

/**
 * select other fields.
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectOthers(fieldName, selectedValue, previousValue){
	var form = View.panels.get("regLocForm");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}	
}

/**
 * Action Listener for select value button 'fl'.
 */
function afterSelectFloorOrRoom(fieldName, selectedValue, previousValue){
	var form = locationsController.compLocForm; 
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

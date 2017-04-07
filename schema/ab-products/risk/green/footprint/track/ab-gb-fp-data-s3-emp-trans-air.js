var abGbFpDataS3EmpTransAir_ctrl = View.createController('abGbFpDataS3EmpTransAir_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
    version_name: null,
    version_type: null,
    
    afterInitialDataFetch: function(){
    
        this.version_type = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.comm_airc_version_type');
        this.version_name = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.comm_airc_version');
        
        customizeUnitField(this.abGbFpDataS3EmpTransAir_form, "gb_fp_s3_em_air.units", "DISTANCE-MILES");
        
    },

	abGbFpDataS3EmpTransAir_grid_onAddNew: function(){
		this.abGbFpDataS3EmpTransAir_form.refresh(this.abGbFpDataS3EmpTransAir_grid.restriction, true);
	},

	abGbFpDataS3EmpTransAir_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3EmpTransAir_form_onSave())
			this.abGbFpDataS3EmpTransAir_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3EmpTransAir_form' panel
     */
	abGbFpDataS3EmpTransAir_form_onSave: function(){
		this.abGbFpDataS3EmpTransAir_form.fields.get("gb_fp_s3_em_air.distance").clear();
		
        if (!this.abGbFpDataS3EmpTransAir_form.canSave()
        		|| !validateField('seating_type', getMessage('errSeating'))
        		|| !validateField('distance_type', getMessage('errDistance')))
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3EmpTransAir_form, "gb_fp_s3_em_air.distance_entry", "gb_fp_s3_em_air.distance", "gb_fp_s3_em_air.units", "gb_fp_s3_em_air.units_type")) {
                return false;
            }
           
            this.abGbFpDataS3EmpTransAir_form.save();
            
            var bl_id = this.abGbFpDataS3EmpTransAir_form.getFieldValue("gb_fp_s3_em_air.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3EmpTransAir_form.getFieldValue("gb_fp_s3_em_air.calc_year"));
            var scenario_id = this.abGbFpDataS3EmpTransAir_form.getFieldValue("gb_fp_s3_em_air.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3EmpTransAir_form.getFieldValue("gb_fp_s3_em_air.source_id"));
            
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3EmployeeAircraft",bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3EmpTransAir_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
		
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3EmpTransAir_form' panel
     */
	abGbFpDataS3EmpTransAir_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3EmpTransAir_form ,this.abGbFpDataS3EmpTransAir_grid);
		
	}
	
});


/**
 * Listener for 'selectValue' action of the  'gb_fp_s3_em_air.distance_type' field.
 * 
 */
function selectDistanceTypeValue(){

    var seatClassRestr = " 1=1 "
	var seatClass = View.panels.get('abGbFpDataS3EmpTransAir_form').getFieldValue('gb_fp_s3_em_air.seating_type');
	if(seatClass){
		seatClassRestr = " gb_fp_comm_airc_data.seating_type ='" + seatClass + "'";
	}
	
	Ab.view.View.selectValue('abGbFpDataS3EmpTransAir_form', 
				getMessage('selectDistance'), 
				['gb_fp_s3_em_air.seating_type', 'gb_fp_s3_em_air.distance_type'], 
				'gb_fp_comm_airc_data', 
				['gb_fp_comm_airc_data.seating_type', 'gb_fp_comm_airc_data.distance_type'], 
				['gb_fp_comm_airc_data.version_name', 'gb_fp_comm_airc_data.seating_type', 'gb_fp_comm_airc_data.distance_type '], 
				" gb_fp_comm_airc_data.version_name = '" + abGbFpDataS3EmpTransAir_ctrl.version_name 
				+ "' and gb_fp_comm_airc_data.version_type = '" + abGbFpDataS3EmpTransAir_ctrl.version_type 
				+ "' and " + seatClassRestr, 
				null, false, false , null, null, null, 'grid', 0, 
				"[{'fieldName': 'gb_fp_comm_airc_data.version_name', 'sortOrder': 1},{'fieldName': 'gb_fp_comm_airc_data.seating_type', 'sortOrder': 1},{'fieldName': 'gb_fp_comm_airc_data.distance_type', 'sortOrder': 1}]");

}


/**
 * Listener for 'selectValue' action of the  'gb_fp_s3_em_air.seating_type' field.
 * 
 */
function selectSeatTypeValue(){

    Ab.view.View.selectValue('abGbFpDataS3EmpTransAir_form', 
				getMessage('selectSeat'), 
				['gb_fp_s3_em_air.seating_type', 'gb_fp_s3_em_air.seating_type'], 
				'gb_fp_comm_airc_data', 
				['gb_fp_comm_airc_data.seating_type'], 
				['gb_fp_comm_airc_data.version_name', 'gb_fp_comm_airc_data.seating_type'], 
				" gb_fp_comm_airc_data.version_name = '" + abGbFpDataS3EmpTransAir_ctrl.version_name + "'"
				+ " and gb_fp_comm_airc_data.version_type = '" + abGbFpDataS3EmpTransAir_ctrl.version_type + "'", 
				null, false, false , null, null, null, 'grid', 0, 
				"[{'fieldName': 'gb_fp_comm_airc_data.version_name', 'sortOrder': 1},{'fieldName': 'gb_fp_comm_airc_data.seating_type', 'sortOrder': 1}]");

}

/**
 * 'onchange' listener for 'gb_fp_s3_em_air.seating_type' and 'gb_fp_s3_em_air.distance_type' fields. 
 * 
 * @param {String} field
 *  @param {String} errMessage
 */
function validateField(field, errMessage){
    
	var fieldName = 'gb_fp_comm_airc_data.'+field;
	var fieldValue = abGbFpDataS3EmpTransAir_ctrl.abGbFpDataS3EmpTransAir_form.getFieldValue("gb_fp_s3_em_air." + field);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause(fieldName , fieldValue);
	restriction.addClause('gb_fp_comm_airc_data.version_name', abGbFpDataS3EmpTransAir_ctrl.version_name);
	restriction.addClause('gb_fp_comm_airc_data.version_type', abGbFpDataS3EmpTransAir_ctrl.version_type);
	
	parameters = {
        tableName: "gb_fp_comm_airc_data",
        fieldNames: toJSON([fieldName]),
        restriction: toJSON(restriction)
    };

	/* 
	 * 03/23/2011 KB 3030810
	 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
	 * TODO: after the core fixes the alteration of the value to validate, remove this code
	 */
	if(!validateValueWithApostrophes(fieldValue, errMessage))
		return false;
	
	try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.dataSet.records.length <= 0){
				View.showMessage(errMessage);
				return false;
			} 
	    } 
	    catch (e) {
	        Workflow.handleError(e);
			return false;
	    }
	return true;
}

/**
 * 'onclick' event listener for 'Methodology' row button.
 * 
 * @param {Object} row
 */
function onClickMethodology(row){
		try {
    
        var bl_id = row["gb_fp_s3_em_air.bl_id"];
        var calc_year = parseInt(row["gb_fp_s3_em_air.calc_year"]);
        var scenario_id = row["gb_fp_s3_em_air.scenario_id"];
        var source_id = parseInt(row["gb_fp_s3_em_air.source_id"]);
        
        var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3EmployeeAircraft",bl_id, calc_year, scenario_id, source_id);
        
        var dialogConfig = {
           closeButton: true
        };
        
        var methPanel = abGbFpDataS3EmpTransAir_ctrl.abGbFpDataS3EmpTransAir_methodology;
        
        methPanel.showInWindow(dialogConfig);
        var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_fp_s3_em_air.source_id', source_id);
		
		methPanel.refresh(restriction);
        
        //set virtual fields
		if(result.data['message']){
			showInformationInForm(methPanel,result.data['message']);
		}
		
		
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.emiss_fact', 'emiss_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.emiss_kgCO2', 'emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.CH4_emiss_fact', 'CH4_emiss_fact');
		setVirtualFieldValue(result.data, methPanel,'gb_fp_s3_em_air.CH4_gwp_fact', 'CH4_gwp_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.CH4_emiss_kgCO2', 'CH4_emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.N2O_emiss_fact', 'N2O_emiss_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.N2O_gwp_fact', 'N2O_gwp_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.N2O_emiss_kgCO2', 'N2O_emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.emiss_kgCO2_1000', 'emiss_kgCO2', true);
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.CH4_emiss_kgCO2_1000', 'CH4_emiss_kgCO2', true);
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_em_air.N2O_emiss_kgCO2_1000', 'N2O_emiss_kgCO2', true);
		
    } 
    catch (e) {
        Workflow.handleError(e);
    }
}


/**
 * @author Guo
 */
var abGbFpEsExpController = View.createController('abGbFpEsExpController', {

    afterInitialDataFetch: function(){
        this.abGbFpEsExpFacilitiesDS.addParameter("blUse", "ALL");
        this.abGbFpEsExpEnergyUseDS.addParameter("blUse", "ALL");
        this.abGbFpEsExpWaterUseDS.addParameter("blUse", "ALL");
        this.abGbFpEsExpOfficeSpaceDS.addParameter("blUse", "OFFICE|SALES OFFICE");
        this.abGbFpEsExpBankSpaceDS.addParameter("blUse", "BANK/FINANCIAL INSTITUTION");
        this.abGbFpEsExpCourthouseSpaceDS.addParameter("blUse", "COURTHOUSE");
        this.abGbFpEsExpDataCenterSpaceDS.addParameter("blUse", "DATA CENTER");
        this.abGbFpEsExpDormitorySpaceDS.addParameter("blUse", "RESIDENCE HALL/DORMITORY");
        this.abGbFpEsExpHospitalSpaceDS.addParameter("blUse", "HOSPITAL");
        this.abGbFpEsExpHotelSpaceDS.addParameter("blUse", "HOTEL");
        this.abGbFpEsExpMedicalOfficeSpaceDS.addParameter("blUse", "MEDICAL OFFICE");
        this.abGbFpEsExpMultifamilySpaceDS.addParameter("blUse", "MULTIFAMILY HOUSING");
        this.abGbFpEsExpOtherSpaceTypeDS.addParameter("blUse", "OTHER|UNKNOWN|HOSPICE|MANUFACTURING|MIXED USE|SPORT/RECREATION|STORAGE");
        this.abGbFpEsExpRefrigeratedWarehouseSpaceDS.addParameter("blUse", "WAREHOUSE (REFRIGERATED)");
        this.abGbFpEsExpRetailSpaceDS.addParameter("blUse", "RETAIL");
        this.abGbFpEsExpSchoolSpaceDS.addParameter("blUse", "K-12 SCHOOL");
        this.abGbFpEsExpSeniorCareSpaceDS.addParameter("blUse", "SENIOR CARE FACILITY");
        this.abGbFpEsExpSupermarketSpaceDS.addParameter("blUse", "SUPERMARKET/GROCERY STORE");
        this.abGbFpEsExpUnrefrigeratedWarehouseSpaceDS.addParameter("blUse", "WAREHOUSE");
        this.abGbFpEsExpWastewaterSpaceDS.addParameter("blUse", "WASTEWATER TREATMENT PLANT");
        this.abGbFpEsExpWorshipSpaceDS.addParameter("blUse", "HOUSE OF WORSHIP");
    },
    
    /**
     * export xls according the selected type
     * @param type {String} export type.
     */
    abGbFpEsExpGrid_onExportXls: function(type){
        var selectedRecords = this.abGbFpEsExpGrid.getSelectedRecords()
        if (selectedRecords.length > 0) {
            var dataSourcesDef = this.prepareDataSoursDef();
            var jobId = Workflow.startJob('AbRiskGreenBuilding-FootprintService-exportEnergyStarData', selectedRecords, dataSourcesDef);
            var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
            View.openDialog(url);
        }
        else {
            View.alert(getMessage('noRecordSelected'));
        }
    },
    
    /**
     * prepare data source def
     */
    prepareDataSoursDef: function(){
        var dataSoursDef = [];
        var dataSources = View.dataSources.items;
        for (var i = 0; i < dataSources.length; i++) {
            var item = new Object();
            item.id = dataSources[i].id;
            item.title = dataSources[i].title;
            item.fieldDefs = dataSources[i].fieldDefs.items;
            var blUse = dataSources[i].parameters['blUse'];
            if (valueExistsNotEmpty(blUse)) {
                item.blUse = blUse;
            }
            else {
                item.blUse = "";
            }
            dataSoursDef.push(item)
        }
        
        return dataSoursDef;
    }
});

/**
 * console field select value aciton for field gb_fp_setup.calc_year
 */
function selectYear(){
    var restriction = "1=1";
    if (valueExistsNotEmpty(getFieldRes('bl.site_id'))) {
        restriction += " and exists(select 1 from bl where gb_fp_setup.bl_id = bl.bl_id and " + getFieldRes('bl.site_id') + ")";
    }
    
    if (valueExistsNotEmpty(getFieldRes('gb_fp_setup.scenario_id'))) {
        restriction += " and " + getFieldRes('gb_fp_setup.scenario_id');
    }
    View.selectValue("abGbFpEsExpConsole", '', ["gb_fp_setup.calc_year"], "gb_fp_setup", ["gb_fp_setup.calc_year"], ["gb_fp_setup.calc_year"], restriction, null, null, null, null, null, null, 'multiple');
    
}


/**
 * console field select value aciton for field bl.site_id
 */
function selectSite(){
    var restriction = "site.site_id IN (select bl.site_id from bl where exists(select 1 from gb_fp_setup where gb_fp_setup.bl_id = bl.bl_id";
    if (valueExistsNotEmpty(getFieldRes('gb_fp_setup.calc_year'), true)) {
        restriction += " and " + getFieldRes('gb_fp_setup.calc_year', true);
    }
    
    if (valueExistsNotEmpty(getFieldRes('gb_fp_setup.scenario_id'))) {
        restriction += " and " + getFieldRes('gb_fp_setup.scenario_id');
    }
    
    restriction += "))";
	
    View.selectValue("abGbFpEsExpConsole", '', ["bl.site_id"], "site", ["site.site_id"], ["site.name", "site.site_id"], restriction, null, null, null, null, null, null, 'multiple');
    
}

/**
 * console field select value aciton for field gb_fp_setup.bl_id
 */
function selectBl(){
    var restriction = "bl.bl_id IN (select gb_fp_setup.bl_id from gb_fp_setup where gb_fp_setup.bl_id = bl.bl_id";
    if (valueExistsNotEmpty(getFieldRes('gb_fp_setup.calc_year', true))) {
        restriction += " and " + getFieldRes('gb_fp_setup.calc_year', true);
    }
    
    if (valueExistsNotEmpty(getFieldRes('gb_fp_setup.scenario_id'))) {
        restriction += " and " + getFieldRes('gb_fp_setup.scenario_id');
    }
    
    restriction += ")";
    
    if (valueExistsNotEmpty(getFieldRes('bl.site_id'))) {
        restriction += " and " + getFieldRes('bl.site_id');
    }
	
    View.selectValue("abGbFpEsExpConsole", '', ["gb_fp_setup.bl_id"], "bl", ["bl.bl_id"], ["bl.site_id", "bl.bl_id"], restriction, null, null, null, null, null, null, 'multiple');
}


/**
 * get field restriction
 */
function getFieldRes(fieldName, isNumber){
    var restriction = "";
    var console = View.panels.get('abGbFpEsExpConsole');
    var value = console.getFieldValue(fieldName);
    if (valueExistsNotEmpty(value)) {
        if (isMultiSelect(value)) {
            restriction = fieldName + " IN " + toSqlArray(value, isNumber);
        }
        else {
            if (isNumber) {
                restriction = fieldName + " = " + value;
            }
            else {
                restriction = fieldName + " = '" + value + "'";
            }
        }
    }
    
    return restriction;
}

/**
 * convert array to sql string
 */
function toSqlArray(string, isNumber){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var result = '';
    if (isNumber) {
        result = "(" + values[0];
    }
    else {
        result = "('" + values[0] + "'";
    }
    
    for (i = 1; i < values.length; i++) {
        if (isNumber) {
            result += " ," + values[i];
        }
        else {
            result += " ,'" + values[i] + "'";
        }
    }
    
    result += ")"
    
    return result;
}




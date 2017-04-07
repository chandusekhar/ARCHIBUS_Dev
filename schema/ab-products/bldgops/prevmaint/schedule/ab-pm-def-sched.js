/**
 *
 */
var defPMSchedController = View.createController('defPMSched', {

    /**
     * pmp_type : 'EQ' or 'HK'
     */
    pmpType: "EQ",
	
	/**
	*  opened from what view: 'assign', 'forecast' or 'define'
	*/
	openFrom:"define",
	// record passed from forecast report views
	pmsRecord: null,
	// restriction passed from Assign Procedure view
	resFromAsign:null,

    // loaded pm schedule records
    records: '',

    isPmsDetailsHidden: false,

    oldPmsValue: '',

    checkAll: false,

     //localized text for 'varies', added for kb#3038652 
	variesText:"",
     //'varies' value hold in client which is consistent with server side string value, added for kb#3038652 
	variesValue:"<varies>",
    //use for decide if that is a varies value.
	variesRegexp: /[>,<]/gi,
 
    afterInitialDataFetch: function(){
		//initial locailzed text of 'varies'	
		this.variesText = "<"+getMessage('varies')+ ">";

		//initial task priority field
        setTaskPriorityOptions();
        if(valueExistsNotEmpty(View.getOpenerView())){
        	this.pmsRecord = View.getOpenerView().PMSrecords;
            this.resFromAsign = View.getOpenerView().resFromAsign;
        }
        
        if ( this.resFromAsign != undefined ) {
			//for view 52 weeks	 forecast reports
			this.openFrom="assign";
			this.initialForAssignProcedure();
        } else  if (this.pmsRecord != undefined) {
			//for assign schedule
			this.openFrom="forecast";
			this.initialForForecastReport();
		} else {
			//for define schedule 
			this.initialForDefineSchedule();
        }
    },

	 initialForAssignProcedure: function() {
		this.pmpType = View.getOpenerView().pmpType;
		if ( 'EQ'==this.pmpType ) {
			this.eq_procedure_select.refresh(this.resFromAsign);
		} else {
			this.SelectEquipmentLocationProcedure.selectTab('rm_procedure');
			this.rm_procedure_select.show(true);
			this.rm_procedure_select.refresh(this.resFromAsign);
		}
		View.getLayoutManager('mainLayout').collapseRegion('west');
	 },

	 initialForForecastReport: function() {
		//kb:3024435
		//this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
		this.eq_procedure_select.selectAll = this.selectAll;
		this.rm_procedure_select.selectAll = this.selectAll;
		this.addSelectionHandler();
		
		this.showForecastPmShedules();

        this.dsAbPmDefSchedPms_filterConsole.show(false);
		var layout1 = View.getLayoutManager('nested_west');
		layout1.collapseRegion('north');
	 },

	initialForDefineSchedule:function (){
		this.SelectEquipmentLocationProcedure.addEventListener('beforeTabChange', this.beforeTabChange);
		//this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
		this.eq_procedure_select.selectAll = this.selectAll;
		this.rm_procedure_select.selectAll = this.selectAll;
		this.addSelectionHandler();

		document.getElementById("noschedule").checked = false;
		this.pms_info.enableButton('save', false);
		
		this.initialConsoleFields();
	},
	
    initialConsoleFields: function(){
		$("dsAbPmDefSchedPms_filterConsole_pms.bl_id").value = "";
		$("dsAbPmDefSchedPms_filterConsole_pms.fl_id").value = "";
		$("dsAbPmDefSchedPms_filterConsole_pms.rm_id").value = "";
		$("dsAbPmDefSchedPms_filterConsole_eq.eq_std").value = "";
		$("dsAbPmDefSchedPms_filterConsole_pms.pmp_id").value = "";	
	},

    addSelectionHandler: function(){
        this.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
        this.rm_procedure_select.addEventListener('onMultipleSelectionChange', rm_procedure_onClick);
    },
    
    removeSelectionHandler: function(){
        this.eq_procedure_select.addEventListener('onMultipleSelectionChange', null);
        this.rm_procedure_select.addEventListener('onMultipleSelectionChange', null);
    },
    
    //For solving the performance issue, override the reportGrid.selectAll() function.
    selectAll: function(selected){
		var ctrl =  defPMSchedController;
		if ( 'EQ'==ctrl.pmpType ) {
			ctrl.eq_procedure_select.addEventListener('onMultipleSelectionChange', null);
			ctrl.eq_procedure_select.setAllRowsSelected(selected);
			ctrl.eq_procedure_select.addEventListener('onMultipleSelectionChange', eq_procedure_onClick);
			eq_procedure_onClick();
		} else {
			ctrl.rm_procedure_select.addEventListener('onMultipleSelectionChange', null);
			ctrl.rm_procedure_select.setAllRowsSelected(selected);
			ctrl.rm_procedure_select.addEventListener('onMultipleSelectionChange', rm_procedure_onClick);
			rm_procedure_onClick();
		}
    },
    
    //the function is for get pms that the dialog will display
    showForecastPmShedules: function(){
        var pmsRestr = createObjectFromPmsRecord(this.pmsRecord);
        //kb:3024805
		var result = {};
        try {
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-getMultiPMSRecords', pmsRestr);
			if (result.code == "executed") {
				var pmsIds = eval('(' + result.jsonExpression + ')');
				var restrictionTab = new Ab.view.Restriction();
				if (pmsIds.length > 0) {
					var pmsIdArray = new Array();
					for (var r = 0; r < pmsIds.length; r++) {
						pmsIdArray[r] = pmsIds[r];
					}
					restrictionTab.addClause('pms.pms_id', pmsIdArray, 'IN');
					//$('eq_procedure_select_checkAll').checked = true;
					//$('rm_procedure_select_checkAll').checked = true;
				}
				else {//kb:3024526
					restrictionTab.addClause('pms.pms_id', -1, '=');
				}
				this.eq_procedure_select.refresh(restrictionTab);
				this.eq_procedure_select.selectAll(true);
				$('eq_procedure_select_checkAll').checked = true;
				this.rm_procedure_select.refresh(restrictionTab);
			}
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    /**
     * Update the style of the rows in equipment or location grid panel after
     * the two grid panel refresh
     *
     * @param {boolean} isEq
     * @param {String} gridPanelID
     */
    eq_procedure_select_afterRefresh: function(){
		this.afterRefreshProcedureGrid('eq_procedure_select'); 
		//after refresh select grid, determine to enable the 'Copy' action or not
		enableCopyButton(View.panels.get("eq_procedure_select"));
    },

    rm_procedure_select_afterRefresh: function(){
		this.afterRefreshProcedureGrid('rm_procedure_select'); 
		enableCopyButton(View.panels.get("rm_procedure_select"));
    },

	/**
     * Update the style of the rows in equipment or location grid panel after
     * the two grid panel refresh
     *
     * @param {boolean} isEq
     * @param {String} gridPanelID
     */
    afterRefreshProcedureGrid: function( gridId ){
        this.updateStyle(gridId);
        
        //add a listener for all check button
		if ( this.openFrom == 'assign' ) {
			var checkAllEl = Ext.get( gridId+'_checkAll');
			var panel = View.panels.get(gridId);
			if ( valueExists(checkAllEl) ) {
				this.selectAll(true);
			}
			//kb:3024435
			this.setAllRowsDisabledSelected(panel);
		} 
    },
    
    updateStyle: function(gridId){
        //  var gridPanelID = isEq ? "eq_procedure_select" : "rm_procedure_select";
		var grid = View.panels.get(gridId);
		for (var i = 0; i < grid.rows.length; i++){ 
			this.updateOneRowStyle(grid.rows[i]);
			for (var j = 0; j < this.records.length; j++) 
				if (grid.rows[i]['pms.pms_id'] == this.records[j]['pms.pms_id']) 
					grid.rows[i].row.dom.firstChild.firstChild.checked = true;
		}
    },
    
    //kb :3024161
    updateOneRowStyle: function(row){
        var rowEl = Ext.get(row.row.dom);
		if (row['pms.interval_1'] != 0 || row['pms.interval_2'] != 0 || row['pms.interval_3'] != 0 || row['pms.interval_4'] != 0) {
			rowEl.setStyle('font-weight', 'bold');
		}
        else {
            rowEl.setStyle('font-weight', 'normal');
        }
    },

    //disable the checked
    setAllRowsDisabledSelected: function(panel){
        // get switch value, default == true
        var dataRows = panel.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var str = panel.id+"_row" + r + "_multipleSelectionColumn";
            document.getElementById(str).disabled = true;
        }
        document.getElementById(panel.id+'_checkAll').disabled = true;
    },

    pms_info_onSave: function(){
		//Save multi-loading pms records file='PreventiveMaintenanceCommonHandler.java'
		try {
			//get the syncronized record
			var pmsValue = getMultiplePmsValue();
			var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-saveMultiPMSRecords', pmsValue,this.records);
			if (result.code == 'executed') {
				this.afterSavePmSchedule();
				this.oldPmsValue = pmsValue;
			}
			else {
				Workflow.handleError(result);
			}
		 } catch (e) {
			Workflow.handleError(e);
		 }
    },

	afterSavePmSchedule: function(){
        //show text message in the form				
		var message = getMessage('formSaved');
        this.pms_info.displayTemporaryMessage(message);

		//after the details be saved ,refresh the tag  in below three status , from assign  ,from view 52 weeks,define pm schedule
        //1
        //for view 52 weeks
        if (this.openFrom == 'assign') {
            //this.isAlertSaved = true;
            //this.eq_procedure_select.refresh(resFromAsign);
        }//2
        else if (this.openFrom == 'forecast') {
			//when afterSave ='true';updateStyle()could excuted the checked old records again ,or didn't excute it.
			//this.showPassedIntoPmsRecord(this.pmsRecord);
		}//3
		else {
			this.onFiter();
		}
        //records = '';
	},

	/*
	* 	Copy current loaded record in PM schedule forms as a new pms recrod, then save it and load it in form. Refresh select grid and set new row as selected.
	*/
    pms_info_onCopy: function(){
		//Add new pms record
		this.pms_info.refresh(null, true);

		var selectGrid;
		//	For equipment, copy pmp_id and eq_id from previous loaded pms record to new one
		if(this.pmpType=='EQ'){
			this.	pms_info.setFieldValue("pms.pmp_id", this.pms_eq_basic.getFieldValue("pms.pmp_id") );	
			this.	pms_info.setFieldValue("pms.eq_id",this.pms_eq_basic.getFieldValue("pms.eq_id") );	
			this.	pms_info.save();
			selectGrid = this.eq_procedure_select;
		}  
		//	For housekeeping, copy site_id, bl_id.fl_id, rm_id and pmp_id from previous loaded pms record to new one
		else {
			this.	pms_info.setFieldValue("pms.pmp_id", this.pms_rm_basic.getFieldValue("pms.pmp_id") );	
			this.	pms_info.setFieldValue("pms.site_id",this.pms_rm_basic.getFieldValue("pms.site_id") );	
			this.	pms_info.setFieldValue("pms.bl_id",this.pms_rm_basic.getFieldValue("pms.bl_id") );	
			this.	pms_info.setFieldValue("pms.fl_id",this.pms_rm_basic.getFieldValue("pms.fl_id") );	
			this.	pms_info.setFieldValue("pms.rm_id",this.pms_rm_basic.getFieldValue("pms.rm_id") );	
			this.	pms_info.save();
			selectGrid = this.rm_procedure_select;
		}
		//	Refresh select grid to show new row
		selectGrid.refresh();
		//	Get pms_id from new pms record
	   var newPmsId = this.pms_info.getFieldValue("pms.pms_id");
	   var newRowIndex=-1;
	   //loop through grid rows  to get index of  new row and unselect other rows
        selectGrid.gridRows.each(function(row) {
            var pmsId = row.getRecord().getValue('pms.pms_id');
			if(newPmsId == pmsId){
				newRowIndex = row.record.index;
				//row.dom.firstChild.firstChild.checked = true;
			}
			else {
				row.dom.firstChild.firstChild.checked = false;
			}
        });
	    // set new row selected in grid by calling proper API, thus active proper event and its handler function
		if( newRowIndex >=0 ){
			selectGrid.selectRowChecked(newRowIndex, true);
		}
	},
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
    
        if ( 'define' == defPMSchedController.openFrom ) {
            if (newTabName == "eq_procedure") {
				defPMSchedController.pmpType='EQ';
				View.panels.get('eq_procedure_select').refresh();
            } else if (newTabName == "rm_procedure") {
				defPMSchedController.pmpType='HK';
				View.panels.get('rm_procedure_select').refresh();
            }
        }
		if ('assign'!=defPMSchedController.openFrom){
			defPMSchedController.hideAllPmsForms();
			defPMSchedController.isPmsDetailsHidden = true;
		}
    },

    hideAllPmsForms: function(){
        View.panels.get('pms_info').show(false);
        View.panels.get('pms_eq_basic').show(false);
        View.panels.get('pms_rm_basic').show(false);
        View.panels.get('pms_schedule').show(false);
        View.panels.get('pms_other').show(false);
	},

 /*   addRestrictionForEqProcedureSelect: function(restriction){
    
        restriction.addClause('pms.interval_1', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_2', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_3', 0, '&gt;', 'AND');
        restriction.addClause('pms.interval_4', 0, '&gt;', 'AND');
        
        this.eq_procedure_select.refresh(restriction);
    },
    */

    // ----------------------- private function -----------------------------------------------------
	
    /**
     * syncronize records of multi panels while in same DataSource to one record.
     * @param {ab.data.record} kbItem
     */
    syncPanelPmsRecord: function(){
        var item = this.pms_info.getRecord();
        
        View.panels.each(function(panel){
            if ((panel.getRecord) && (panel.visible)) {
                panel.getRecord();
                panel.fields.each(function(field){
                    item.setValue(field.getFullName(), field.getStoredValue());
                });
            }
        });
        return item;
    },
    
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    },

    dsAbPmDefSchedPms_filterConsole_onFilter: function(){
        this.onFiter();
    },

    //kb:3024292
    onFiter: function(){
        var rmRestriction = this.getRestriction();
		this.addLocationRestriction(rmRestriction, 'pms');
        View.panels.get('rm_procedure_select').refresh(rmRestriction);
        
        //3024292  . For equipment, the restriction should be combination of equal to eq_std and pmp_id; for Location, the restriction should be combination of equal to bl_id, fl_id, rm _id and pmp_id.
        var eqRestriction = this.getRestriction();
		this.addLocationRestriction(eqRestriction, 'eq');
        var pmsEqstd = this.dsAbPmDefSchedPms_filterConsole.getFieldValue("eq.eq_std");        
        if (pmsEqstd != '') {
            eqRestriction.addClause('eq.eq_std', pmsEqstd, '=');
        }
        View.panels.get('eq_procedure_select').refresh(eqRestriction);

        if (this.checkAll) {
            $('eq_procedure_select_checkAll').checked = true;
            $('rm_procedure_select_checkAll').checked = true;
        }
    },

    getRestriction: function(){
        //var intervalFreq = (this.ds_ab-pm-def-sched_pms_console.getRecord()).getValue("pms.interval_freq");
        var restriction = new Ab.view.Restriction();

		if (document.getElementById("noschedule").checked) {
            restriction.addClause('pms.interval_1', 0, '=');
            restriction.addClause('pms.interval_2', 0, '=');
            restriction.addClause('pms.interval_3', 0, '=');
            restriction.addClause('pms.interval_4', 0, '=');
        }
        
		var console =  this.dsAbPmDefSchedPms_filterConsole;
        var pmsPmpId = console.getFieldValue("pms.pmp_id");
        if (pmsPmpId != '') {
            restriction.addClause('pms.pmp_id', pmsPmpId, '=');
        }
        
        return restriction;
    },

    addLocationRestriction: function(restriction, tableName){
		var console = this.dsAbPmDefSchedPms_filterConsole;
        var pmsBlId = console.getFieldValue("pms.bl_id");
        var pmsFlId = console.getFieldValue("pms.fl_id");
        var pmsRmId = console.getFieldValue("pms.rm_id");
        if (pmsBlId != '') {
            restriction.addClause(tableName+'.bl_id', pmsBlId, '=');
        }
        if (pmsFlId != '') {
            restriction.addClause(tableName+'.fl_id', pmsFlId, '=');
        }
        if (pmsRmId != '') {
            restriction.addClause(tableName+'.rm_id', pmsRmId, '=');
        }
	},

    //clear the filter
    dsAbPmDefSchedPms_filterConsole_onClear: function(){
		this.initialConsoleFields();
        document.getElementById("noschedule").checked = false;
    }
});

//when on pms was choose ,action name is 'save',else 'save all records'
function resetTitle(records){

    var title = getMessage('title');
    var titleSaveAll = getMessage('titleSaveAll');
    
    var grid = View.panels.get('pms_info');
    var action = grid.actions.get('save');
    
    if (records.length == 1 || records == '') {
        action.setTitle(title);
    }
    else {
        action.setTitle(titleSaveAll);
    }
}

function isFormChanged(newPmsValue, oldPmsValue){
    var isChanged = false;
    if (!View.controllers.items[0]['isPmsDetailsHidden']) {
        if (oldPmsValue != '') {
            if (oldPmsValue["pms.dv_id"] != newPmsValue["pms.dv_id"] || oldPmsValue["pms.dp_id"] != newPmsValue["pms.dp_id"] || oldPmsValue["pms.pm_group"] != newPmsValue["pms.pm_group"] || oldPmsValue["pms.date_first_todo"] != newPmsValue["pms.date_first_todo"] ||
            oldPmsValue["pms.date_next_alt_todo"] != newPmsValue["pms.date_next_alt_todo"] ||
            oldPmsValue["pms.hours_est"] != newPmsValue["pms.hours_est"] ||
            oldPmsValue["pms.interval_type"] != newPmsValue["pms.interval_type"] ||
            oldPmsValue["pms.fixed"] != newPmsValue["pms.fixed"] ||
            oldPmsValue["pms.interval_freq"] != newPmsValue["pms.interval_freq"] ||
            oldPmsValue["pms.interval_1"] != newPmsValue["pms.interval_1"] ||
            oldPmsValue["pms.interval_2"] != newPmsValue["pms.interval_2"] ||
            oldPmsValue["pms.interval_3"] != newPmsValue["pms.interval_3"] ||
            oldPmsValue["pms.interval_4"] != newPmsValue["pms.interval_4"] ||
            oldPmsValue["pms.total_unit"] != newPmsValue["pms.total_unit"] ||
            oldPmsValue["pms.units"] != newPmsValue["pms.units"] ||
            oldPmsValue["pms.comments"] != newPmsValue["pms.comments"] ||
            oldPmsValue["pms.priority"] != newPmsValue["pms.priority"]) {
                isChanged = true;
            }
        }
    }
    return isChanged;
}

function selectRowByRecords(grid){
    for (var i = 0; i < grid.rows.length; i++) 
        if ( 'assign'!=View.controllers.items[0]['openFrom'] ) 
                for (var j = 0; j < View.controllers.items[0]['records'].length; j++) 
                    if (grid.rows[i]['pms.pms_id'] == View.controllers.items[0]['records'][j]['pms.pms_id']) 
                        grid.rows[i].row.dom.firstChild.firstChild.checked = true;
}

function selectAllRows(grid, YesOrNo){
    for (var i = 0; i < grid.rows.length; i++) {
        grid.rows[i].row.dom.firstChild.firstChild.checked = YesOrNo;
    }
}

function eq_procedure_onClick(pmsRecord, resFromAsign){
	this.onClickProcedureRow("eq_procedure_select");
}

function rm_procedure_onClick(){
	this.onClickProcedureRow("rm_procedure_select");
}

function onClickProcedureRow(panelId){
	if ( !confirmDoingCheckRows(panelId) )
		return;

   // doing check row(s)
	doingCheckRows(panelId);

	resetVariableAfterCheckRows(panelId);

	//after selection change in  select grid, determine to enable the 'Copy' action or not
	enableCopyButton(View.panels.get(panelId));
}

function confirmDoingCheckRows(gridId){
    //kb:3024401
	var confirmed = true;
    var newPmsValue = getMultiplePmsValue();
    var oldPmsValue = View.controllers.items[0]['oldPmsValue'];
    //if (pmsRecord == undefined || resFromAsign == undefined || pmsRecord != undefined || (resFromAsign != undefined && View.controllers.items[0]['isAlertSaved'] == false)) {
    if ( newPmsValue != undefined  &&  oldPmsValue != undefined && isFormChanged(newPmsValue, oldPmsValue) ) {
		var recordsChange = getMessage('recordsChange');
		confirmed = window.confirm(recordsChange);
		if ( !confirmed ) {
			//kb:3024400
			var grid = View.panels.get(panelId);
			if (View.controllers.items[0]['checkAll']) {
				$(gridId+'_checkAll').checked = true;
				selectAllRows(grid, true);
			}
			else {
				$(gridId+'_checkAll').checked = false;
				selectAllRows(grid, false);
				//grid.setAllRowsSelected(false);
				selectRowByRecords(grid);
			}
		}
	}
	return confirmed;
}

function doingCheckRows(panelId){
    var panel = View.panels.get(panelId);
    View.controllers.items[0]['records'] = getPrimaryKeysForSelectedRows(panel);
    var rows = panel.getSelectedRows();
    //kb:3024411
    if (View.controllers.items[0]['records'].length == 0) {
		onCheckNoneRow();
	} 
	else if (View.controllers.items[0]['records'].length == 1) {
		onCheckSingleRow(rows);
    }
    else {
		onCheckMutlipleRows(rows);
    }
}

function onCheckNoneRow(){
    if (View.controllers.items[0]['records'].length == 0) {
		defPMSchedController.hideAllPmsForms();
        View.controllers.items[0]['isPmsDetailsHidden'] = true;
        if (View.controllers.items[0]['openFrom'] == 'forecast') {
            $("instructions").innerHTML = "";
        }
        return;        
    }
}

function onCheckSingleRow( rows ){
        //get the old record for the compare ,wether the value is changed
        updateIntervalTypeOptions();

        var restriction = new Ab.view.Restriction();
        var pmsId = rows[0]['pms.pms_id'];
        restriction.addClause("pms.pms_id", pmsId, "=", true);
        refreshPmsPanelForSingleRecord(restriction);

		initialFieldsAfterRefreshPmsPanelForSingleRecord();        
}

function initialFieldsAfterRefreshPmsPanelForSingleRecord( ){
	var pmsEqBasic = View.panels.get('pms_eq_basic');
	var pmsRmBasic = View.panels.get('pms_rm_basic');
	var pmsSchedule = View.panels.get('pms_schedule')
	var pmsOther = View.panels.get('pms_other');

    var openerController = View.controllers.get("defPMSched");
	var isEq = ("EQ" == openerController.pmpType) ? true : false;
	if ( isEq ) {
		pmsEqBasic.showField('pms.pms_id', true);
		pmsEqBasic.showField('pms.eq_id', true);
	} else {
		pmsRmBasic.showField('pms.site_id', true);
		pmsRmBasic.showField('pms.bl_id', true);
		pmsRmBasic.showField('pms.fl_id', true);
		pmsRmBasic.showField('pms.rm_id', true);
	}
	
	pmsSchedule.showField('pms.date_last_completed', true);
	pmsSchedule.showField('pms.date_next_todo', true);
	pmsSchedule.showField('pms.hours_calc', true);
	pmsOther.showField('pms.meter_last_pm', true);
	pmsOther.showField('pms.nactive', true);
	View.controllers.items[0]['isPmsDetailsHidden'] = false;
}

function onCheckMutlipleRows( rows ){
        //if the form be changed ,pop-up the warning
        updateIntervalTypeOptions();
       var records= View.controllers.items[0]['records']
	   var result = {};
	   //This workflow is for compare the field value ,if it show the same value that each field of
      // all records ,return the value ,or show string 'varies' Text file='PreventiveMaintenanceCommonHandler.java'
   		 try{
        		result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-loadMultiPMSRecords', records);
			}catch(e){
				Workflow.handleError(e);
			}
        
        if (result.code == 'executed') {
            var pmsValue = eval('(' + result.jsonExpression + ')');
            //set the value when load the pmstable'panel
            setMultiplePmsValue(pmsValue, rows[0]['pms.pms_id']);
            //hiddenOnlyField('pms_schedule', 'pms.date_last_completed');
        }
        else {
            Workflow.handleError(result);
        }
        View.controllers.items[0]['isPmsDetailsHidden'] = false;
}

function resetVariableAfterCheckRows(panelId){
	// reset value of variable 'checkAll'
    if ( $(panelId+'_checkAll').checked ) {
        View.controllers.items[0]['checkAll'] = true;
    }
    else {
        View.controllers.items[0]['checkAll'] = false;
    }
	
	// reset value of variable 'variable'
    View.controllers.items[0]['oldPmsValue'] = getMultiplePmsValue();

    //kb:3024583
    if (View.controllers.items[0]['openFrom'] == 'forecast') {
        $("instructions").innerHTML = getMessage("instructions1") + "<br>" + getMessage("instructions2") + "<br>&nbsp;" + getMessage("instructions21") + "<br>" + getMessage("instructions3") + "<br>&nbsp;" + getMessage("instructions31");
    }

    resetTitle(View.controllers.items[0]['records']);
}

/*function hiddenOnlyField(panel, fieldName){
    View.panels.get('pms_schedule').fields.get('pms.interval_4').fieldDef.required = true;
} */

function getPrimaryKeysForSelectedRows(grid){

    var selectedRows = new Array();
    
    var dataRows = grid.getDataRows();
    for (var r = 0; r < dataRows.length; r++) {
        var dataRow = dataRows[r];
        
        var selectionCheckbox = dataRow.firstChild.firstChild;
        if (selectionCheckbox.checked) {
            var rowKeys = grid.getPrimaryKeysForRow(grid.rows[r]);
            selectedRows.push(rowKeys);
        }
    }
    return selectedRows;
}

/*function rm_procedure_onClick(){

    resetTitle('');
    //1 get pms_id 
    var grid = View.panels.get('rm_procedure_select');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var pmsID = selectedRow["pms.pms_id"];
    
    updateIntervalTypeOptions(true);
    //2 refresh the form panels
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.pms_id", pmsID, "=", true);
    refreshPmsPanel(restriction, "HK");
    if (View.controllers.items[0]['openFrom'] == 'forecast') {
        $("instructions").innerHTML = getMessage("instructions1") + "<br>" + getMessage("instructions2") + "<br>&nbsp;&nbsp;" + getMessage("instructions21") + "<br>" + getMessage("instructions3") + "<br>&nbsp;&nbsp;" + getMessage("instructions31");
    }
}
*/

//update the intervalTypefield of pms 
function updateIntervalTypeOptions(){
    var intervalType = View.panels.get("pms_schedule").getFieldElement("pms.interval_type");
    var options = intervalType.options;
    if ( 'HK'==View.controllers.get("defPMSched").pmpType ) {
        if (getIndexofValue("i", options) != -1) {
            intervalType.remove(getIndexofValue("i", options));
            intervalType.remove(getIndexofValue("h", options));
            intervalType.remove(getIndexofValue("e", options));
        }
    }
    else {
        if (getIndexofValue("i", options) == -1) {
            if (getIndexofValue("a", options) != -1) {
                intervalType.remove(getIndexofValue("a", options));
            }
            var option = new Option(getMessage("miles"), "i");
            intervalType.options.add(option);
            option = new Option(getMessage("hours"), "h");
            intervalType.options.add(option);
            option = new Option(getMessage("meter"), "e");
            intervalType.options.add(option);
            option = new Option(getMessage("manual"), "a");
            intervalType.options.add(option);
        }
    }
}

function getIndexofValue(value, options){
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == value) {
            return i;
        }
    }
    return -1;
}

function refreshPmsPanelForSingleRecord(restriction){
    if (!restriction) {
        return;
    }
    
    var pmsInfoPanel = View.panels.get('pms_info');
    pmsInfoPanel.refresh(restriction);
    var record = pmsInfoPanel.getRecord();

    var pmsEqBasicPanel = View.panels.get('pms_eq_basic');
    pmsEqBasicPanel.setRecord(record);
    var pmsRmBasicPanel = View.panels.get('pms_rm_basic');
    pmsRmBasicPanel.setRecord(record);
    var pmsSchedulePanel = View.panels.get('pms_schedule');
    pmsSchedulePanel.setRecord(record);
    var pmsOtherPanel = View.panels.get('pms_other');
    pmsOtherPanel.setRecord(record);
    
    $("taskPriority").value = record.values["pms.priority"];

    var openerController = View.controllers.get("defPMSched");
	var isEq = ("EQ" == openerController.pmpType) ? true : false;
    pmsEqBasicPanel.show(isEq);
    pmsRmBasicPanel.show(!isEq);
    pmsSchedulePanel.show(true);
    pmsOtherPanel.show(true);
    
    openerController.showInformationInForm(openerController, pmsInfoPanel, "");
}

function setMultiplePmsValue(pmsValue, pmsId){
	beforeSetMultiplePmsValue();
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.pms_id", pmsId, "=", true);
    refreshPmsPanelForSingleRecord(restriction);

   setPmsFieldValues(pmsValue);
}

function beforeSetMultiplePmsValue() {
    //kb:3024381   ,it was caused by new build change the showfield method
	var pmpType = 	  View.controllers.get("defPMSched").pmpType;
	if ( 'EQ' == pmpType )	{
		var pmsEqBasic = View.panels.get('pms_eq_basic');
		pmsEqBasic.showField('pms.pms_id', false);
		pmsEqBasic.showField('pms.eq_id', false);
	} else {
		var pmsRmBasic = View.panels.get('pms_rm_basic');
		pmsRmBasic.showField('pms.pms_id', false);
		pmsRmBasic.showField('pms.site_id', false);
		pmsRmBasic.showField('pms.bl_id', false);
		pmsRmBasic.showField('pms.fl_id', false);
		pmsRmBasic.showField('pms.rm_id', false);
	}

    var pmsSchedule = View.panels.get('pms_schedule')
    pmsSchedule.showField('pms.date_last_completed', false);
    pmsSchedule.showField('pms.date_next_todo', false);
    pmsSchedule.showField('pms.hours_calc', false);
    
    var pmsOther = View.panels.get('pms_other')
	pmsOther.showField('pms.meter_last_pm', false);
    pmsOther.showField('pms.nactive', false);

    //when isPmsDetailsHidden =false ,say the detail hidden ,so didn't compare the new and old value
    View.controllers.items[0]['isPmsDetailsHidden'] = false;

	 //initial set interval type list
	updateIntervalTypeOptions();
}

function setPmsFieldValues(pmsValue) {
	var variesValue = 	  View.controllers.get("defPMSched").variesValue;
	var variesText = 	  View.controllers.get("defPMSched").variesText; 

	if ( 'EQ' == this.pmpType )	{
		setSimpleFieldValue("pms_eq_basic_pms.dv_id", pmsValue.dv_id, variesValue, variesText);
		setSimpleFieldValue("pms_eq_basic_pms.dp_id", pmsValue.dp_id, variesValue, variesText);
		setSimpleFieldValue("pms_eq_basic_pms.pm_group", pmsValue.pm_group, variesValue, variesText);
	} else {
		setSimpleFieldValue("pms_rm_basic_pms.dv_id", pmsValue.dv_id, variesValue, variesText);
		setSimpleFieldValue("pms_rm_basic_pms.dp_id", pmsValue.dp_id, variesValue, variesText);
		setSimpleFieldValue("pms_rm_basic_pms.pm_group", pmsValue.pm_group, variesValue, variesText);
	}

	setDateFieldValue("pms_schedule_pms.date_first_todo", pmsValue.date_first_todo, variesValue, variesText);
	setDateFieldValue("pms_schedule_pms.date_next_alt_todo", pmsValue.date_next_alt_todo, variesValue, variesText);

	setOptionFieldValue("pms_schedule_pms.fixed", pmsValue.fixed, variesValue, variesText);
	setOptionFieldValue("pms_schedule_pms.interval_type", pmsValue.interval_type, variesValue, variesText);
	setOptionFieldValue("taskPriority", pmsValue.priority, variesValue, variesText);
	setOptionFieldValue("pms_schedule_pms.interval_freq", pmsValue.interval_freq, variesValue, variesText);

	setSimpleFieldValue("pms_schedule_pms.hours_est", pmsValue.hours_est, variesValue, variesText);
	setSimpleFieldValue("pms_schedule_pms.interval_1", pmsValue.interval_1, variesValue, variesText);
	setSimpleFieldValue("pms_schedule_pms.interval_2", pmsValue.interval_2, variesValue, variesText);
	setSimpleFieldValue("pms_schedule_pms.interval_3", pmsValue.interval_3, variesValue, variesText);
	setSimpleFieldValue("pms_schedule_pms.interval_4", pmsValue.interval_4, variesValue, variesText);

	setSimpleFieldValue("pms_other_pms.total_unit", pmsValue.total_unit, variesValue, variesText);
	setSimpleFieldValue("pms_other_pms.units", pmsValue.units, variesValue, variesText);
	setSimpleFieldValue("pms_other_pms.comments", pmsValue.comments, variesValue, variesText);
}

function setSimpleFieldValue(fieldElementId, actualValue, variesValue, variesText){
    if (actualValue == variesValue) {
        $(fieldElementId).value = variesText;
    }
    else {
        $(fieldElementId).value = actualValue;
    }
}

function setDateFieldValue(fieldElementId, actualValue, variesValue, variesText){
	var tempValue = actualValue;
    if ( actualValue != variesValue && actualValue != '' ) {
        var actualValueArr = actualValue.split('-');
        var day = parseInt(actualValueArr[2], 10);
        var month = parseInt(actualValueArr[1], 10);
        var year = parseInt(actualValueArr[0], 10);
        
        //kb:3037348,by comments about date format problem.
        tempValue =returnFromIsoDate(day,month,year);
        tempValue.trim();
    }
	setSimpleFieldValue(fieldElementId, tempValue,variesValue,variesText );
}

function setOptionFieldValue(fieldElementId, actualValue, variesValue, variesText){
    if ( actualValue == variesValue ) {
        var selectElement = document.getElementById(fieldElementId);
        if ( !isExistsVaries(selectElement) ) {
            var option = new Option(variesText, variesValue);
            selectElement.options.add(option);
            selectElement.value = variesValue;
        }
        selectElement.value = variesValue;
    }
}

/**
 * Reback date format from iso date by arrDateShortPattern;
 * @param day
 * @param month
 * @param year
 * @returns {String}
 */
function returnFromIsoDate(day,month,year){
	var date="";
	for(var i=0;i<3;i++){
		var temp = arrDateShortPattern[i];
		if(temp!=null){
			if(i!=0){
				if(temp.indexOf("Y")>=0){
					date=date+"/"+year ;}
				else if(temp.indexOf("M")>=0){
					date=date+"/"+month ;}
				else if(temp.indexOf("D")>=0){
					date=date+"/"+day ;}
			}
			else{
				if(temp.indexOf("Y")>=0){
					date=year ;}
				else if(temp.indexOf("M")>=0){
					date=month ;}
				else if(temp.indexOf("D")>=0){
					date=day ;}
			}
		}
	}
	return date;
}


//use for the selectlist ,if it return true  ,proveing the selectlist has '<varies>' option
function isExistsVaries(selectElement){
    if (selectElement.length > 0) {
        if (selectElement.options[selectElement.length - 1].value ==View.controllers.get("defPMSched").variesValue) {
            return true;
        }
    }
}

//get the pmsvalue when save the selected pms records
function getMultiplePmsValue(){

    var pmsBasic = null;
	if ("EQ"==defPMSchedController.pmpType) {
		var pmsBasic = View.panels.get("pms_eq_basic");
	}
	 else {
		var pmsBasic = View.panels.get("pms_rm_basic");
	 }
    var dv_id = pmsBasic.getFieldValue("pms.dv_id");
    var dp_id = pmsBasic.getFieldValue("pms.dp_id");
    var pm_group = pmsBasic.getFieldValue("pms.pm_group");
    
    var pmsschedule = View.panels.get("pms_schedule");
    var date_last_completed = pmsschedule.getFieldValue("pms.date_last_completed");
    var date_next_todo = pmsschedule.getFieldValue("pms.date_next_todo");
    
    var date_first_todo = $("pms_schedule_pms.date_first_todo").value;
    var datefirsttodo_regexp = date_first_todo.match(defPMSchedController.variesRegexp); 
    if (datefirsttodo_regexp==null) {
        date_first_todo = getDateWithISOFormat(date_first_todo);
    }
    
    var date_next_alt_todo = $("pms_schedule_pms.date_next_alt_todo").value;  
    var date_next_alt_todo_regexp = date_next_alt_todo.match(defPMSchedController.variesRegexp); 
    if (date_next_alt_todo_regexp ==null) {
        date_next_alt_todo = getDateWithISOFormat(date_next_alt_todo);
    }
    
    var hours_calc = pmsschedule.getFieldValue("pms.hours_calc");
    var hours_est = pmsschedule.getFieldValue("pms.hours_est");
    var interval_type = pmsschedule.getFieldValue("pms.interval_type");
    var fixed = pmsschedule.getFieldValue("pms.fixed");
    var interval_freq = pmsschedule.getFieldValue("pms.interval_freq"); 
    var interval_1 = pmsschedule.getFieldValue("pms.interval_1");
    var interval_2 = pmsschedule.getFieldValue("pms.interval_2");
    var interval_3 = pmsschedule.getFieldValue("pms.interval_3");
    var interval_4 = pmsschedule.getFieldValue("pms.interval_4");
    
    var pmsother = View.panels.get("pms_other");
    var nactive = pmsother.getFieldValue("pms.nactive");
    var total_unit = pmsother.getFieldValue("pms.total_unit");
    var units = pmsother.getFieldValue("pms.units");
    var comments = pmsother.getFieldValue("pms.comments");
    var priority = $("taskPriority").value;
    
    var fieldAndValueArray=[
	                            ['dv_id',dv_id],
	                            ['dp_id',dp_id],
	                            ['pm_group',pm_group],
	                            ['date_first_todo',date_first_todo],
	                            ['date_next_alt_todo',date_next_alt_todo],
	                            ['hours_est',hours_est],
	                            ['interval_type',interval_type],
	                            ['fixed',fixed],
	                            ['interval_freq',interval_freq],
	                            ['interval_1',interval_1],
	                            ['interval_2',interval_2],
	                            ['interval_3',interval_3],
	                            ['interval_4',interval_4],
	                            ['units',units],
	                            ['comments',comments],
	                            ['priority',priority]
                            ];
    
    return setFieldValueForGivenField(fieldAndValueArray);
}

/**
 * Convert paramter when field value from form is varies.
 * @param fieldAndValueArray
 * @returns {Object}
 */
function setFieldValueForGivenField(fieldAndValueArray){
	var pmsValue = new Object();
	for(var i=0;i<fieldAndValueArray.length;i++){
		
		var field=fieldAndValueArray[i][0];
		var value=fieldAndValueArray[i][1];
		
		if (value.match(defPMSchedController.variesRegexp) !=null) {
	   	 	pmsValue["pms."+field] = View.controllers.get("defPMSched").variesValue;
	    }else{
	    	pmsValue["pms."+field] = value;
	    }
	}
	return pmsValue;
}

function createObjectFromPmsRecord(pmsRecord){
    var pmsRestr = new Object();

    pmsRestr["pmpstr.tr_id"] = pmsRecord['pmpstr.tr_id'];
    pmsRestr["pmressum.date_todo.to"] = pmsRecord['pmressum.date_todo.to'];
    pmsRestr["pmressum.date_todo.from"] = pmsRecord['pmressum.date_todo.from'];  
    pmsRestr["pmsd.date_todo"] = pmsRecord['pmsd.date_todo'];
    pmsRestr["weekormonth"] = pmsRecord['weekormonth'];

    if (pmsRecord['pms.pm_group'] != "") {
        pmsRestr["pms.pm_group"] = pmsRecord['pms.pm_group'];
    }
    if (pmsRecord['pms.bl_id'] != "") {
        pmsRestr["pms.bl_id"] = pmsRecord['pms.bl_id'];
    }
    if (pmsRecord['pms.fl_id'] != "") {
        pmsRestr["pms.fl_id"] = pmsRecord['pms.fl_id'];
    }
    if (pmsRecord['pms.site_id'] != "") {
        pmsRestr["pms.site_id"] = pmsRecord['pms.site_id'];
    }
	if (pmsRecord['pmp.tr_id'] != "") {
        pmsRestr["pmp.tr_id"] = pmsRecord['pmp.tr_id'];
    }

    return pmsRestr;
}

/*
*  Enable 'Copy' action only when select one grid row ( pms record).
*/
function enableCopyButton(selectGrid){
	var selections = selectGrid.getSelectedRows().length;
	if(selections==1){
			View.panels.get("pms_info").enableButton("copy",true);		
	}	else {
			View.panels.get("pms_info").enableButton("copy",false);		
	}
}


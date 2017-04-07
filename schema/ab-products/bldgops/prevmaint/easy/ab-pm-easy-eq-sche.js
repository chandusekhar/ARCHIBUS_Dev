/**
* The purpose of this view is to allow a user a very simple way to set up basic PM schedules, 
* and just a couple of options on how to automatically generate those schedules.
* This view allows just Equipment PMs to be created. The most important elements are the equipment and their schedules. 
* We¡¯ll follow the default of one PM schedule per work order.
*
 * @author Zhang Yi
 */
var easyEqPMController = View.createController('easyEqPMController', {

     //localized text for 'varies'
	variesText:"",
     //'varies' value hold in client which is consistent with server side string value
	variesValue:"<varies>",

    //use for decide if that is a varies value.
	regexp: /[>,<]/gi,

     //boolean sign indicate if currently is adding new schedule
	isAddNewSchedule:false,

     //Parsed Recurring Pattern Object
	recurringPattern:null,

	afterInitialDataFetch: function(){
		//initial locailzed text of 'varies'	
		this.variesText = "<"+getMessage('varies')+ ">";

		// Bind the onMultipleSelectionChange handler for equipment grid. 
	    this.eqGrid.addEventListener('onMultipleSelectionChange', this.onSelectMultipleEquipments.createDelegate(this) );
		
		//initial show the Genertion panel
		this.initialPmpgenForm();

		this.pmsForm_afterRefresh();
    },
    
	/**
	* Show information in the Generation panel if it exists in the pmgen table; otherwise create a new pmgen record and show it in form. 
	*/
	initialPmpgenForm:function(){
		//try to get generation record 
		var genRecord = 	 this.abPmEasyEqSchePmgenFormDs.getRecord();
		if ( this.abPmEasyEqSchePmgenFormDs.getRecords().length>0  ) {
			//if there does exist generation record then show it in form
			var pmgenId = 	 genRecord.getValue("pmgen.pmgen_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause("pmgen.pmgen_id",pmgenId, "=" );
			this.pmpgenForm.refresh(restriction);	
		}  
		else {
			//else show a new record
			this.pmpgenForm.refresh(null,true);	
		}
	},

	/**
	* Check radio button according to an existed pmgen record's recurring rule value, or default check the first one for the new. 
	*/
	pmpgenForm_afterRefresh:function(){
		this.recurringPattern = new RecurringPattern();
		if ( !this.pmpgenForm.newRecord )	{
			this.recurringPattern.xmlPattern = this.pmpgenForm.getFieldValue("pmgen.recurring_rule");
			this.recurringPattern.decode();
			if( this.recurringPattern.type == 'week') {
				this.checkRadioButtonByFieldValue( "recurring_pattern", "every_monday");
			}
			else if( this.recurringPattern.type == 'month') {
				this.checkRadioButtonByFieldValue( "recurring_pattern", "every_month");
			}
			else if( this.recurringPattern.type == 'trimonth') {
				this.checkRadioButtonByFieldValue( "recurring_pattern", "every_quarter");
			}
		} else {
			this.checkRadioButtonByFieldValue( "recurring_pattern", "every_monday");
		}
	},

	/**
	* Save the pmgen record.
	*/
	pmpgenForm_onSaveGen:function(){
		//Set recurring_rule value properly according to radio button's status   
		var recurringType = this.pmpgenForm.getFieldValue("recurring_pattern");
		this.recurringPattern.dateStart = this.pmpgenForm.getFieldValue("pmgen.date_start");
		if ( "every_monday"==recurringType ) {
			this.recurringPattern.type = 'week';
			this.recurringPattern.value1 = '1,0,0,0,0,0,0';
			this.recurringPattern.value2 = '';
		} 
		else if ( "every_month"==recurringType ) {
			this.recurringPattern.type = 'month';
			this.recurringPattern.value1 = '1st';
			this.recurringPattern.value2 = 'mon';
		} 
		else if ( "every_quarter"==recurringType ) {
			this.recurringPattern.type = 'trimonth';
			this.recurringPattern.value1 = '1st';
			this.recurringPattern.value2 = 'mon';
		}

		if (!this.recurringPattern.valid()) {
            return;
        } else {
			//construct xml format rule from the parsed recurring pattern object
			this.recurringPattern.encode();
			this.pmpgenForm.setFieldValue("pmgen.recurring_rule",this.recurringPattern.xmlPattern);
			this.pmpgenForm.save();
		}
	},

	/**
	*  Check radio button according to record's recurring rule value. 
	*/
	checkRadioButtonByFieldValue:function( fieldName, value){
		// not a simple field - try getting radio buttons
		var form = document.forms[this.pmpgenForm.formId];
		var buttonGroupName = this.pmpgenForm.getFieldElementName(fieldName);
		var buttonGroup = form[buttonGroupName];
		if (buttonGroup) {
			for (var i = 0; i < buttonGroup.length; i++) {
				if (value==buttonGroup[i].value) {
					buttonGroup[i].checked=true;
					break;
				}
			}
		}
  },

	/**
	* Show the equipment list filtered by console
	*/
	eqConsole_onShow: function() {

        this.eqGrid.refresh( this.eqConsole.getFieldRestriction() );        
        this.eqGrid.show( true );
    },

	/**
	* Hide the title for field 'interval_type'.
	*/
	pmsForm_afterRefresh: function() {
		$('pmsForm_pms.interval_type_labelCell').innerText='';
    },

	/**
	* after refresh and show equipment grid, bold its rows that have attached pms schedules
	*/
	eqGrid_afterRefresh: function(){

		var grid = this.eqGrid;
		//Loop through each row of eq grid to determine if set bold.
		grid.gridRows.each(function(row) {
			//get custom field value 'hasSchedule'
			var record = row.getRecord();
			var hasSchedule = record.getValue("eq.hasSchedule");

			if  ( "yes"==hasSchedule ){					
					//bold the row
					Ext.get(row.dom).setStyle('font-weight', 'bold');
			}  
		});
	},

	/**
	*When any multiple selection of equipment grid changed, refresh the PM Schedule grid
	*/
	onSelectMultipleEquipments:function(row){
			//if there are any selected equipment row, show the PM schedule grid, else hide it
			if( this.eqGrid.getSelectedRows().length>0 ){
				this.pmsGrid.show(true);
			}
			else {
				this.pmsGrid.show(false);
				return;
			}

			 //Refresh pms grid with restriction by selected equipment ids
			var rows =  this.eqGrid.getSelectedRows();
			var eqIds = this.getEqIdsList(rows);
			var restrictionForPms = " pms.eq_id IN "+ eqIds;
			this.pmsGrid.refresh(restrictionForPms);
	},

	/**
	* Add a new PM Schedule for selected equipment(s)
	*/
	eqGrid_onNewSchedule: function() {
		// if there are no selected equipment rows  then return
		if( this.eqGrid.getSelectedRows().length==0 ){
			View.showMessage( getMessage("noneEqSelected") );
			return;
		}
		else {
			//show a new pms record in pms form
			this.pmsForm.refresh( null, true );        
			this.pmsForm.show( true );
			this.removeExtraOptions();
			//set sign indicating of adding new schedule to 'true'
			this.isAddNewSchedule = true;
		}
    },

	/**
	* Edit selected pms records of pms grid in Pms form.
	*/
	pmsGrid_onEdit: function() {
		 //when currently there is a new pms record in pms form, alert user and return. 
		if ( this.isAddNewSchedule ){
			View.showMessage( getMessage("isAddNewSchedule"));
			return;
		}

		//if there are any selected equipment row, show the PM schedule grid, else hide it
		if( this.pmsGrid.getSelectedRows().length>0 ){
			this.pmsForm.show(true);
			this.loadMutliplePmsValues();
		}
		else {
			this.pmsForm.show(false);
			return;
		}
	},

	/**
	*	Show fields in Schedule Detail panel, filled in with the pms information from the selected schedules in the Schedules list
	*	If the selected schedules contain different data for the fields, then show the word ¡°<varies>¡±.
	*/
	loadMutliplePmsValues: function (){
		 //call WFR to get pms values from multiple PMS records
		var records = this.pmsGrid.getPrimaryKeysForSelectedRows();
		 try{
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-loadMultiPMSRecords', records);
		}catch(e){
			Workflow.handleError(e);
		}
		// set values to pms form
        if (result.code == 'executed') {
            var values = eval('(' + result.jsonExpression + ')');
			this.setPmsValues( values ); 
		}
        else {
            Workflow.handleError(result);
        }

	}, 

	/**
	*	Set values to pms form according to returned result from server side by WFR 'loadMultiPMSRecords'.
	*/
	setPmsValues: function (values){
		this.removeExtraOptions();
		var intervalType = values.interval_type;
		this.setPmsFieldValue( "interval_type", intervalType);

		var interval1 = values.interval_1;
		this.setPmsFieldValue( "interval_1", interval1);
		
		var dateFirstTodo = values.date_first_todo;
		this.setPmsFieldValue( "date_first_todo", dateFirstTodo);
	},

	/**
	*	Set value to field of pms form: determine set a real value or the localized word ¡°<varies>¡±.
	*/
	 setPmsFieldValue: function(fieldName, value){
		if (this.variesValue == value) {
			$("pmsForm_pms."+fieldName).value = this.variesText;
		}
		else {
			if("date_first_todo" ==fieldName){
				var dateArr = value.split('-');
				var day = parseInt(dateArr[2], 10);
				var month = parseInt(dateArr[1], 10);
				var year = parseInt(dateArr[0], 10);
				$("pmsForm_pms.date_first_todo").value =  this.pmsForm.formatDate(day,month,year,false); 
			} else {
				$("pmsForm_pms."+fieldName).value = value;
			}
		}
	 },

	/**
	* Delete selected pms records of pms grid in Pms form.
	*/
	pmsGrid_onDelete: function() {
		var rows = this.pmsGrid.getSelectedRows();
        if (rows.length == 0) {
			View.showMessage( getMessage('noneScheduleSelected') );
			return;
		}
		var pmsCode = "";
		try {
			for (var i = 0; i < rows.length; i++) {
				pmsCode = rows[i]["pms.pms_id"];
				var record = new Ab.data.Record({
					'pms.pms_id': pmsCode
				}, false);
				//Delete any selected records.				
				this.abPmEasyEqSchePmsGridDs.deleteRecord(record);
			}
			this.eqConsole_onShow();
			this.onSelectMultipleEquipments();
			this.pmsGrid.refresh();
		} 
		catch (e) {
			var errMessage = getMessage("errorDelete").replace('{0}', pmsCode);
			View.showMessage('error', errMessage, e.message, e.data);
			return;
		}
	},
	
	/**
	* Manually remove options "Miles", "Hours", "Meter" and "Manual" from drop-down list of field 'Interval Type'.
	*/
	removeExtraOptions: function() {
		var itemSelect = $("pmsForm_pms.interval_type");
		for (var i = 0; i < itemSelect.options.length; i++) {
			if (itemSelect.options[i])	 {
				var option = itemSelect.options[i];
				if (option.value=="i" || option.value=="h" || option.value=="e" || option.value=="a" )
					itemSelect.options.remove(i--); 
			}
		}
   },

	/**
	* Create new PM Schedule for each  selected equipments, or Save current edited PM Schedule(s) selected in PM Schedule grid.
	*/
	pmsForm_onSave: function() {
		if(this.isAddNewSchedule) {
			this.	saveNewPmsRecord();
			this.isAddNewSchedule = false;
		}
		else {
			this.	saveEditedPmsRecords();
		}
		this.eqConsole_onShow();
   },

	/**
	* Create new PM Schedules for each  selected equipments.
	*/
	saveNewPmsRecord: function(){

		//prepare parameters for WFR from field values of form
		var intervalType = this.pmsForm.getFieldValue("pms.interval_type");
		var interval1 = this.pmsForm.getFieldValue("pms.interval_1");
		var dateFirstToDo = this.pmsForm.getFieldValue("pms.date_first_todo");
		var rows =  this.eqGrid.getSelectedRows();
		var eqIds = this.getEqIds(rows);
		// Call WFR to insert into the pms table one record for each of the selected equipment; 
		// also insert a new record also into the pmp table for each of the selected equipment.
		try {												 
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-createEquipmentSchedules', intervalType,parseInt(interval1), dateFirstToDo, eqIds);
			//hide the form and refresh the equipment grid after eq pm schedule generated
			this.pmsForm.show( false );        
			this.onSelectMultipleEquipments(null);

		 } catch (e) {
			Workflow.handleError(e);
		 }

	},

	/**
	* Save current edited PM Schedule(s) selected in PM Schedule grid.
	*/
    saveEditedPmsRecords: function(){
		//get the value to paramater of workflow
		var records = this.pmsGrid.getPrimaryKeysForSelectedRows();
		var pmsValue = this.getMultiPmsValue();
		var result = {};
		//Save multi-loading pms records
		try {
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-saveMultiPMSRecords', pmsValue,records);
		 } catch (e) {
			Workflow.handleError(e);
		 }

		if (result.code == 'executed') {
			var message = getMessage('formSaved');
			this.pmsForm.show(false);
			this.pmsGrid.refresh();
		}
		else {
			Workflow.handleError(result);
		}            
    },

	/**
	* Get multiple pms value(s) when save the selected pms records
	*/
	getMultiPmsValue: function(){
		//get field value from form
		var pmp_id = this.pmsForm.getFieldValue("pms.pmp_id");    
		var interval_type = this.pmsForm.getFieldValue("pms.interval_type");
		var interval_1 = this.pmsForm.getFieldValue("pms.interval_1");
	    var date_first_todo = this.pmsForm.getFieldValue("pms.date_first_todo");		

		var fieldAndValueArray=[
									['date_first_todo',date_first_todo],
									['interval_type',interval_type],
									['interval_1',interval_1],
									['pmp_id',pmp_id]
				];
		 //construct values map
		var pmsValue = new Object();
		for(var i=0;i<fieldAndValueArray.length;i++){
			
			var field=fieldAndValueArray[i][0];
			var value=fieldAndValueArray[i][1];
			
			if (value.match(this.regexp) !=null) {
				pmsValue["pms."+field] = this.variesValue;
			}else{
				pmsValue["pms."+field] = value;
			}
		}
		return 	pmsValue;
	},

	/**
	*Construct a string by list of equipment ids, this string is used for SQL clause 'IN'.
	*/
	getEqIdsList:function(rows){
		var eqIds = "'"+rows[0]["eq.eq_id"]+"'";
		for (var i = 1; i < rows.length; i++) {
			var eqId = rows[i]["eq.eq_id"]; 
			eqIds = eqIds + ", '"+ eqId+"' "; 
		}
		return "( "+ eqIds +") ";
	},

	/**
	*Construct an array of equipment ids.
	*/
	getEqIds:function(rows){
		var eqIds = [];
		for (var i = 0; i < rows.length; i++) {
			var eqId = rows[i]["eq.eq_id"]; 
			eqIds.push(""+eqId); 
		}
		return eqIds;
	}
});

/**
 * Recurring Pattern object parsed from xml
*/
RecurringPattern = Base.extend({
    type: null, // recurring type.
    dateStart: null, // start date.
    value1: null, // the first value of the selected type
    value2: null, // the second value of the selected type
    xmlPattern: null, // the encode xml recurring pattern
    constructor: function(type, value1, value2, xmlPattern){
        if (type != undefined) 
            this.type = type;
        
        if (value1 != undefined) 
            this.value1 = value1;
        
        if (value2 != undefined) 
            this.value2 = value2;
        
        if (xmlPattern != undefined) 
            this.xmlPattern = xmlPattern;
    },
    
    //decode the xml pattern
    decode: function(){
        var xmlDocument = parseXml(this.xmlPattern, null, true);
        var nodes = selectNodes(xmlDocument, null, '//recurring');
        if (nodes.length > 0) {
            this.type = nodes[0].getAttribute('type');
            this.value1 = nodes[0].getAttribute('value1');
            this.value2 = nodes[0].getAttribute('value2');
        }
    },
    
    //encode to xml pattern
    encode: function(){
        this.xmlPattern = '<recurring type="' + this.type + '" value1="' + this.value1 + '"'
        if (this.value2 != null) {
            this.xmlPattern += ' value2="' + this.value2 + '"';
        }
        this.xmlPattern += '/>';
    },
    
    //validate the recurring pattern
    valid: function(){
        
        if (!this.type) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
                
        if (this.type == 'week' && this.value1.indexOf('1') < 0) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'month' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        if (this.type == 'trimonth' && (!this.value1 || !this.value2)) {
            View.showMessage(getMessage('noPattern'));
            return false;
        }
        
        this.encode();
        if (this.type != 'day') {
			//judge wheter the given start date match the given recurring rule.file='PreventiveMaintenanceCommonHandler.java'
            try {
                var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-isDateStartMatchRule', this.xmlPattern,this.dateStart);
                if (valueExists(result.jsonExpression) && result.jsonExpression == 'false') {
                    View.showMessage(getMessage('dateStartNotMatchRule'));
                    return false;
                }
            } 
            catch (e) {
                Workflow.handleError(e);
            }
        }
        
        return true;
    }
    
});


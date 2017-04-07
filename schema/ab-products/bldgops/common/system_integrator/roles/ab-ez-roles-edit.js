View.createController('ezRolesController', {
  
	selectedRole: null,
	stepTypes: {	basic:"noRecord",review:"noRecord",approval:"noRecord",
				notification:"noRecord",acceptance:"noRecord",dispatch:"noRecord",
				estimation:"noRecord",scheduling:"noRecord",verification:"noRecord",
				survey:"noRecord",escalation:"noRecord",forward:"noRecord" },
	numChecked:0,			
    selectedRadio:'emField',
	
	testTable:'',
	testField:'',
	testValue:'',
	
	
	afterInitialDataFetch: function() {
		this.emFieldsDialog.addEventListener('onMultipleSelectionChange', function(row) {
			View.controllers.get('ezRolesController').emFieldsDialog_onSelectRow(row);	
		});	
		var titleObj = Ext.get('testRole');
        titleObj.on('click', this.showMenu, this, null);
		
	},	
	
	showMenu: function(e, item){
        var menuItems = [];
       
        menuItems.push({
            text: "Select SR",
            handler: this.onTestRoleButtonPush.createDelegate(this, ['activity_log'])
        });
        menuItems.push({
            text: "Select WR",
            handler: this.onTestRoleButtonPush.createDelegate(this, ['wr'])
        });
		if(this.testTable!=''){
			menuItems.push({
				text: "Use "+(this.testTable=='wr'?'WR':'SR')+": "+this.testValue,
				handler: this.onTestRoleButtonPush.createDelegate(this, ['previous'])
			});
		}
       var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());        
    },
	
	onTestRoleButtonPush: function(menuItemId){
		switch (menuItemId) {
			case "activity_log":
                this.srReport.showInWindow({
					width: 800,
					height:500
					});
				this.srReport.refresh();	
                break;
            case "wr":
                this.wrReport.showInWindow({
					width: 800,
					height:500
					});
				this.wrReport.refresh();
                break;
			case "previous":
                this.onTestRole();
                break;	
		}
	},
	
	onSelectRequest: function(tableName,fieldValue){
		this.testTable = tableName;
		this.testField = tableName+'_id';
		this.testValue = fieldValue;
		if(tableName=='wr'){
			this.wrReport.closeWindow();
		}else{
			this.srReport.closeWindow();
		}
		this.onTestRole();		
	},
	
	onTestRole:function(){	
		var roleName = this.abEzRolesEdit_detailsPanel.getFieldValue('helpdesk_roles.role');		
		var parameters = {
			role: 	roleName,
			tableName: 	this.testTable,
			fieldName: 	this.testField,
			id:		this.testValue
		};		
		try{
			var result = Workflow.call('AbCommonResources-testServiceDeskRole', parameters);
			var rest = "em_id IN (";		
			for (var i = 0; i < result.data.length; i++) {
					rest = rest + "'"+result.data[i].replace("'","''")+"',";
			}

			if(result.data.length>0){
			   rest = rest.substring(0, rest.length-1);
			   rest = rest+")";
			}else{
				rest = '1=0';

			}
						
			this.emReport.refresh(rest);
			//	if (result.message != null)
			//		alert(result.message);
		} catch (e) {			
			Workflow.handleError(e);
		}		
	} ,
				
	onSelectRole:function(selectedRole){
		this.selectedRole=selectedRole;
		var dataSource = this.abEzRolesEditDs;
		var records = dataSource.getRecords({'helpdesk_roles.role':selectedRole});
		var existingType;
		// re-initialize stepTypes object
		for (var x in this.stepTypes) {
			this.stepTypes[x]="noRecord";
			}
		this.numChecked=0;	
		// set existing step types based on db records
		for (var i = 0; i < records.length; i++) {
			var record = records[i];			
			var type = record.getValue('helpdesk_roles.step_type');
			this.stepTypes[type]="updateRecord";
			existingType=type;
			this.numChecked=this.numChecked+1;
		}		
		for (var x in this.stepTypes) {
			if(this.stepTypes[x]=="updateRecord")			
				$(('stepTypeBox.'+x)).checked=true;
			else
				$(('stepTypeBox.'+x)).checked=false;
		}
		
		// select radiobutton for selected role
		if(record.getValue('helpdesk_roles.em_field')!=''){
			this.selectedRadio='emField';
			}
		else if(record.getValue('helpdesk_roles.sql_query')!=''){
			this.selectedRadio='sqlQuery';
			}
		else{
			this.selectedRadio='multiCritera';
			}
		$('stepRadio.'+this.selectedRadio).checked=1;
		this.onClickStepRadio(this.selectedRadio,false);
		
		this.abEzRolesEdit_detailsPanel.newRecord=false;
		this.abEzRolesEdit_detailsPanel.refresh({'helpdesk_roles.role':selectedRole,'helpdesk_roles.step_tpe':existingType});
		this.abEzRolesEdit_detailsPanel.actions.get('save').enable(true);
		this.abEzRolesEdit_detailsPanel.actions.get('save').setTitle('&#187; Save');
		this.emReport.show(false);
	},	
	
	checkStepType:function(value, checked){
		if(checked && this.stepTypes[value]=="noRecord"){
			this.stepTypes[value]="newRecord";
			this.numChecked=this.numChecked+1;
			}
		else if(!checked && this.stepTypes[value]=="newRecord"){
			this.stepTypes[value]="noRecord";	
			this.numChecked=this.numChecked-1;			
			}
		else if(!checked && this.stepTypes[value]=="updateRecord"){
			this.stepTypes[value]="deleteRecord";
			this.numChecked=this.numChecked-1;
			}
		else if(checked && this.stepTypes[value]=="deleteRecord"){
			this.stepTypes[value]="updateRecord";
			this.numChecked=this.numChecked+1;
			}

		if (this.numChecked == 0){
			this.abEzRolesEdit_detailsPanel.actions.get('save').setTitle('&#187; Delete');
		}		
		else{
			this.abEzRolesEdit_detailsPanel.actions.get('save').setTitle('&#187; Save');
			this.abEzRolesEdit_detailsPanel.actions.get('save').enable(true);
		}
		
	},
	
	onClickStepRadio:function(value, userClicked){
		if(userClicked && this.abEzRolesEdit_detailsPanel.newRecord==false){		
			View.confirm('Changing this option will delete value(s) entered for previously selected option.  Do you wish to continue?', function(button) {
				if (button == 'yes') {
					this.selectedRadio=value;
					View.controllers.get('ezRolesController').showAndClearCriteriaFields(value, true);
					}
				else
					$('stepRadio.'+this.selectedRadio).checked=1;
					View.controllers.get('ezRolesController').showAndClearCriteriaFields(this.selectedRadio,false);
			});
		}	  
		else{	 
			this.selectedRadio=value;
			this.showAndClearCriteriaFields(value, false);
		}
	},
	
	showAndClearCriteriaFields:function(value, clear){
		var fieldsArray=['helpdesk_roles.em_field', 'helpdesk_roles.match_request', 'helpdesk_roles.match_em', 
			'helpdesk_roles.security_role', 'helpdesk_roles.sql_query'];
		var showArray=[false, false, false, false, false];
		if(value=='emField'){
			showArray=[true, false, false, false, false];
		}
		else if(value=='multiCritera'){
			showArray=[false, true, true, true, false];
		}
		else{ // value == sqlQuery
			showArray=[false, false, false, false, true];
		}
		for(var i=0;i<=4;i++){
			this.abEzRolesEdit_detailsPanel.showField(fieldsArray[i],showArray[i]);
			// added to resolve label display issue in 21.1
			var fieldEl = this.abEzRolesEdit_detailsPanel.getFieldElement(fieldsArray[i]);
			var parent = fieldEl.parentNode.parentNode.previousSibling;
			this.abEzRolesEdit_detailsPanel.showElement(parent, showArray[i]);
			
			if(clear && !showArray[i]){
				this.abEzRolesEdit_detailsPanel.setFieldValue(fieldsArray[i],'');
			}
		}
	},
	
	
	addNew:function() {
		for (var x in this.stepTypes) {
			this.stepTypes[x]="noRecord";
			$(('stepTypeBox.'+x)).checked=false;
			}	
		this.numChecked=0;
		this.abEzRolesEdit_detailsPanel.newRecord=true;
		//must select one radio button, so use the first
		this.selectedRadio='emField';
		$('stepRadio.'+this.selectedRadio).checked=1;
		this.onClickStepRadio(this.selectedRadio,false);
		
		this.abEzRolesEdit_detailsPanel.refresh(true);
		this.emReport.show(false);
		this.abEzRolesEdit_detailsPanel.actions.get('save').setTitle('&#187; Save');
		this.abEzRolesEdit_detailsPanel.actions.get('save').enable(false);
	},	
	
	abEzRolesEdit_detailsPanel_onSave:function() {
		var record = this.abEzRolesEdit_detailsPanel.getRecord();
		
		var currentRoleName=this.abEzRolesEdit_detailsPanel.getFieldValue('helpdesk_roles.role');
		var canSave=true;
		// form validation
		if(currentRoleName==''){
			this.abEzRolesEdit_detailsPanel.addInvalidField('helpdesk_roles.role','Role Name must be set');            
			canSave=false
			}
		if(record.getValue('helpdesk_roles.default_em')==''){
			this.abEzRolesEdit_detailsPanel.addInvalidField('helpdesk_roles.default_em','Default Employee must be set');	
			canSave=false;
			}	 
		
		if(canSave && this.numChecked==0){
			View.confirm('Are you sure you wish to delete this role for all step types?', function(button) {
				if (button == 'yes') {
					View.controllers.get('ezRolesController').doSave();
				}
			});
		}		
		else if(canSave && this.numChecked > 0){
			this.doSave();			
		}
		else{
			this.abEzRolesEdit_detailsPanel.displayValidationResult();
		}
	},
	
	// save for each checked type, delete for each unchecked type
	doSave:function(){
		var dataSource = this.abEzRolesEditDs;
		var record = this.abEzRolesEdit_detailsPanel.getRecord();
		
		var currentRoleName=this.abEzRolesEdit_detailsPanel.getFieldValue('helpdesk_roles.role');
		for (var x in this.stepTypes) {
				if(this.stepTypes[x]!="noRecord"){
					record.setValue('helpdesk_roles.step_type',x);
					record.oldValues['helpdesk_roles.step_type']=x;
					if(this.stepTypes[x]=="newRecord"){
						record.isNew=true;
						dataSource.saveRecord(record);
					}else if(this.stepTypes[x]=="updateRecord"){
						record.isNew=false;
						dataSource.saveRecord(record);
					}else if(this.stepTypes[x]=="deleteRecord"){
						dataSource.deleteRecord(record);
					}
				}
			}		
			this.abEzRolesSelectPanel.refresh();
			if(this.numChecked==0)
				this.abEzRolesEdit_detailsPanel.show(false);
			else
				this.onSelectRole(currentRoleName);
	},
	
	// select request match fields dialog
	requestFieldsDialog_afterRefresh:function(){
		var values = this.abEzRolesEdit_detailsPanel.getFieldValue('helpdesk_roles.match_request');
		 var valuesMap = {};
		var valuesArray = values.split(';');
		for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            valuesMap[value] = value;
        }
		this.requestFieldsDialog.gridRows.each(function(row) {
            var value = row.getRecord().getValue('afm_flds.field_name');
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });
	},
	requestFieldsDialog_onSave:function(){
	    var selectedRows = this.requestFieldsDialog.getSelectedRows();
		var fieldList='';
		for (var i = 0; i < selectedRows.length; i++) {
			var selectedRow = selectedRows[i];
			fieldList=fieldList + selectedRow['afm_flds.field_name'] +';'
			}
		fieldList=fieldList.substring(0, fieldList.length-1);	
		this.abEzRolesEdit_detailsPanel.setFieldValue('helpdesk_roles.match_request',fieldList);
		this.requestFieldsDialog.closeWindow();
  	},
	requestFieldsDialog_onClear:function(){
	    this.requestFieldsDialog.setAllRowsSelected(false);
  	},
	
	// select em match fields and set value dialog
	emFieldsDialog_onSelectRow:function(row){
		if(row.grid.gridRows.items[row.index].isSelected()){
			row.row.dom.cells[3].innerHTML='<input type="text" id="valueBox'+row.index+'" value="'+row['afm_flds.value']+'" style="width:80"/> ';
		}
		else{
			row.row.dom.cells[3].innerHTML=row['afm_flds.value'];
		}
	},
	emFieldsDialog_afterRefresh:function(){
		var values = this.abEzRolesEdit_detailsPanel.getFieldValue('helpdesk_roles.match_em');
		 var valuesMap = {};
		 var fieldsMap = {};
		var valuesArray = values.split(';');
		for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
			var field = value.substring(0,value.lastIndexOf(':'));
            fieldsMap[field] = field;
			valuesMap[field] = value.substring(value.lastIndexOf(':')+1,value.length);
        }
		this.emFieldsDialog.gridRows.each(function(row) {
            var field = row.getRecord().getValue('afm_flds.field_name');
            // if we have this value in the list, select the row
            if (valueExists(fieldsMap[field])) {				
                row.select();
				row.dom.cells[3].innerHTML='<input type="text" id="valueBox'+row.record.index+'" value="'+valuesMap[field]+'" style="width:80"/> ';
            }
        });
	},

	emFieldsDialog_onSave:function(){
	    var selectedRows = this.emFieldsDialog.getSelectedRows();
		var fieldList='';
		for (var i = 0; i < selectedRows.length; i++) {
			var selectedRow = selectedRows[i];
			fieldList=fieldList + selectedRow['afm_flds.field_name'] + ':' 
				+ document.getElementById("valueBox"+selectedRow.index).value +';'
			}
		fieldList=fieldList.substring(0, fieldList.length-1);	
		this.abEzRolesEdit_detailsPanel.setFieldValue('helpdesk_roles.match_em',fieldList);
		this.emFieldsDialog.closeWindow();
  	},
	emFieldsDialog_onClear:function(){
	    this.emFieldsDialog.setAllRowsSelected(false);
  	}  

});

function onSelectRole(row){
	View.controllers.get('ezRolesController').onSelectRole(row.restriction['helpdesk_roles.role']);	
}
function checkStepType(value) {
	View.controllers.get('ezRolesController').checkStepType(value,$('stepTypeBox.'+value).checked);
	}
function addNew() {
	View.controllers.get('ezRolesController').addNew();
	}	
function onClickStepRadio(value, userClicked){
	View.controllers.get('ezRolesController').onClickStepRadio(value, userClicked);
}
function selectServiceRequest(row){
	View.controllers.get('ezRolesController').onSelectRequest('activity_log',row['activity_log.activity_log_id']);
}
function selectWorkRequest(row){
	View.controllers.get('ezRolesController').onSelectRequest('wr',row['wr.wr_id']);
}
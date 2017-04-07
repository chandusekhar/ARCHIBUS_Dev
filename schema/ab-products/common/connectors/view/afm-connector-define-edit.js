var connectorController = View.createController('connectorController', {
	
	connectorJob: 'AbSystemAdministration-ConnectorService-sampleConnnectorRecord',
	connectorEncode: 'AbSystemAdministration-ConnectorService-encodeString',
	connectorExecuteJob: 'AbSystemAdministration-ConnectorJob-executeConnector',
	job_id: 0,
	selectedRows: [],
	configArray: [],
	
	afterViewLoad: function(){
		this.configArray.push({"check":"LDAP|Export", "msgId":getMessage('LdapExport')});
		this.configArray.push({"check":"LDAP (Active Directory)|Export", "msgId":getMessage('LdapAdExport')});
		this.configArray.push({"check":"COBie|Export", "msgId":getMessage('CobieExport')});
		this.configArray.push({"check":"OSCRE Space Classification|Export", "msgId":getMessage('OscreExport')});
		this.configArray.push({"check":"DBF|Export", "msgId":getMessage('DbfExport')});
		this.configArray.push({"check":"Xls Sheets|Export", "msgId":getMessage('XlsSheetsExport')});
		this.configArray.push({"check":"EDI|Export", "msgId":getMessage('EdiExport')});
	},
	
		
		
		

	connectorPanel_afterRefresh : function() {

		$('ftpPassword').value = this.connectorPanel.getFieldValue("afm_connector.ftp_password");
		$('connPassword').value = this.connectorPanel.getFieldValue("afm_connector.conn_password");
		// first time only:
		onChangeDisableFields();
		onChangeDisableRowstoSkip();	 	
	},
	
	connectorPanel_beforeSave : function() {
		var connPassword = $("connPassword").value;
		if(connPassword != ''){
			var connResult = Workflow.callMethod(this.connectorEncode, connPassword ).message;
			$('connPassword').value =  connResult;
			this.connectorPanel.setFieldValue("afm_connector.conn_password", connResult);
		}
		
		var ftpPassword = $("ftpPassword").value;
		if(ftpPassword != ''){
			var ftpResult = Workflow.callMethod(this.connectorEncode, ftpPassword ).message;
			$('ftpPassword').value =  ftpResult;
			this.connectorPanel.setFieldValue("afm_connector.ftp_password", ftpResult);
		}	
		
		
		var connectorType = this.getDropDownValue("afm_connector.type");
		var importExport = this.getDropDownValue("afm_connector.import");
		
		var okToProceed = this.validateConnectorOptions(connectorType, importExport);
		
		var icon = "<img src='warn.png' alt='Warning' height='42' width='42'>" 
		
			if(okToProceed){
				View.showMessage("<table><tr><td>" + icon + "</td><td valign='center' style='font-size : 12;'>" + okToProceed +"</td><tr></table>");
			}
		
		
	},
	// KB 3045179 - Newly created connector records issues when changing tabs
	afterSave : function() {
		var formPanel = View.panels.get('connectorPanel');
		var connector_id = formPanel.getFieldValue('afm_connector.connector_id');
		var controller = View.getView('parent').controllers.get('connectorTabsController');
		controller.connector_id = connector_id;
	},
	// KB 3045190 - No delete option available for created Connectors
	afterDelete : function() {
		var controller = View.getView('parent').controllers.get('connectorTabsController');
		controller.connector_id = null;	
	},

	connectorPanel_onSample : function(){
		var controller = this;
		var connector_id = this.connectorPanel.getFieldValue("afm_connector.connector_id");
		
		var connectorType = this.getDropDownValue("afm_connector.type");
		var importExport = this.getDropDownValue("afm_connector.import");
		
		var okToProceed = this.validateConnectorOptions(connectorType, "Sample");		
		var icon = "<img src='warn.png' alt='Warning' height='42' width='42'>" 
		
			if(okToProceed){
				View.showMessage("<table><tr><td>" + icon + "</td><td valign='center' style='font-size : 12;'>" + okToProceed +"</td><tr></table>");
				return;
			}
		
		
		
		this.selectedRows = [];
		
		
		try{
			var parameters = {
					strConnector: connector_id 
		   		};     		
				var result = Workflow.callMethod(this.connectorJob, connector_id); 
				
		     	if (result.code == 'executed') {
		     		this.sampleResultsPanel.showInWindow({
		    	        width: 800,
		    	        height: 600
		    	    });
		    		this.sampleResultsPanel.show(true);
		     		var rows = eval('('+result.jsonExpression+')');
		     		
		     		var columns = [
		     		               	new Ab.grid.Column('check', '', 'checkbox', this.selectField.createDelegate(this)),
		     		               	new Ab.grid.Column('position', getMessage('connector_define_position'), 'text'),
		     		                new Ab.grid.Column('field', getMessage('connector_define_field'), 'text'),
		     		                new Ab.grid.Column('value', getMessage('connector_define_sample_value'), 'text'),		     		               
		     		                new Ab.grid.Column('sample.assign', '', 'button', this.assignField.createDelegate(this)),
		     		                new Ab.grid.Column('aifld', getMessage('connector_define_archibus_field'), 'text')];
		     		            	columns[4].text = getMessage('connector_define_assign');
		     		            
		     		            var configObj = new Ab.view.ConfigObject();
		     		            configObj['rows'] = rows;
		     		            configObj['columns'] = columns;
		     		    
		     		            // create new Grid component instance   
		     		            var grid = new Ab.grid.Grid('sampleResultsPanel', configObj);
		     		            grid.build();
		     		
		     		            
		     		           var head = Ext.get('sampleResultsPanel_head');
		     		           var panelHeaderToRemove = head.first().next();
		     		           
		     		          panelHeaderToRemove.remove();
		     		
		     	}	
			
		}catch(e){		
				Workflow.handleError(e);				
		}
		
		
	},
	
	selectField: function(row) {
		var controller = this;
		
        if(!this.selectedRows[row['field']]){
        	this.selectedRows[row['field']] = row;	        	
        }else{
        	delete this.selectedRows[row['field']];
        }
	},
	
	assignField: function(row) {
		var controller = this;
        var table_name = this.connectorPanel.getFieldValue("afm_connector.destination_tbl");
        var restTable = new Ab.view.Restriction();
        restTable.addClause("afm_flds.table_name",table_name,'=');        
        
        // select value using nested function to handle selected value
		var actionListener = function(fieldName, newValue, oldValue) {
            controller.setRowValue(row, 'aifld', newValue, 5);
            return false;
        };
        
        View.selectValue({
			title: 'Select Field',
	    	fieldNames: ['afm_flds.field_name'],
	    	selectTableName: 'afm_flds',
	    	selectFieldNames: ['afm_flds.field_name'],
	    	visibleFieldNames: ['afm_flds.field_name', 'afm_flds.ml_heading'],
	    	actionListener: actionListener,
	    	restriction: restTable,
	    	showIndex: true,
	    	width: 500,
	    	height: 400
		}); 
    },
		
	sampleResultsPanel_onAdd: function(){
		var connector_id = this.connectorPanel.getFieldValue("afm_connector.connector_id");
		var import_export = this.connectorPanel.getFieldValue("afm_connector.import");
		
		var tabPanel = View.getView('parent').panels.get('tabs_connector');
		var i = 0;
		for (var rec in this.selectedRows) {
			var s = this.selectedRows[rec];
			
			if(import_export == 0){
				var record = new Ab.data.Record({
					'afm_conn_flds.connector_id': connector_id,
					'afm_conn_flds.position': i,
					'afm_conn_flds.rule_id': "NONE",
					'afm_conn_flds.field_id': s["field"],
					'afm_conn_flds.destination_fld': s["aifld"]
				}, true);
			}else{
				var record = new Ab.data.Record({
					'afm_conn_flds.connector_id': connector_id,
					'afm_conn_flds.position': i,
					'afm_conn_flds.rule_id': "NONE",
					'afm_conn_flds.field_id': s["aifld"],
					'afm_conn_flds.destination_fld': s["field"]
				}, true);
			}
			
			var field = record.getValue('afm_conn_flds.field_id');
			var dest_fld = record.getValue('afm_conn_flds.destination_fld');
			if(dest_fld.length > 0){
				try {
						this.ds_conn_fields.saveRecord(record);
				}				
				catch (e) {
					var message = "Error saving records";
					View.showMessage('error', message, e.message, e.data);
					return;
				}
			}
			i++;
		}
		
		 this.sampleResultsPanel.closeWindow();
		 tabPanel.selectTab('page-3').refresh();
	},
	
	connectorPanel_onRun : function(){
		var controller = this;
		var connector_id = this.connectorPanel.getFieldValue("afm_connector.connector_id");
		//alert (View.panels.get('connectorPanel').newRecord);
		try{
			this.jobId = Workflow.startJob(this.connectorExecuteJob, connector_id);

			View.getView('parent').controllers.get(0).jobId = this.jobId;
		}catch(e){
   			Workflow.handleError(e);
		}
		var tabPanel = View.getView('parent').panels.get('tabs_connector');
		tabPanel.selectTab('page-5').refresh();
	},

	setRowValue: function(row, fieldName, fieldValue, updateCellIndex) {
		var idx = row.index;
		var cell = row.grid.cells[idx];
        var value = cell[updateCellIndex];
        value.innerHTML = fieldValue;
        row[fieldName] = fieldValue;
	},
	
	getDropDownValue: function(fieldName){
		return dropDownValue = $(fieldName).options[$(fieldName).selectedIndex].text;
	},
	
	
	validateConnectorOptions: function(field1, field2){
		var fieldsToCheck = field1 + "|" + field2;
		var message;
		for (var i = 0; i < this.configArray.length; i++) {
		    if(this.configArray[i].check == fieldsToCheck){
		    	message = this.configArray[i].msgId;		   
		    	return message;
		    }
		}
		
		return null;
		
	}
	
	
});

function onChangeConnectorPassword(){
	var panel = View.panels.get("connectorPanel");
	var connPassword = $("connPassword").value;
	if(connPassword != ''){
		panel.setFieldValue("afm_connector.conn_password",connPassword);
	}
}

function onChangeFtpPassword(){
	var panel = View.panels.get("connectorPanel");
	var ftpPassword = $("ftpPassword").value;
	if(ftpPassword != ''){
		panel.setFieldValue("afm_connector.ftp_password",ftpPassword);
	}
}

// KB 3045455 - Disable 'Text Qualifier' and 'Delimeter' when 'Connector Type' is not "Text File" or "Custom"
function onChangeDisableFields(){
	var formPanel = View.panels.get('connectorPanel');
	var connectorType = formPanel.getFieldValue('afm_connector.type');
	var delimeterField = formPanel.fields.get('afm_connector.delimeter');
	var text_qualifierField = formPanel.fields.get('afm_connector.text_qualifier');
	if(connectorType == "1" || connectorType == "99"){
		delimeterField.dom.disabled = false;
		text_qualifierField.dom.disabled = false;
	}
	else{
		delimeterField.dom.disabled = true;
		text_qualifierField.dom.disabled = true;
		text_qualifierField.dom.selectedIndex = 0;
		delimeterField.dom.selectedIndex = 0;
	}
}

// KB 3045456 - Disable "Number of Rows to Skip" when Import/Export is set to Export
function onChangeDisableRowstoSkip(){
	var formPanel = View.panels.get('connectorPanel');
	var importExport = formPanel.getFieldValue('afm_connector.import');
	var skipFirstRow = formPanel.fields.get('afm_connector.skip_first_row');
	if (importExport == "1"){
		skipFirstRow.dom.disabled = true;
	}
	else{
		skipFirstRow.dom.disabled = false;
	}
}

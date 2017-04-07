var dashDefOrderProcessesController = View.createController('dashDefOrderProcesses',{
	processRow:null,
	processId:null,
	activityId:null,
    afterInitialDataFetch: function() {
		this.restoreSelection();
		this.processGrid.enableSelectAll(false);
    },
	processForm_onCancel: function(){
		this.processForm.setFieldValue('afm_processes.process_id', '');
		this.processForm.setFieldValue('afm_processes.display_order', 0);
		this.processForm.setFieldValue('afm_processes.license_level', 'AbCoreLevel1');
		this.processForm.show(false, true);
	},
	processForm_onSave: function(){
		if(!validateData(this.processGrid.gridRows, this.processForm.getFieldValue('afm_processes.display_order'), 'display_order') ||
			!validateData(null, this.processForm.getFieldValue('afm_processes.process_id'), 'process_id')){
			return;
		}
		var record = new Ab.data.Record({
			'afm_processes.process_id':this.processForm.getFieldValue('afm_processes.process_id'),
			'afm_processes.activity_id':this.processForm.getFieldValue('afm_processes.activity_id'),
			'afm_processes.display_order':this.processForm.getFieldValue('afm_processes.display_order'),
			'afm_processes.process_type':this.processForm.getFieldValue('afm_processes.process_type'),
			'afm_processes.title':this.processForm.getFieldValue('afm_processes.process_id'),
			'afm_processes.license_level':this.processForm.getFieldValue('afm_processes.license_level')
		}, true);
		try{
			this.processGrid_dataSource.saveRecord(record);
			//this.processForm.save();
			this.processForm.setFieldValue('afm_processes.process_id', '');
			this.processForm.setFieldValue('afm_processes.display_order', 0);
			this.processForm.show(false, true);
			this.processForm.newRecord = true;
			var restriction = ' activity_id = \''+this.activityId+'\' and process_type IN (\'WEB\', \'WEB-DASH\') ';
			this.processGrid.refresh(restriction);
		}
		catch(e){
	        var message = getMessage('error_save');
	        View.showMessage('error', message, e.message, e.data);
		}
		
	},
	processGrid_onNew: function(){
		this.processForm.setFieldValue('afm_processes.activity_id', this.activityId);
		this.processForm.setFieldValue('afm_processes.process_id', '');
		this.processForm.setFieldValue('afm_processes.display_order', 0);
		this.processForm.setFieldValue('afm_processes.process_type', 'WEB-DASH');
		this.processForm.setFieldValue('afm_processes.license_level', 'AbCoreLevel1');
		this.processForm.enableField('afm_processes.activity_id', false);
		this.processForm.enableField('afm_processes.process_type', false);
		this.processForm.show(true, true);
	},
	processGrid_onNext: function(){
		if(this.processRow == null){
			View.showMessage(getMessage('error_process_id'));
			return;
		}
		this.saveData();
		this.processForm.show(false, true);
		View.controllers.get('dashDefWizard').navigateToTab('page2');
	},
	processGrid_multipleSelectionColumn_onClick: function(row){
		if(row.getFieldValue('afm_processes.process_type') != 'WEB-DASH'){
			View.showMessage(getMessage('error_no_web_dash_type'));
			row.unselect();
			return;
		}
		if(this.processRow != null){
			this.processRow.unselect();
			this.processRow.dom.className = this.processRow.dom.className.replace(' selected', '');
		}
		if(row.isSelected()){
			this.processRow = row;
			View.controllers.get('dashDefLayout').layout = null;
		}
		else{
			this.processRow = null;
			this.tabs.wizard.setProcess(null);
		}
	},
	processGrid_up_onClick: function(row){
		var rows = this.processGrid.gridRows;
		var restriction = ' activity_id = \''+this.activityId+'\' and process_type IN (\'WEB\', \'WEB-DASH\')';
		if(getIndexOf(rows, row) == 0){
			View.showMessage(getMessage('error_up_first'));
			return;
		}
		var rowOrder = row.getRecord().getValue('afm_processes.display_order');
		var prevOrder = rows.get(getIndexOf(rows, row)-1).getRecord().getValue('afm_processes.display_order');
		var rowRecord = row.getRecord();
		var prevRecord = rows.get(getIndexOf(rows, row)-1).getRecord()
		rowRecord.setValue('afm_processes.display_order',prevOrder);
		prevRecord.setValue('afm_processes.display_order',rowOrder);
		try{
			this.processGrid_dataSource.saveRecord(rowRecord);
			this.processGrid_dataSource.saveRecord(prevRecord);
		}
		catch(e){
	        var message = String.format(getMessage('error_update'), selected);
	        View.showMessage('error', message, e.message, e.data);
		}
		this.processGrid.refresh(restriction);
	},
	processGrid_down_onClick: function(row){
		var rows = this.processGrid.gridRows;
		var restriction = ' activity_id = \''+this.activityId+'\' and process_type IN (\'WEB\', \'WEB-DASH\') ';
		if(getIndexOf(rows, row) == rows.getCount()-1){
			View.showMessage(getMessage('error_down_last'));
			return;
		}
		var rowOrder = row.getRecord().getValue('afm_processes.display_order');
		var nextOrder = rows.get(getIndexOf(rows, row)+1).getRecord().getValue('afm_processes.display_order');
		var rowRecord = row.getRecord();
		var nextRecord = rows.get(getIndexOf(rows, row)+1).getRecord()
		rowRecord.setValue('afm_processes.display_order',nextOrder);
		nextRecord.setValue('afm_processes.display_order',rowOrder);
		try{
			this.processGrid_dataSource.saveRecord(rowRecord);
			this.processGrid_dataSource.saveRecord(nextRecord);
		}
		catch(e){
	        var message = String.format(getMessage('error_update'), selected);
	        View.showMessage('error', message, e.message, e.data);
		}
		this.processGrid.refresh(restriction);
	},
	processGrid_delete_onClick: function(row){
		var reportPanel = this.processGrid;
		var dataSource = this.processGrid_dataSource;
		var selected = row.getRecord().getValue('afm_processes.process_id');
		var restriction = ' activity_id = \''+this.activityId+'\' ';
		var recordRestriction = ' activity_id = \''+this.activityId+'\' and process_id = \''+selected+'\' ';
		var controller = dashDefOrderProcessesController;
		View.confirm(getMessage('confirm_delete'), function(button){
			if(button == 'yes'){
                try {
					var record = dataSource.getRecord(recordRestriction);
					dataSource.deleteRecord(record);
					if(row == controller.processRow){
						controller.processRow = null;
					}
					reportPanel.refresh(restriction);
					
                } catch (e) {
                    var message = String.format(getMessage('error_delete'), selected);
                    View.showMessage('error', message, e.message, e.data);
                }
				
			}
		})
	},
	saveData: function(){
		if(this.processRow != null){
			this.tabs.wizard.setProcess(this.processRow.getRecord().getValue('afm_processes.process_id'));
			this.tabs.wizard.setProcessLicenseLevel(this.processRow.getRecord().getValue('afm_processes.license_level'));
			if(this.processRow.getRecord().getValue('afm_processes.dashboard_layout').length > 0){
				this.tabs.wizard.setDashboardLayout(this.processRow.getRecord().getValue('afm_processes.dashboard_layout'));
				this.tabs.wizard.setDashboardFile(this.processRow.getRecord().getValue('afm_processes.dashboard_view'));
			}
		}
	},
	restoreSelection: function(){
		this.activityId = this.tabs.wizard.getActivity();
		this.processId = this.tabs.wizard.getProcess();
		var restriction = 'activity_id = \'';
		restriction += this.activityId;
		restriction += '\' and process_type IN (\'WEB\', \'WEB-DASH\') ';
		this.processGrid.refresh(restriction);
        // hide the form
        this.processForm.show(false, true);
		this.processForm.newRecord = true;
		for(var i=0;i<this.processGrid.gridRows.getCount();i++){
			this.processGrid.gridRows.get(i).select(false);
			if(this.processId == this.processGrid.gridRows.get(i).getFieldValue('afm_processes.process_id')){
				this.processRow = this.processGrid.gridRows.get(i);
				this.processRow.select(true);
				this.processRow.dom.className = this.processRow.dom.className + ' selected';
				break;
			}
		}
	}
});
function getIndexOf(collection, object){
	var result = -1;
	for(var i=0;i<collection.getCount();i++)
		if(collection.get(i) == object)
			result = i;
	return (result);
}
function validateData(rows, value, field){
	var result = true;
	if(field == 'display_order'){
		var regExp = new RegExp('^[0-9]{1,}$', 'gi');
		if(!regExp.test(value)){
			View.showMessage(getMessage('error_displayorder_invalid'));
			return (false);
		}
		if(parseInt(value)<=0){
			View.showMessage(getMessage('error_displayorder_invalid'));
			return (false);
		}
		if(parseInt(value)>65500){
			
		}
		for(var i=0;i<rows.getCount();i++){
			if(rows.get(i).getRecord().getValue('afm_processes.display_order') == value){
				View.showMessage(getMessage('error_displayorder_exist'));
				return (false);
			}
		}
	}
	if(field == 'process_id'){
		if(value == ''){
			View.showMessage(getMessage('error_process_empty'));
			return (false);
		}
	}
	return (true);
}


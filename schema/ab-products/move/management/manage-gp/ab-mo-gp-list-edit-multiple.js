/**
 * controller definition for edit multiple 
 */
var controller = View.createController('abMoGroupEditMultipleCtrl',{
	
	// selected rows pkyes
	pkSelectedRows: null,
	
	// opened grid object
	objGrid: null,
	
	// edit multiple records list
	records: null,
	
	/**
	 * after view load handler
	 * set field label wrapping text
	 */
	afterViewLoad: function(){
		if (this.form_abMoGroupListEditMultiple.fields.get("mo.from_location")){
			var fieldLabel = getMessage("msg_from_location_title");
			fieldLabel = fieldLabel.replace("{0}", "<br/>");
			this.form_abMoGroupListEditMultiple.setFieldLabel("mo.from_location", fieldLabel);
		}
	},
	
	/**
	 * after initial data fetch handler
	 * fill form values
	 */
	afterInitialDataFetch: function(){
		this.pkSelectedRows = this.view.parameters.pkSelectedRows;
		this.objGrid = this.view.parameters.objGrid;
		var ds = View.dataSources.get('ds_abMoGroupListEditMultiple');
		var pkeys = [];
		for(var i =0;i< this.pkSelectedRows.length;i++){
			pkeys.push(this.pkSelectedRows[i]['mo.mo_id']);
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('mo.mo_id', pkeys, 'IN');
		this.records = ds.getRecords(restriction);
		var addRow = '';
		for(var i=0;i<this.records.length;i++){
			if(i>0){
				addRow = '_row'+i;
			}
			var record = this.records[i];
			var values = record.values;
			for(field in values){
				var value = ds.formatValue(field, values[field], true);
				this.form_abMoGroupListEditMultiple.setFieldValue(field+addRow, value);
			}
		}
	},
	
	/**
	 * save handler.
	 */
	form_abMoGroupListEditMultiple_onSave: function(){
		if (this.commonSave()) {
			this.objGrid.refresh();
		}
	},
	
	/**
	 * save & close handler.
	 */
	form_abMoGroupListEditMultiple_onSaveClose: function(){
		if (this.commonSave()) {
			this.objGrid.refresh();
			View.closeThisDialog();
		}
	},
	/**
	 * common save function.
	 */
	commonSave: function(){
		View.openProgressBar(getMessage('msg_saving'));
		var addRow = '';
		for(var i=0;i<this.records.length;i++){
			if(i>0){
				addRow = '_row'+i;
			}
			var record = this.records[i];
			var values = record.values;
			for(field in values){
				var value = this.form_abMoGroupListEditMultiple.getFieldValue(field+addRow);
				record.setValue(field, value);
			}
			record.isNew = false;
			try{
				this.ds_abMoGroupListEditMultiple.saveRecord(record);
			}catch(e){
				View.closeProgressBar();
				Workflow.handleError(e);
				return false;
			}
		}
		View.closeProgressBar();
		return true;
	}
})

/**
 * Open select value for to_jk_id_data and to_jk_id_voice
 * 
 * @param row selected row
 * @param type row type (data or voice)
 * @param commandObject command object
 */
function openSelectValue(row, type, commandObject){
	var restriction = new Ab.view.Restriction();
	var msgTitle = '';
	var targetField = '';
	if(type == 'data'){
		targetField = 'mo.to_jk_id_data';
		msgTitle = 'msg_data_title';
		restriction.addClause('jk.tc_service', 'D', '=');
	}else if(type == 'voice'){
		targetField = 'mo.to_jk_id_voice';
		msgTitle = 'msg_voice_title';
		restriction.addClause('jk.tc_service', 'V', '=');
	}
	var form = commandObject.getParentPanel();
	var addToId = '';
	if(row > 0){
		addToId = '_row'+row;
	}
	var bl_id = form.getFieldValue('mo.to_bl_id'+addToId);
	if(valueExistsNotEmpty(bl_id)){
		restriction.addClause('jk.bl_id', bl_id, '=');
	}
	var fl_id = form.getFieldValue('mo.to_fl_id'+addToId);
	if(valueExistsNotEmpty(fl_id)){
		restriction.addClause('jk.fl_id', fl_id, '=');
	}
	var rm_id = form.getFieldValue('mo.to_rm_id'+addToId);
	if(valueExistsNotEmpty(rm_id)){
		restriction.addClause('jk.rm_id', rm_id, '=');
	}
	
	View.selectValue(form.id, 
			getMessage(msgTitle),
			[targetField+addToId],
			'jk',
			['jk.jk_id'],
			['jk.jk_id','jk.bl_id','jk.fl_id','jk.rm_id','jk.em_id'],
			restriction);
}

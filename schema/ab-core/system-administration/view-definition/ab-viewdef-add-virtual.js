View.createController('addVirtual', {
	
	table_name: '',
	field_name: '',
	data_type: '',
	ml_heading: '',	
	ml_heading_english: '',
	generic: '',	
	oracle: '',	
	sqlServer: '',
	sybase: '',
	virtual_field_object: null,
	rowIndex: -1,

	afterViewLoad: function() {
		 // this.insertDummyValues();
		// this.abViewdefAddVirtual_detailsPanel.setFieldLabel('sql',  this.abViewdefAddVirtual_detailsPanel.getFieldLabelElement('sql').innerHTML.replace(/\{0\}/gi, '<br/>'));
	}, 
			
	abViewdefAddVirtual_detailsPanel_onAdd: function() {
		if(this.validInputs()){
			this.virtual_field_object = this.createFieldObject();
			var openerController = View.getOpenerView().controllers.get('vdw_characteristics');
			openerController.addVirtualField(this.virtual_field_object);
			View.closeThisDialog();
		}
	},

	abViewdefAddVirtual_detailsPanel_onSaveChanges: function() {
		if(this.validInputs()){
			this.virtual_field_object = this.createFieldObject();
			var openerController = View.getOpenerView().controllers.get('vdw_characteristics');
			openerController.replaceVirtualField(this.virtual_field_object, this.rowIndex);
			View.closeThisDialog();
		}
	},
	
	insertDummyValues: function() {
		$('table_name').value = 'bl';
		$('field_name').value = 'gross_area_diff';
		$('data_type').value = 'number';
		$('ml_heading').value = 'Difference in Gross Area';	
		$('generic_memo').value = 'bl.area_gross_ext - bl.area_gross_int';	
		$('oracle_memo').value = 'bl.area_gross_ext - bl.area_gross_int';	
		$('sqlServer_memo').value = 'bl.area_gross_ext - bl.area_gross_int';	
		$('sybase_memo').value = 'bl.area_gross_ext - bl.area_gross_int';
	},
		
	validInputs: function() {
		this.table_name = $('table_name').value;
		this.field_name = $('field_name').value;
		this.data_type = $('data_type').value;
		this.ml_heading = $('ml_heading').value;	
		this.ml_heading_english = $('ml_heading').value;
		this.generic = $('generic_memo').value;	
		this.oracle = $('oracle_memo').value;	
		this.sqlServer = $('sqlServer_memo').value;	
		this.sybase = $('sybase_memo').value;
		this.afm_type = 'Virtual Field';

		if(this.table_name == '' || this.field_name == '' || this.data_type == '' || this.ml_heading == '' || (this.generic == '' && this.oracle == '' && this.sqlServer == '' && this.sybase == '')){
			alert(getMessage('incomplete_form'));
			return false;
		}	
		return true;
	},

	createFieldObject: function() {
		var field = new Object();
		field['afm_flds.table_name'] = this.table_name;
		field['afm_flds.field_name'] = this.field_name;
		field['afm_flds.data_type'] = this.data_type;
		field['afm_flds.ml_heading'] = this.ml_heading;
		field['afm_flds.ml_heading_english'] = this.ml_heading_english;
		field['is_virtual'] = true;
		field['afm_flds.afm_type'] = 'Virtual Field';
		field['afm_flds.primary_key'] = '0';	
		var sql = new Object();
		sql.generic = this.generic;
		sql.oracle = this.oracle;
		sql.sybase = this.sybase;
		sql.sqlServer = this.sqlServer;
		field['sql'] = toJSON(sql);
		return field;
	},
	
	hideButton: function(name){
		Ext.get(name).setStyle('display', 'none');
	},
	
	showButton: function(name){
		Ext.get(name).setStyle('display', '');
	},

	fillFormWithVFData: function(vf){
		if(vf['afm_flds.table_name']){
			$('table_name').value = vf['afm_flds.table_name'];
			$('field_name').value = vf['afm_flds.field_name'];
			$('data_type').value = vf['afm_flds.data_type'];
			$('ml_heading').value = vf['afm_flds.ml_heading'];
		} else {
			$('table_name').value = vf['table_name'];
			$('field_name').value = vf['field_name'];
			$('data_type').value = vf['data_type'];
			$('ml_heading').value = vf['ml_heading'];
		}

		var sql = vf.sql;
		if(typeof(sql) == 'string'){
			var sql = eval('(' + vf.sql + ')');
		}	
		$('generic_memo').value = sql['generic'];	
		$('oracle_memo').value = sql['oracle'];	
		$('sqlServer_memo').value = sql['sqlServer'];	
		$('sybase_memo').value = sql['sybase'];			
	},
	
	fillFormWithTableName: function(table_name){
		this.table_name = table_name;
		$('table_name').value = table_name;
	}
});

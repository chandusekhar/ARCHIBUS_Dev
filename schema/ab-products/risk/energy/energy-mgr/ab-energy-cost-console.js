var abEnergyCostConsole = View.createController('abEnergyCostConsole', {
	
	restriction : "1=1",
	vnRestriction : "1=1",
	consoleBillUnits : "MMBTU",
	
	energyConsole_onSelectSingleType:function(){
		View.selectValue({
			 formId: 'energyConsole',
			 title: '',
			 fieldNames: ['bill_archive.bill_type_id'],
			 selectTableName: 'bill_unit',
			 selectFieldNames: ['bill_unit.bill_type_id'],
			 visibleFieldNames: ['bill_unit.bill_type_id'],
			 restriction:"bill_unit.rollup_type != 'None' AND exists (select 1 from bill_archive where bill_archive.bill_type_id = bill_unit.bill_type_id) AND "+this.restriction,
			 actionListener: 'onChangeBillType',
			 width: 1000,
			 height: 500
			});
	},

	energyConsole_onSelectVendor:function(){
		View.selectValue({
			 formId: 'energyConsole',
			 title: '',
			 fieldNames: ['bill_archive.vn_id'],
			 selectTableName: 'bill_archive',
			 selectFieldNames: ['bill_archive.vn_id'],
			 visibleFieldNames: ['bill_archive.vn_id'],
			 restriction: this.vnRestriction,
			 width: 1000,
			 height: 500
			});
	},
	
	energyConsole_onShow: function() {
		this.consoleBillUnits = $('select_bill_units').value;
	}
	
});

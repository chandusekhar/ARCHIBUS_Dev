var commEqDetailsWarController = View.createController('commEqDetailsWar', {
	
	commEqDetailsWar_war_afterRefresh: function() {
		this.commEqDetailsWar_ins.refresh(this.commEqDetailsWar_war.restriction);
		this.commEqDetailsWar_serv.refresh(this.commEqDetailsWar_war.restriction);
	},
	
	commEqDetailsWar_war_onEditWar: function() {
		var warranty_id = this.commEqDetailsWar_war.getFieldValue('eq.warranty_id');
		if (warranty_id == "") {
			this.commEqDetailsWar_warEdit.refresh(null, true);
			this.commEqDetailsWar_warEdit.showInWindow({
				newRecord:true
			});
		}
		else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('warranty.warranty_id', warranty_id);
			this.commEqDetailsWar_warEdit.refresh(restriction);
			this.commEqDetailsWar_warEdit.showInWindow({
			});
		}
	},

	commEqDetailsWar_ins_onEditIns: function() {
		var policy_id = this.commEqDetailsWar_ins.getFieldValue('eq.policy_id');
		if (policy_id == "") {
			this.commEqDetailsWar_insEdit.refresh(null, true);
			this.commEqDetailsWar_insEdit.showInWindow({
				newRecord:true
			});
		}
		else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('policy.policy_id', policy_id);
			this.commEqDetailsWar_insEdit.refresh(restriction);
			this.commEqDetailsWar_insEdit.showInWindow({
			});	
		}
	},
	
	commEqDetailsWar_serv_onEditServ: function() {
		var servcont_id = this.commEqDetailsWar_serv.getFieldValue('eq.servcont_id');
		if (servcont_id == "") {
			this.commEqDetailsWar_servEdit.refresh(null, true);
			this.commEqDetailsWar_servEdit.showInWindow({
				newRecord:true
			});
		}
		else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('servcont.servcont_id', servcont_id);
			this.commEqDetailsWar_servEdit.refresh(restriction);
			this.commEqDetailsWar_servEdit.showInWindow({
			});	
		}
	},
	
	commEqDetailsWar_warEdit_onSave: function() {
		this.commEqDetailsWar_warEdit.save();
		var warranty_id = this.commEqDetailsWar_warEdit.getFieldValue('warranty.warranty_id');
		var record = this.commEqDetailsWar_ds0.getRecord(this.commEqDetailsWar_war.restriction);
		record.setValue('eq.warranty_id', warranty_id);
		this.commEqDetailsWar_ds0.saveRecord(record);
		this.commEqDetailsWar_war.refresh();
		View.getOpenerView().panels.get('commEqDetailsForm').refresh();
	},
	
	commEqDetailsWar_insEdit_onSave: function() {
		this.commEqDetailsWar_insEdit.save();
		var policy_id = this.commEqDetailsWar_insEdit.getFieldValue('policy.policy_id');
		var record = this.commEqDetailsWar_ds0.getRecord(this.commEqDetailsWar_war.restriction);
		record.setValue('eq.policy_id', policy_id);
		this.commEqDetailsWar_ds0.saveRecord(record);
		this.commEqDetailsWar_ins.refresh();	
		View.getOpenerView().panels.get('commEqDetailsForm').refresh();
	},
	
	commEqDetailsWar_servEdit_onSave: function() {
		this.commEqDetailsWar_servEdit.save();
		var servcont_id = this.commEqDetailsWar_servEdit.getFieldValue('servcont.servcont_id');
		var record = this.commEqDetailsWar_ds0.getRecord(this.commEqDetailsWar_war.restriction);
		record.setValue('eq.servcont_id', servcont_id);
		this.commEqDetailsWar_ds0.saveRecord(record);
		this.commEqDetailsWar_serv.refresh();	
		View.getOpenerView().panels.get('commEqDetailsForm').refresh();
	}
});

function commEqDetailsWar_warEdit_onSelectExisting(fieldName, newValue, oldValue) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('warranty.warranty_id', newValue);
	View.panels.get('commEqDetailsWar_warEdit').refresh(restriction, false);
}

function commEqDetailsWar_insEdit_onSelectExisting(fieldName, newValue, oldValue) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('policy.policy_id', newValue);
	View.panels.get('commEqDetailsWar_insEdit').refresh(restriction, false);
}

function commEqDetailsWar_servEdit_onSelectExisting(fieldName, newValue, oldValue) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('servcont.servcont_id', newValue);
	View.panels.get('commEqDetailsWar_servEdit').refresh(restriction, false);
}


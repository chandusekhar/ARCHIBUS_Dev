var abFltMgmtHistROView_controller = View.createController('abFltMgmtHistROView_controller', {

	panel_ro_afterRefresh: function() {
		var fo_id = this.panel_ro.getFieldValue("flt_order.fo_id");

		this.panel_rocf.show(true);
		this.panel_rocf.refresh("flt_hrocf.fo_id='"+fo_id+"'");
		if(this.panel_rocf.rows.length == 0) {
			this.panel_rocf.show(false);
		}

		this.panel_ropt.show(true);
		this.panel_ropt.refresh("flt_hropt.fo_id='"+fo_id+"'");
		if(this.panel_ropt.rows.length == 0) {
			this.panel_ropt.show(false);
		}

		this.panel_pmtask.show(true);
		this.panel_pmtask.refresh("flt_hpmtask.fo_id='"+fo_id+"'");
		if(this.panel_pmtask.rows.length == 0) {
			this.panel_pmtask.show(false);
		}

		this.panel_rotask.show(true);
		this.panel_rotask.refresh("flt_hrotask.fo_id='"+fo_id+"'");
		if(this.panel_rotask.rows.length == 0) {
			this.panel_rotask.show(false);
		}
	}
});

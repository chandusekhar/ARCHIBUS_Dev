var abRepmLsadminFiscalYearDefController = View.createController('abRepmLsadminFiscalYearDefCtrl', {
	afterInitialDataFetch: function(){
		this.refreshDaySelect();
	},
	abRepmLsadminFiscalYearDef_panel_beforeSave: function(){
		var daySelect = document.getElementById("abRepmLsadminFiscalYearDef_fiscalyear_startday");
		if (daySelect != undefined) {
			this.abRepmLsadminFiscalYearDef_panel.setFieldValue("afm_scmpref.fiscalyear_startday", daySelect.options[daySelect.selectedIndex].value);
		}
	},
	abRepmLsadminFiscalYearDef_panel_afterRefresh: function(){
		this.refreshDaySelect();
	},
	refreshDaySelect: function(){
		var daySelect = document.getElementById("abRepmLsadminFiscalYearDef_fiscalyear_startday");
		if(daySelect != undefined){
			dayValue = this.abRepmLsadminFiscalYearDef_panel.getFieldValue("afm_scmpref.fiscalyear_startday");
			daySelect.selectedIndex = dayValue-1;
		}
	}
})

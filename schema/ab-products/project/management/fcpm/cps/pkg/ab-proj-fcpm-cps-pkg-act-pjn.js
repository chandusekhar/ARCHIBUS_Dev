var projFcpmCpsPkgActPjnController = View.createController('projFcpmCpsPkgActPjn', {
	
	projFcpmCpsPkgActPjn_afterRefresh: function() {
		if (this.projFcpmCpsPkgActPjn.newRecord) {
			$('projFcpmCpsPkgActPjn_monthField').value = 1;
			$('projFcpmCpsPkgActPjn_yearField').value = '';
			$('projFcpmCpsPkgActPjn_monthField').disabled=false;
			$('projFcpmCpsPkgActPjn_yearField').disabled=false;
		}
		else {
			var date = this.projFcpmCpsPkgActPjn.getFieldValue('proj_forecast_item.date_forecast');
			if (date != '') {
				var year = Number(date.substring(0, 4));
				var mo = Number(date.substring(5, 7));
				$('projFcpmCpsPkgActPjn_monthField').value = mo;
				$('projFcpmCpsPkgActPjn_yearField').value = year;
				$('projFcpmCpsPkgActPjn_monthField').disabled=true;
				$('projFcpmCpsPkgActPjn_yearField').disabled=true;
			}
		}
	},

	
	projFcpmCpsPkgActPjn_onSave: function() {
		if (this.projFcpmCpsPkgActPjn.newRecord) {			
			var year = $('projFcpmCpsPkgActPjn_yearField').value;
			var size = year.length;
			if (size != 4) {
				View.showMessage(getMessage('invalidYear'));
				return;
			}
			if (isNaN(year) || year % 1 !== 0) {
				View.showMessage(getMessage('invalidYear'));
		    	return
		    }
			var month = Number($('projFcpmCpsPkgActPjn_monthField').value);
			var date = new Date(year, month-1, 1);
			var date_forecast =  FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
			var restriction = new Ab.view.Restriction();
			restriction.addClause('proj_forecast_item.project_id', this.projFcpmCpsPkgActPjn.getFieldValue('proj_forecast_item.project_id'));
			restriction.addClause('proj_forecast_item.work_pkg_id', this.projFcpmCpsPkgActPjn.getFieldValue('proj_forecast_item.work_pkg_id'));
			restriction.addClause('proj_forecast_item.date_forecast', date_forecast);
			var records = this.projFcpmCpsPkgActPjnDs0.getRecords(restriction);
			if (records.length > 0) {
				View.showMessage(getMessage('yearMonthRecordExists'));
				return;
			}
			this.projFcpmCpsPkgActPjn.setFieldValue('proj_forecast_item.date_forecast', date_forecast);
		}
		this.projFcpmCpsPkgActPjn.save();
		View.getOpenerView().panels.get("projFcpmCpsPkgActPjnGrid").refresh();
		View.closeThisDialog();
	}
});

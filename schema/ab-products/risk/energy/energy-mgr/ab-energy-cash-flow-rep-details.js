var cashFlowDetailsCtrl = View.createController('cashFlowCtrlDetails', {
	projectionType:null,
	IDs:'',
	isRecurring:null,
	isSchedule:null,
	isActual:null,
	restriction: null,
	restriction_recur:null,
	restriction_sched:null,
	restriction_actual:null,
	ID:null,
	dateStart:null,
	dateEnd:null,
	
	setCashFlowParameters:function(result, projectionType, isRecurring, isSchedule, isActual, event, restriction, calculationPeriod){
		var restrictionValue_projectionType = '';
		var restrictionValue_selectedDate = '';
		var date_restriction_recur = '';
		var date_restriction = '';
		
		for (var i = 0; i < event.restriction.clauses.length; i++)
			{
			if(event.restriction.clauses[i].name == 'cost_tran_recur.ls_id')
				{
				restrictionValue_projectionType = event.restriction.clauses[i].value;
				var index = restrictionValue_projectionType.indexOf('|');
				restrictionValue_projectionType = restrictionValue_projectionType.substring(0,index);
				}
			if(event.restriction.clauses[i].name == 'cost_tran_recur.year')
				{
				restrictionValue_selectedDate = event.restriction.clauses[i].value;
				}
			}
		this.projectionType = projectionType;
		this.isRecurring = isRecurring;
		this.isSchedule = isSchedule;
		this.isActual = isActual;
		if (restrictionValue_projectionType != ''){
			this.restriction = (this.projectionType == 'property'?'pr':this.projectionType) +'_id'+'='+"'"+restrictionValue_projectionType+"' ";
		}else{ 
		this.restriction = " 1=1 ";
		}
		this.ID = restrictionValue_projectionType;
		this.restriction += "AND "+restriction;
		if (restrictionValue_selectedDate != ''){
			this.dateStart = restrictionValue_selectedDate;
			this.dateEnd = calculateDateEnd(calculationPeriod,restrictionValue_selectedDate);
			date_restriction_recur = " AND (";
			date_restriction = " AND (";
			if(this.isRecurring) {
				date_restriction_recur += " cost_tran_recur.date_end &gt;=${sql.date('"+this.dateStart+"')}";
			}
			if(this.isSchedule || this.isActual) {
				// looking for costs (paid in the selected period) OR (due in the period but not paid yet) 
				date_restriction += " ( (cost_tran_recur.date_paid IS NOT NULL"
										+ " AND cost_tran_recur.date_paid &gt;=${sql.date('"+this.dateStart+"')}"
										+ " AND cost_tran_recur.date_paid &lt;=${sql.date('"+this.dateEnd+"')}"
										+ ")"
									+ " OR "
									+ " (cost_tran_recur.date_paid IS NULL"
										+ " AND cost_tran_recur.date_due &gt;=${sql.date('"+this.dateStart+"')}"
										+ " AND cost_tran_recur.date_due &lt;=${sql.date('"+this.dateEnd+"')}"
										+ ") ) ";
			}
			date_restriction_recur += " AND cost_tran_recur.date_start &lt;=${sql.date('"+this.dateEnd+"')} ) ";
			date_restriction += " AND cost_tran_recur.date_start &lt;=${sql.date('"+this.dateEnd+"')} ) ";
		}
		if (this.isRecurring){
			this.restriction_recur = this.restriction+date_restriction_recur;
		}
		if (this.isSchedule){
			this.restriction_sched = this.restriction+date_restriction;
			this.restriction_sched = this.restriction_sched.replace(/cost_tran_recur/g,"cost_tran_sched");
			this.restriction_sched = this.restriction_sched.replace(/date_end/g,"date_due");
			this.restriction_sched = this.restriction_sched.replace(/date_start/g,"date_trans_created");
		}
		if (this.isActual){
			this.restriction_actual = this.restriction+date_restriction;
			this.restriction_actual = this.restriction_actual.replace(/cost_tran_recur/g,"cost_tran");
			this.restriction_actual = this.restriction_actual.replace(/date_start/g,"date_trans_created");
			this.restriction_actual = this.restriction_actual.replace(/date_end/g,"date_due");
		}

		this.showData();
	},
	showData:function(){
		View.controllers.get('cashFlowCtrlDetails').costTranRecurDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').costTranSchedDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').costTranActualDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').lsDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').blDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').prDetailsPanel.show(false);
		View.controllers.get('cashFlowCtrlDetails').acDetailsPanel.show(false);
		
		if (this.ID != ''){
		
		switch(this.projectionType){
			case 'ls':	
						View.controllers.get('cashFlowCtrlDetails').lsDetailsPanel.refresh('ls_id = '+"'"+this.ID+"'");
						break;
			case 'bl':
						View.controllers.get('cashFlowCtrlDetails').blDetailsPanel.refresh('bl_id = '+"'"+this.ID+"'");
						break;
			case 'pr':
						View.controllers.get('cashFlowCtrlDetails').prDetailsPanel.refresh('pr_id = '+"'"+this.ID+"'");
						break;
			case 'ac':
						View.controllers.get('cashFlowCtrlDetails').acDetailsPanel.refresh('ac_id = '+"'"+this.ID+"'");
						break;
		}
		}
		
		if (this.isRecurring){
						View.controllers.get('cashFlowCtrlDetails').costTranRecurDetailsPanel.refresh(this.restriction_recur);
		}
		if (this.isSchedule){
						View.controllers.get('cashFlowCtrlDetails').costTranSchedDetailsPanel.refresh(this.restriction_sched);
		}
		if (this.isActual){
						View.controllers.get('cashFlowCtrlDetails').costTranActualDetailsPanel.refresh(this.restriction_actual);
		}
	}
});

function calculateDateEnd(calculationPeriod,startDate) {
		// will calculate the last day of the interval selected to drill down
		var year = parseInt(startDate.substring(0,startDate.indexOf('-')));
		var monthStr = startDate.substring(5,7);
		var month = parseInt(monthStr);
		if (month == 0){
			month = parseInt(monthStr.replace('0',''));
		}
		var m = [31,28,31,30,31,30,31,31,30,31,30,31];
        switch(calculationPeriod)
		{
  			case 'MONTH': 
  				if (month != 2) return year+'-'+monthStr+'-'+m[month - 1];
				if (year%4 != 0) return year+'-'+monthStr+'-'+m[1];
				if (year%100 == 0 && year%400 != 0) return year+'-'+monthStr+'-'+m[1];
  				break;
  			case 'QUARTER': 
  				month = month + 2;
  				if (month <= 9){monthStr = '0'+month;}else monthStr = month;
  				if (month != 2) return year+'-'+monthStr+'-'+m[month - 1];
				if (year%4 != 0) return year+'-'+monthStr+'-'+m[1];
				if (year%100 == 0 && year%400 != 0) return year+'-'+monthStr+'-'+m[1];
  				break;
  			case 'YEAR': 
  				return year+'-12-31';;
  				break;
  		}
}

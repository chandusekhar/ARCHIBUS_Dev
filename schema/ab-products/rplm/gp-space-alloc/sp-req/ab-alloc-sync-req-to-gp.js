var abAllocSpReqSyncCtrl = View.createController('abAllocSpReqSyncCtrl', {
	
	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callback = View.parameters.callback;
			this.scenarioId = View.parameters.scenarioId;
			this.scenarioName = View.parameters.scenarioName;
			this.unitTitle = View.parameters.unitTitle;
		}
	},

	afterInitialDataFetch: function(){
		if (this.scenarioId)	{
			var records = this.abAllocSyncSpReqGp_ds.getRecords("gp.portfolio_scenario_id='"+this.scenarioId+"'");
			if (records && records.length>0) {
				var maxIndex=0;
				for (var i=0; i<records.length; i++){
					 if (records[maxIndex].getValue('gp.countOfSbItems') < records[i].getValue('gp.countOfSbItems'))	{
						maxIndex=i;
					 }
				}
				var dateStart =records[maxIndex].getValue('gp.date_start');
				var day = dateStart.getDate();
				var month = dateStart.getMonth() + 1;
				var year = dateStart.getFullYear();
				var ISODate = year + "-" + month + "-" + day;
				this.abAllocSyncSpReq_form.setFieldValue('gp.date_start', ISODate);
				this.abAllocSyncSpReq_form.setFieldValue('gp.event_name', records[maxIndex].getValue('gp.event_name'));
				this.abAllocSyncSpReq_form.enableField('gp.event_name', false);
				this.abAllocSyncSpReq_form.enableField('gp.date_start', false);
			}
		}
	},

	abAllocSyncSpReq_form_onSync: function(){
		this.abAllocSyncSpReqSbItemsSearchDs.addParameter("sbName", this.scenarioName);
		var sbItems = this.abAllocSyncSpReqSbItemsSearchDs.getRecords();
		if ( sbItems && sbItems.length>0 ) {
			var messageStr="<br/>";
			for ( var i=0; i<sbItems.length; i++) {
				messageStr += "<br/>";
				messageStr += ( sbItems[i].getValue("sb_items.auto_number") +": "+sbItems[i].getValue("sb_items.org") );
			}
			messageStr = messageStr+	'<br/><br/>';
			var me = this;
			View.alert(getMessage("alert1")+": "+messageStr+getMessage("alert2"), function(button) {
				if(valueExists(me.callback)){
					me.callback(null);
				}
				View.closeThisDialog();
				return true;
			});
			return;
		} 

		var eventName = this.abAllocSyncSpReq_form.getFieldValue('gp.event_name');	
		var dateStart = this.abAllocSyncSpReq_form.getFieldValue('gp.date_start');	
		
		if (!eventName || !dateStart){
			View.alert(getMessage("emptyValue"));
			return;
		}

		try{
				var result = Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-syncSpaceRequirements', this.scenarioName, this.scenarioId , eventName, dateStart, this.unitTitle);
				if(result.code == 'executed'){
					if(valueExists(this.callback)){
						this.callback(dateStart);
					}
					View.closeThisDialog();
					return true;
				}
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
});


var helpDeskRequestAcceptController = View.createController("helpDeskRequestAcceptController",{
	

	afterInitialDataFetch: function() {
		this.inherit();
	},
	
	afterViewLoad: function(){
		this.initialStepByCode();
	},
	
	initialStepByCode: function(){
		var tabs = View.panels.get("helpDeskAcceptTabs");
		if(tabs != null){
			var code = window.location.parameters["code"];
			if(valueExists(code)){
				this.getStepByCode(code);
			}
		} 
	},
	
	getStepByCode: function(code){
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepForCode', code);
		}catch(e){
			Workflow.handleError(e);
		}

		if(result.code == 'executed'){
			var tabs = View.panels.get("helpDeskAcceptTabs");

			if(tabs != null){
				res = eval('('+result.jsonExpression+')');
				if(res.accepted){
					alert(getMessage("accepted"));
				} else {
					restriction = "<restrictions>";
					restriction +="	<restriction type='parsed'>";
					restriction +="		<clause relop='AND' op='=' value='"+res.pkey_value+"'>"
					restriction +="			<field name='"+res.field_name+"' table='"+res.table_name+"'/>"
					restriction +="		</clause>"	
					restriction +="	</restriction>"
					restriction +="	<restriction type='parsed'>";
					restriction +="		<clause relop='AND' op='=' value='"+res.pkey_value+"'>"
					restriction +="			<field name='"+res.field_name+"' table='activity_log_step_waiting'/>"
					restriction +="		</clause>"	
					restriction +="		<clause relop='AND' op='=' value='"+res.em_id+"'>"
					restriction +="			<field name='em_id' table='activity_log_step_waiting'/>"
					restriction +="		</clause>"	
					restriction +="		<clause relop='AND' op='=' value='"+res.step+"'>"
					restriction +="			<field name='step' table='activity_log_step_waiting'/>"
					restriction +="		</clause>"	
					restriction +="		<clause relop='AND' op='=' value='acceptance'>"
					restriction +="			<field name='step_type' table='activity_log_step_waiting'/>"
					restriction +="		</clause>"
					restriction +="	</restriction>"
					restriction +="</restrictions>"
					
					var rest = new Ab.view.Restriction();
					rest.addClause(res.table_name+"."+res.field_name,res.pkey_value,"=");
					rest.addClause("activity_log_step_waiting.step_code",code,"=");
					tabs.selectTab("review",rest);
				}
			}
		} else {
			Workflow.handleError(result);
		}
	}
});	
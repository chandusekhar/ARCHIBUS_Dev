var connectorScehduleController = View.createController('connectorScehduleController', {
	
	activity_id:null,
	rule_id:null,
	interval: 0,
	cron: "",
	startTime: "12:00:00",
	startDate: "01-01-2005",
	useCronExpression: false,
	
	afterViewLoad: function(){
		var controller = View.getView('parent').controllers.get('connectorTabsController');
    
		this.connector_id = controller.connector_id;
		this.activity_id = controller.activity_id;
	},

	afterRefresh : function() {
		this.reloadScheduleDetails();
		
		var controller = View.getView('parent').controllers.get('connectorTabsController');
		
		this.connector_id = controller.connector_id;
		this.activity_id = controller.activity_id; 

	},
	
	afterInitialDataFetch : function() {
		this.reloadScheduleDetails();
		
		if($('start_date').value==null || $('start_date').value==""){
        	$('start_date').value = this.getCurrentDate();
        }
		if($('time_of_day').value==null || $('time_of_day').value==""){
        	$('time_of_day').value ="12:00:00";
        }
        
			 	
	},

	connectorScehdulePanel_onSetSchedule : function(){
		//this.activity_id = this.connectorScehdulePanel.getFieldValue('afm_wf_rules.activity_id');
        //this.rule_id = this.connectorScehdulePanel.getFieldValue('afm_wf_rules.rule_id');
		var controller = View.getView('parent').controllers.get('connectorTabsController');
		
        this.interval = $('interval_seconds').value;
        this.cron = $('cron_expression').value;
        if($('start_date').value==null || $('start_date').value==""){
        	$('start_date').value =this.getCurrentDate()
        }
        this.startDate = $('start_date').value;
        
        if($('time_of_day').value==null || $('time_of_day').value==""){
        	$('time_of_day').value ="12:00:00";
        }
        
        this.startTime = $('time_of_day').value;
        var intValue = this.interval;
        if(this.useCronExpression){
        	intValue = this.cron;
        }
		try {
			 var result = Workflow.callMethod(
			            'AbSystemAdministration-ConnectorService-setScheduledConnectorRule', this.activity_id, this.rule_id, 
			            		controller.connector_id, intValue, this.startDate, this.startTime, this.useCronExpression);
			 if(result.message!="Success"){
					View.alert(getMessage('connector_define_sched_invalid_cron'));
				 return;
			 }
	    } catch (e) {
	        Workflow.handleError(e);
	    }
		View.alert(getMessage('connector_define_sched_set'));
	},
    
	connectorScehdulePanel_onClearSchedule : function(){
		var dataSource = View.dataSources.get("ds_wf_rules");
		var record = this.connectorScehdulePanel.getRecord();
		
		try {
			dataSource.deleteRecord(record);
		} catch (e) {
	        //Workflow.handleError(e);
	    }	
		
		
		this.interval = "";
		this.cron = "";
	    this.startDate = "";
	    this.startTime = "";
	    
	    $('interval_seconds').value = this.interval;
	    $('cron_expression').value = this.cron;
        $('start_date').value = this.startDate;
        $('time_of_day').value = this.startTime;
		View.alert(getMessage('connector_define_sched_cleared'));
		
    }, 
    
    reloadScheduleDetails : function(){
    	try {

			var controller = View.getView('parent').controllers.get('connectorTabsController');
		    
		    this.connector_id = controller.connector_id;
		    this.activity_id = controller.activity_id;
		    this.rule_id = "scheduledConnector_" + this.connector_id;
			
	        var result = Workflow.callMethod(
	            'AbSystemAdministration-ConnectorService-loadScheduledConnectorRule', this.activity_id, this.rule_id);
	        var schedule = eval ('(' + result.jsonExpression + ')');
	        
	        if(schedule.response == "true"){
	        	this.connectorScehdulePanel.setFieldValue("afm_wf_rules.activity_id", this.activity_id);
	        	this.connectorScehdulePanel.setFieldValue("afm_wf_rules.rule_id", this.rule_id);
	        	this.interval = "";
	        	this.cron = "";
	    	    this.startDate = "";
	    	    this.startTime = "";	    	   
	        	$('activity_id').innerHTML = this.activity_id;
	        	$('rule_id').innerHTML = this.rule_id;    	    
	    	    $('interval_seconds').value = this.interval;
	    	    $('cron_expression').value = this.cron;
	            $('start_date').value = this.startDate;
	            $('time_of_day').value = this.startTime;
	            $('use_cron').checked=false;
	        }else{
		        this.interval = schedule.interval;
		        this.cron = schedule.cron;
		        this.startDate = schedule.startDate;
		        this.startTime = schedule.startTime;

		        $('cron_expression').value = this.cron;
		        $('interval_seconds').value = this.interval;
		        
		        if(this.interval.length > 0 ){		
		        	var intRadio = document.getElementsByName("interval");
		    		for(i = 0; i<intRadio.length; i++){
		    			if(intRadio[i].value==this.interval){
		    				intRadio[i].checked = true;
		    			}
		    		}		    		
		        	$('cron_expression').disabled = true;   	
		        	$('interval_seconds').disabled = false;
		        }else{		        	
		        	$('cron_expression').disabled = false;
		        	$('interval_seconds').disabled = true;
		        }
		        if(this.cron.length > 0){
	    			$('use_cron').checked=true;
	    			this.useCronExpression=true;
	    		}else{
	    			$('use_cron').checked=false;
	    		}
	    		
		        $('start_date').value = this.startDate;
		        $('time_of_day').value = this.startTime;
		       
		        this.connectorScehdulePanel.setFieldValue("afm_wf_rules.activity_id", this.activity_id);
	        	this.connectorScehdulePanel.setFieldValue("afm_wf_rules.rule_id", this.rule_id);
	        	$('activity_id').innerHTML = this.activity_id;
	        	$('rule_id').innerHTML = this.rule_id;
	        }
	    } catch (e) {
	        Workflow.handleError(e);
	    }
    	
    	
    },
    
    setSeconds : function(value){
    	this.interval = value;
    	$('interval_seconds').value = this.interval;
    	$('cron_expression').disabled = true;   	
    	$('interval_seconds').disabled = false;
    	this.useCronExpression = false;
    	$('use_cron').checked=false;
    },
    
    setCronExpression: function(){
    	var chkCron = $('use_cron');
    	if(chkCron.checked){
    		$('cron_expression').disabled = false;
    		$('interval_seconds').disabled = true;
    		this.useCronExpression = true;
    		 $('start_date').value = "";
    		 var interval = document.getElementsByName("interval");
     		for(i = 0; i<interval.length; i++){
     			interval[i].checked=false;
     		}
     		
    		
    	}else{
    		$('cron_expression').disabled = true;   	
        	$('interval_seconds').disabled = false;
        	this.useCronExpression = false;
        	
    	}
    },
		

    getCurrentDate : function(){
        var curDate = new Date();
        var month = curDate.getMonth() + 1;
        var day = curDate.getDate();
        var year = curDate.getFullYear();
        return  ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day + "-" +year ;
    }

	
});


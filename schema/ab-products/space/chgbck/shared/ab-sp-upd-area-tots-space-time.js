/**
 * Update Area Totals Space Time Controller
 *
 * Author: 	Keven xi
 * Date:	2009-04
 *
 */
var controller = View.createController('updAreaTotsSpaceTimeController', {

    progressReport: null,
    
    resultsReport: null,
    
    result: null,
    
    autoRefreshInterval: 5,
    reportTask: null,
    reportTaskRunner: null,
    
    ruleId: 'AbCommonResources-SpaceService-updateAreaTotalsSpaceTime',
    
	//two activity parameter records of Application "AbSpaceRoomInventoryBAR" for Update Area Totals 
    dateStartParam: null,
    dateEndParam: null,
    /**
     * After view loads set up the top panel's localized labels and profile values
     * Set up the listener -- and localize the values -- for the locale select control in the form
     */
    afterViewLoad: function(){
        this.reportProgressPanel.sortEnabled = false;
    },
    afterInitialDataFetch : function() {
		this.dateStartParam = this.loadDefaultDateParameterValue('rmpct.date_start', 'AreaTotalsStartDate');
		this.dateEndParam = this.loadDefaultDateParameterValue('rmpct.date_end', 'AreaTotalsEndDate');
    },

    /**
     * Set initial value to date field by given field id and parameter id, and return parameter record if exists.
     */
	loadDefaultDateParameterValue:function(fieldId, paramId){

		var date = getCurrentDate();
		this.dateParameterPanel.setFieldValue(fieldId, date);

		var dateParam = this.abAfmActivityParamsDS.getRecord("param_id='"+paramId+"'");
		return dateParam;
	},
    
    /**
     * Store value to date field by given field id and parameter id, and return parameter record if exists.
     */
	storeDefaultDateParameterValue:function(value, paramRecord){
		if(value){
			paramRecord.setValue("afm_activity_params.param_value", value);
		}  else{
			paramRecord.setValue("afm_activity_params.param_value", getCurrentDate());			
		}
		this.abAfmActivityParamsDS.saveRecord(paramRecord);
	},

	startTaskJob: function(dateFrom, dateTo){

    	var jobId = Workflow.startJob(this.ruleId, dateFrom, dateTo);
        
        this.result = Workflow.getJobStatus(jobId);
        
        this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "6");
        
        var controller = this;
        this.startReportTask(controller);
        
    },
    
    // start auto-refresh background task using Ext.util.TaskRunner
    startReportTask: function(controller){
        this.reportTask = {
            run: function(){
            
                if (typeof controller.result != 'undefined') {
                    controller.result = Workflow.getJobStatus(controller.result.jobId);
                    controller.progressReport.refresh(controller.result);
                    
                    // if job completed, stop the task
                    var jobPercentComplete = parseInt(controller.result.jobPercentComplete) / 100;
                    if (jobPercentComplete == 1) {
                        // stop the task runner
                        controller.reportTaskRunner.stop(controller.reportTask);
                    }
                }
            },
            interval: 1000 * controller.autoRefreshInterval
        }
        this.reportTaskRunner = new Ext.util.TaskRunner();
        this.reportTaskRunner.start(this.reportTask);
    }
});


function onProgressButtonClick(e){
	var parameterPanel = View.panels.get("dateParameterPanel");
	var dateStart = parameterPanel.getFieldValue("rmpct.date_start");
	var dateEnd = parameterPanel.getFieldValue("rmpct.date_end");
	
	//add for 20.1 space transaction
	var rmpctCount = View.dataSources.get('ds_ab-sp-upd-area-tots-space-time_rmpctCount').getRecord();
	if (rmpctCount.getValue('rmpct.rmpct_count') > 1) {
		if (!(dateStart && dateEnd)) {
			View.showMessage(getMessage("enterDateValue"));
			return;
		}
		// kb3022805
		if (compareLocalizedDates(parameterPanel.getFieldElement('rmpct.date_end').value, parameterPanel.getFieldElement('rmpct.date_start').value)) {
			View.showMessage(getMessage('errorDateStartEnd'));
			return;
		}
	}else{
		dateStart = '';
		dateEnd = '';
	}
	
	var ds=View.dataSources.get('abAfmActivityParamsDS');
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_activity_params.param_id", 'ArchiveDaysAfterEndDate', "=", true);
	var record=ds.getRecord(restriction);
	var paramValue=record.getValue('afm_activity_params.param_value');
	if("NULL"!=paramValue&&(""!=dateStart && ""!=dateEnd)){
		if(!compareDate(paramValue,dateStart,dateEnd)){
			var message1=getMessage("dateError1");
			var message3=getMessage("dateError3");
			var message2="<span style='background-color:#F04000'>"+getMessage("dateError2")+"</span>"
			var message=message1+" "+message2+" "+message3;
			View.showMessage(message);
			return;
		}
	}
    var controller = View.controllers.get('updAreaTotsSpaceTimeController');
    
    var progressButton = document.getElementById(e.grid.getParentElementId() + "_row0_progressButton");
    
    // if job is running, we can only stop it
    if (typeof(controller.reportTask) != 'undefined' && controller.reportTask != null) {
    
        var jobPercentComplete = parseInt(controller.result.jobPercentComplete) / 100;
        
        // if the job has not yet complete, then user want to stop the job
        if (jobPercentComplete < 1) {
            var result = Workflow.stopJob(controller.result.jobId);
        }
        
        // stop the task runner
        controller.reportTaskRunner.stop(controller.reportTask);
        
        // get the result and update progress bar
        controller.result = Workflow.getJobStatus(controller.result.jobId);
        controller.progressReport.pBars[0].updateProgress(jobPercentComplete, controller.result.jobStatusMessage);
        progressButton.disabled = true;
    }
    else {
        // if job has not run, start job
        controller.startTaskJob(dateStart, dateEnd);
		controller.storeDefaultDateParameterValue(dateStart, controller.dateStartParam);
		controller.storeDefaultDateParameterValue(dateEnd, controller.dateEndParam);
        progressButton.value = controller.progressReport.PROGRESS_STOP_JOB;
    }
}


function compareDate(paramValue,dateStart,dateEnd) {
	var curDate = new Date();
	var date = new Date(curDate.getFullYear(),curDate.getMonth(),curDate.getDate()-paramValue);
	var startDate = new Date(dateStart.replace(/\-/g, "/"));
    var endDate = new Date(dateEnd.replace(/\-/g, "/"));
	return (startDate>date && endDate>date);
}
/**
 * get current date in ISO format(like '07/20/2011')
 */
function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}




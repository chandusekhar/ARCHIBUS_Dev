/**
 * Infer Room Departments from Employees Controller
 *
 * Author: 	Keven xi
 * Date:	2009-04
 *
 */
var controller = View.createController('inferRmDeptFromEmController', {

    progressReport: null,
    
    resultsReport: null,
    
    result: null,
    
    autoRefreshInterval: 5,
    reportTask: null,
    reportTaskRunner: null,
    
    ruleId: 'AbCommonResources-SpaceService-inferRoomDepartmentsFromEmployees',
    /**
     * After view loads set up the top panel's localized labels and profile values
     * Set up the listener -- and localize the values -- for the locale select control in the form
     */
    afterViewLoad: function(){
    
        this.reportProgressPanel.sortEnabled = false;
    },
    
    
    startTaskJob: function(restriction){
    
        var jobId = Workflow.startJob(this.ruleId, restriction);
        
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
    },
    
    
    
    getRestrictionValue: function(){
        var restr = "";
        var buildingCode = this.rminfoPanel.getFieldValue("rm.bl_id");
        if (buildingCode) {
            restr += " rm.bl_id ='" + buildingCode + "'";
        }
        var floorCode = this.rminfoPanel.getFieldValue("rm.fl_id");
        if (floorCode) {
            if (restr) {
                restr += " AND ";
            }
            restr += " rm.fl_id ='" + floorCode + "'";
        }
        var roomcat = this.rminfoPanel.getFieldValue("rm.rm_cat");
        if (roomcat) {
            if (restr) {
                restr += " AND ";
            }
            restr += " rm.rm_cat ='" + roomcat + "'";
        }
        var roomType = this.rminfoPanel.getFieldValue("rm.rm_type");
        if (roomType) {
            if (restr) {
                restr += " AND ";
            }
            restr += " rm.rm_type ='" + roomType + "'";
        }
        var roomStandard = this.rminfoPanel.getFieldValue("rm.rm_std");
        if (roomStandard) {
            if (restr) {
                restr += " AND ";
            }
            restr += " rm.rm_std ='" + roomStandard + "'";
        }
        return restr;
    }
});


function onProgressButtonClick(e){

    var controller = View.controllers.get('inferRmDeptFromEmController');
    
    var restriction = controller.getRestrictionValue();
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
        controller.startTaskJob(restriction);
        progressButton.value = controller.progressReport.PROGRESS_STOP_JOB;
    }
}





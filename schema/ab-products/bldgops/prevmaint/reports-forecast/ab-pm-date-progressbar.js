var jobId;
var progressController = View.createController('progressController', {
    afterInitialDataFetch: function(){
        jobId = View.getOpenerView().controllers.get(0).jobId;
        Ext.fly('ptext').update(getMessage('generateScheduleDates'));
		$('stopImag').alt = getMessage('stopImagAlt');
        var pbar = new Ext.ProgressBar({
            id: 'pbar',
            width: 300,
            renderTo: 'p'
        });
        
        pbar.on('update', function(val){
            var status = Workflow.getJobStatus(jobId);
            var jobStatus = status.jobStatus;
            if (jobStatus != 'Started' && jobStatus != 'Created') {
                pbar.waitTimer.onStop = null;
                Ext.TaskMgr.stop(pbar.waitTimer);
                pbar.waitTimer = null;
                pbar.hide(true);
                stopBtn.dom.disabled = true;
                stopBtn.setDisplayed("none");
                if (jobStatus.substring(0, 6) == 'Failed') {
                    Ext.fly('ptext').update(getMessage('failedMessage'));
                }
                else {
                    //Ext.fly('ptext').update(getMessage('okMessage'));
                    var openerController = View.getOpenerView().controllers.get(0);
                    View.closeThisDialog();
                    if (openerController.afterScheduleJob) {
                        openerController.afterScheduleJob();
                    }
                }
            }
            //Ext.fly('jobStatus').update(getMessage('jobStatus') + " : " + jobStatus);
        });
        
        pbar.wait({
            interval: 200,
            increment: 50
        });
        var stopBtn = Ext.get('stop');
        stopBtn.setDisplayed("block");
        stopBtn.on('click', function(){
            pbar.reset(true);
			var result = {};
            try {
					result = Workflow.call("AbCommonResources-stopJob", {
                    jobId: jobId
                });
            } 
            catch (e) {
                //handle error
                Workflow.handleError(e);
            }
            
            //Ext.fly('jobStatus').update(getMessage('jobStatus') + " : " + result.data.jobStatus);
            Ext.fly('ptext').update(getMessage('jobStopped'));
            stopBtn.dom.disabled = true;
            stopBtn.setDisplayed("none");
            var openerController = View.getOpenerView().controllers.get(0);
            View.closeThisDialog();
            if (openerController.afterScheduleJob) {
                openerController.afterScheduleJob();
            }
        });
    }
});

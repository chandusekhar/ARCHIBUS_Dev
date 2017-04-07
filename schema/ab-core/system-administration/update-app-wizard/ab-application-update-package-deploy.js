var appUpdPackageDeployController = View.createController('appUpdPackageDeploy',{
	jobId: '',
	progressPanelWrapper:null,
	progressReport: null,	
	resultsReport: null,		
	result: null,	
	autoRefreshInterval: 2,
	reportTaskRunner: null,	
	showResult: false,
	resultView: '',
	reportTask:null,
	jobName:null,
	openerPanel:null,
	openerController:null,
	packageButton: null,
	deployType: null,

	afterViewLoad: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
	},

	afterInitialDataFetch: function(){
		this.reportProgressPanel.removeSorting();
		this.deployType = View.getView("parent").controllers.items[0].deployType;
		this.updateTab(this.deployType);
	},
	
	afterStartJob: function(){
		this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "8");
		this.result = Workflow.getJobStatus(this.jobId);
		this.resultsReport = new Ab.paginate.ResultsReport(this.reportResultsPanel, this.result);
		this.updateResultPanelWindow(this.result);
		this.startReportTask(this);
	},

	// start auto-refresh background task using Ext.util.TaskRunner
	startReportTask: function(controller){
		this.reportTask = {
				run: function(){
					if(typeof controller.result != 'undefined'){
						controller.result = Workflow.getJobStatus(controller.result.jobId);
						controller.updateResultPanelWindow(controller.result);
						controller.progressReport.refresh(controller.result);
						controller.resultsReport.refresh(controller.result);	
						//if job failed
						if(controller.result.jobStatusCode == 8){
							// stop the task runner
							controller.reportTaskRunner.stop(controller.reportTask);
							View.showMessage('error', View.getLocalizedString(controller.result.jobMessage));
						} else if(controller.result.jobStatusCode == 6 || controller.result.jobStatusCode == 7){
							// if job stopped or terminated, stop the task runner
							controller.reportTaskRunner.stop(controller.reportTask);
						} else if(controller.result.jobFinished == true){
								// if job completed, stop the task runner
								controller.reportTaskRunner.stop(controller.reportTask);								
								controller.progressReport.setResultViewLink()
								//var progressButton = document.getElementById(controller.reportProgressPanel.id + "_row0_progressButton");
								//progressButton.disabled = false;		
								controller.progressReport.updateButtonValue(0, controller.result)
								controller.resultView = controller.result.jobFile.url;								
								//display the view
								if (controller.showResult && valueExistsNotEmpty(controller.resultView)) {
									View.loadView(controller.resultView);
								}
						    	// load review tab
								controller.openerPanel.selectTab('wizardTabs_7');
								controller.openerPanel.setTabEnabled('wizardTabs_6', false);
								controller.openerPanel.showTab('wizardTabs_7', true);

						}
					}
				},
				interval: 1000 * controller.autoRefreshInterval
			}
		this.reportTaskRunner = new Ext.util.TaskRunner();
		this.reportTaskRunner.start(this.reportTask);
	},

	updateResultPanelWindow: function(result){		
		if(result.jobPartialResults.length > 0) {
	         this.view.getLayoutManager('mainLayout').expandRegion('south');
		} else {
             this.view.getLayoutManager('mainLayout').collapseRegion('south');
		}
	},
	
	reportProgressPanel_onProgressButton: function(){
		// if job is running, we can only stop it
		if( typeof(this.reportTask) != 'undefined' && this.reportTask!=null){
			this.result = Workflow.stopJob(this.result.jobId);		
			// stop the task runner
			this.reportTaskRunner.stop(this.reportTask);		
			this.progressReport.updateButtonValue(0, this.result);
		}else{
			View.confirm(getMessage('confirm_message'),function(button){
				if(button == 'yes'){
					startJob();
				}else{
					return;
				}
			});
		}
	},
	
	appUpdPackageDeploy_onPackageDeployFile: function(){

		var deployType = View.getView("parent").controllers.items[0].deployType;

		switch(deployType){
				case 'production_server':
					AppUpdateWizardService.packageDeployment(true, {
				        callback: function(jobId) {
				        	appUpdPackageDeployController.jobId=jobId;
				        	appUpdPackageDeployController.afterStartJob();
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
				case 'staging_server':
					AppUpdateWizardService.packageExtensions({
				        callback: function(jobId) {
				        	appUpdPackageDeployController.jobId=jobId;
				        	appUpdPackageDeployController.afterStartJob();
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
				case 'workgroup':
					AppUpdateWizardService.packageDeploymentWorkgroup({
				        callback: function(jobId) {
				        	appUpdPackageDeployController.jobId=jobId;
				        	appUpdPackageDeployController.afterStartJob();
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
			}
	},
	
	appUpdPackageDeploy_onBack: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if(deployType == "production_server"){
			this.openerPanel.selectTab('wizardTabs_4');
			this.openerPanel.setTabEnabled('wizardTabs_6', false);
			this.openerPanel.showTab('wizardTabs_4', true);
			this.openerPanel.hideTab('wizardTabs_5', true);
		} else{
			this.openerPanel.selectTab('wizardTabs_5');
			this.openerPanel.setTabEnabled('wizardTabs_6', false);
			this.openerPanel.showTab('wizardTabs_5', true);
		}
	},
	
	updateTab: function(deployType){
		var actionButton = this.appUpdPackageDeploy.actions.items[1];
		if(deployType == "staging_server"){
			$('first_tr_label').innerHTML = getMessage('first_tr_ext');
			$('enterpriseDeploy_label').innerHTML = getMessage('enterprise_deploy');

			//change button title
			actionButton.setTitle(getMessage('button_package_extension'));	
			
			//change panel title
			this.appUpdPackageDeploy.setTitle(getMessage('title_package_extension'));
			
		}else if (deployType == "workgroup" || deployType == "production_server"){
			// populate tr
			$('first_tr_label').innerHTML = getMessage('first_tr_deploy');

			//change button title
			actionButton.setTitle(getMessage('button_package_deploy'));	

			//change panel title
			this.appUpdPackageDeploy.setTitle(getMessage('title_package_deploy'));
			
			if (deployType == "production_server"){
				$('enterpriseDeploy_label').innerHTML = getMessage('enterprise_deploy');
			}
		}
	}

});

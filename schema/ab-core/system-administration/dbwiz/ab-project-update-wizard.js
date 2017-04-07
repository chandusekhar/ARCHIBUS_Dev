var tabsController = View.createController('tabsController', {
	transferOut:true,
	transferIn:false,
	generateSqlLog:true,
	executeSql:true,
	compare:false,
	deleteBeforeTransferOut: true,
	deleteAfterTransferIn: false,
	performTransferController:null,
	isMergeDataDict: false,
	isWizardLoaded: true,
	dbType:null,
	selectedFolder:'',
	runScript:false,
	
	afterViewLoad: function(){
		try {
			SchemaUpdateWizardService.startPrepareSchemaForDatabaseUpdateWizard(
											{
											callback: function(jobId) {
												tabsController.afterCallJob(jobId);
		    								},
		    								errorHandler: function(m, e) {
		    									View.showException(e);
		        							}
			});
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	afterCallJob:function(jobId){
		View.openJobProgressBar('Prepare schema...', jobId, '', function(status) {
			tabsController.afterUpdateSchema();
		});
	},

	afterUpdateSchema:function(){
		this.updProjWizTabs.tabs[2].loadView();
		var transferTypeController = this.view.controllers.items[0]; 
		transferTypeController.updProjTransferType.actions.get('next').forceDisable(false);
		transferTypeController.updProjTransferType.enableButton('next', true)
	},
	
	afterInitialDataFetch: function(){
		for(var i=1;i<this.updProjWizTabs.tabs.length;i++){
			this.updProjWizTabs.disableTab(this.updProjWizTabs.tabs[i].name);
		}
		this.updProjWizTabs.hideTab('mergeDataDictionary');
		this.updProjWizTabs.hideTab('compareDataDictionary');
		this.dbType = View.dataSources.get('dsDbType').getRecord().getValue('afm_tbls.table_name');
	}
});
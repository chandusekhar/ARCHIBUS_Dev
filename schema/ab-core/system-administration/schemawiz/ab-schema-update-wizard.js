var tabsController = View.createController('tabsController', {
	performTransferController:null,
	executeOnDb: true,
	logSqlCommands: false,
	fileName: '', 
	isRecreateTable: true, 
	isRecreateFK: true, 
	isChar: false,
	isValidated: false,
	tableSpaceName:'',

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
		var isOracle = this.isOracleDb();
		this.updSchWizTabs.tabs[1].loadView();
		if(isOracle == 1){
			var specifyUpdateController = View.controllers.items[1];
			specifyUpdateController.showOptionForOracle();
			specifyUpdateController.isOracle = true;
		}

		this.updSchWizTabs.tabs[2].loadView();
		var updateOptionsController = this.view.controllers.items[0]; 
		updateOptionsController.updSchSpecUpdPref.actions.get('next').forceDisable(false);
		updateOptionsController.updSchSpecUpdPref.enableButton('next', true)
	},
	
	isOracleDb:function(){
		if(valueExistsNotEmpty(this.dsIsOracle.getRecord().records)){
			// older DB
			return this.dsIsOracle.getRecord().records[0].values['afm_tbls.table_name']
		}else{
			// newer DB
			return this.dsIsOracle.getRecord().getValue("afm_tbls.table_name");
		}
	},

	afterInitialDataFetch: function(){
		this.updSchWizTabs.disableTab("updateSQLTables");
	}
});
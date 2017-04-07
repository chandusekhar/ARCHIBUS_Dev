/**
 * @author song
 */
var abCompDefineProgramController = View.createController('abCompDefineProgramController', {

	keyValue: "regprogram.regulation",

    // KB 3047003: Ability to copy regulations and programs with some associated child records
    sourceRecord: {regulation: null, regprogram: null},
	
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){
    		this.sbfDetailTabs = this.mainController.sbfDetailTabs;
    	}
    	
   		this.abCompDefineProgram.refresh(View.parentTab.restriction, this.mainController.newRecord);
    },

    /**
     *  call after form refresh.
     */
    abCompDefineProgram_afterRefresh: function(){
        // KB 3047003: Ability to copy regulations and programs with some associated child records
		if (!this.abCompDefineProgram.newRecord) {
            this.mainController.copyRecord = false;
        }
    },

    /**
     * first tab panel save button click 
     * After save record, Refresh grid in Tab 1.  
     * Show new record in Tab 2 form.  Disable all tabs after Tab 2. 
     *  Set View Title to 'Add New Program'.
     */
    abCompDefineProgram_onSaveAndAddNew: function(){
		
    	this.abCompDefineProgram_onSave();

    	if(this.sbfDetailTabs&&this.sbfDetailTabs.findTab('define')){
    		this.mainController.view.setTitle(getMessage("addNewProgram"));
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab('define');
    		this.sbfDetailTabs.enableTab('select');
    	}
    		     	
    	this.abCompDefineProgram.newRecord= true;   	
    	this.abCompDefineProgram.refresh();
    },
    
    /**
     * Event handle when 'save' button click.
     */
    abCompDefineProgram_onSave: function(){
    			
        // KB 3047003: Ability to copy regulations and programs with some associated child records
        var copyAsNew = this.mainController.copyRecord;

    	var result = this.abCompDefineProgram.save();
    	// If this was a new record and still marked new, then save failed, nothing more to do
    	if (this.abCompDefineProgram.newRecord || !result) {
    	  return;
    	}

        var regulation = this.abCompDefineProgram.getFieldValue(this.keyValue);
        var reg_program = this.abCompDefineProgram.getFieldValue("regprogram.reg_program");
        this.mainController.regulation = regulation;
        this.mainController.regprogram = reg_program;
        this.mainController.project_id = this.abCompDefineProgram.getFieldValue("regprogram.project_id");        
            
    	if(this.mainController.regulationTree){
    		this.mainController.abCompDefineProgram_onSave(this.abCompDefineProgram);
    	}else{			
			//KB#3036243: added for using in Notify Template tab. 
			this.sbfDetailTabs.regprogram = reg_program;
			this.sbfDetailTabs.regulation = regulation;

			var viewTitle = getMessage("manageCompProgram")+": "+reg_program;
			this.mainController.view.setTitle(viewTitle);
			this.sbfDetailTabs.setAllTabsEnabled(true);
				
			this.mainController.setOthersTabRefreshObj("define", 1);
    	}
    	
    	//3036507 add variable row to 'mainController' fixed checkDupulate issue in 'Location' tab.
        var dataSource = View.dataSources.get("abCompDefineProgramDS");
        var wfrRecord = dataSource.processOutboundRecord(this.abCompDefineProgram.getRecord());
        
        // KB 3047003: Ability to copy regulations and programs with some associated child records
        if (copyAsNew) {
            var theMainController = this.mainController;
            theMainController.copyRecord = false;
            View.openDialog('ab-comp-copy-as-new.axvw', null, false, {
                width: 600, height: 500,
                title: getMessage('copyAsNew'),
                fromRecord: this.sourceRecord,
                toRecord: {regulation: theMainController.regulation, regprogram: theMainController.regprogram},                            
                callback: function() {
                    if (theMainController.regulationTree){  //call mainController method refresh Tree.                
                        theMainController.abCompDefineProgram_onSave(theForm);
                    }            
                }                
            });            
        }        
    },
    /**
     * when add delete button click.
     */
    abCompDefineProgram_onDelete: function(){
        var confirmMessage = getMessage("messageConfirmDelete");
        var objThis = this;
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
            	//kb 3036023 according spec30, call wfr 'deleteComplianceCleanup' before delete.
            	var regulation = objThis.abCompDefineProgram.getFieldValue('regprogram.regulation');
            	var reg_program = objThis.abCompDefineProgram.getFieldValue('regprogram.reg_program');
        		if(reg_program!=""){
        			try{
        				var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteComplianceCleanup',
        						regulation, reg_program, '');
        			}catch(e){
        				Workflow.handleError(e);
        				return false;
        			}
        		}
            	objThis.abCompDefineProgram.deleteRecord();
            	objThis.abCompDefineProgram.show(false);
            	if(objThis.mainController.regulationTree){
            		objThis.mainController.abCompDefineProgram_onDelete(objThis.abCompDefineProgram);
            	}else{
            		objThis.sbfDetailTabs.setAllTabsEnabled(false);
            		objThis.sbfDetailTabs.enableTab("select");

            		objThis.mainController.setTabRefreshObj("select", 1);
            		
            		objThis.sbfDetailTabs.selectTab("select");
            		objThis.mainController.view.setTitle(getMessage("selectCompToManage"));
            	}
            }
        });    
    },
    /**
     * tab 4 , copy as new button click.
     */
    abCompDefineProgram_onCopyAsNew: function(){
        // KB 3047003: Ability to copy regulations and programs with some associated child records
        this.mainController.copyRecord = true;
        this.sourceRecord['regprogram'] = this.abCompDefineProgram.getFieldValue('regprogram.reg_program');
        this.sourceRecord['regulation'] = this.abCompDefineProgram.getFieldValue('regprogram.regulation');

        var keyValues = ["regprogram.regulation", "regprogram.reg_program"];
    	commonCopyAsNew(this.abCompDefineProgram, keyValues, this.abCompDefineProgramDS);
		if(this.mainController.regulationTree){
		}else{
			this.mainController.view.setTitle(getMessage("addNewProgram"));
			this.sbfDetailTabs.setAllTabsEnabled(false);
			this.sbfDetailTabs.enableTab('define');
			this.sbfDetailTabs.enableTab('select');
		}
    },
    /**
     * when cancel button click.
     */
    abCompDefineProgram_onCancel: function(){
    	if(this.mainController.regulationTree){
    		this.abCompDefineProgram.show(false);
    	}else{
    		this.abCompDefineProgram.show(false);
    		this.sbfDetailTabs.setAllTabsEnabled(false);
    		this.sbfDetailTabs.enableTab("select");
    		this.sbfDetailTabs.selectTab("select");
//    		this.sbfDetailTabs.findTab("select").loadView();
    		this.mainController.view.setTitle(getMessage("selectCompToManage"));
    	}
    }
});    


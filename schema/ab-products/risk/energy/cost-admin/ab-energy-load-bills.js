/**
 * @author AD
 * @created August 30, 2014
 */
 
var energyLoadBillsController = View.createController('energyLoadBillsController', {
	
	connectorExecuteJobId: 'AbSystemAdministration-ConnectorJob-executeConnector',
	billImportJobId: 0,
	billLineImportJobId: 0,
    jobStatusBillImp: null,
    jobStatusBillLineImp: null,
    uploadPath: 'users/public/dt/risk/energy/bills/',
    localFileName: null,
    multipleBillLoad: false,
    currentBillIndex: 0,
    selectedBillsCount: 0,
    selectedBillRows: null,
    
    /**
     * 
     */
	abEnergyRunBillConnector_treePanel_onLoadBills: function(){
		
        this.selectedBillRows = this.abEnergyRunBillConnector_treePanel.getSelectedRows();
        if (this.selectedBillRows.length > 0) {
            this.multipleBillLoad = true;
            this.selectedBillsCount = this.selectedBillRows.length;
            this.currentBillIndex = 0;
            this.importNextBill();            
        }
        else {
            View.showMessage(getMessage('NoBillsSelected'));                                
        }
    },

    /**
     * 
     */
	abEnergyRunBillConnector_detailsPanel_onLoadBill: function(){
		
        var fileToUpload = $('fileToUpload');
        if (fileToUpload && fileToUpload.files.length==1) {
          this.localFileName = fileToUpload.files[0].name;
          uploadFileToProjectFolder(fileToUpload, this.uploadPath, this.localFileName, true, this.uploadFileCallback, this);              
        }
        else {
          this.loadSelectedBill();  
        }
     		
    },
    
    /**
     * 
     */
	loadBill: function(billConnectorId, billLineConnectorId, autoApprove, fileName){
		
        // Override the Connector's connection string (filename) with specified fileName
        this.setConnectorFilename(billConnectorId, fileName);
        
        // Execute the bill connector to import bills
		try{
			this.billImportJobId = Workflow.startJob(this.connectorExecuteJobId, billConnectorId);
			
		}catch(e){
   			Workflow.handleError(e);
            return false;
		}

        var theThis = this;
        View.openJobProgressBar(getMessage('BillProgress'), this.billImportJobId, null, function(jobStatus) {
            theThis.jobStatusBillImp = jobStatus;
            // If bills imported without error, import the bill lines
            if (jobStatus.jobFinished && jobStatus.jobStatusCode==3 && billLineConnectorId) {  
                theThis.loadBillLine(billLineConnectorId, autoApprove, fileName);                    
            }
            else {
                View.showMessage('error', jobStatus.jobStatusMessage + ":  " + jobStatus.jobMessage, null, null,
                        function() {
                            View.openDialog('ab-energy-connector-log.axvw');
                        });                    
                return;
            }
        });                        
    },

    /**
     * 
     */
	loadBillLine: function(billLineConnectorId, autoApprove, fileName){
	
        // Override the Connector's connection string (filename) with specified fileName
        this.setConnectorFilename(billLineConnectorId, fileName);

        // Execute the bill line connnector to import bill lines
        try{
            this.billLineImportJobId = Workflow.startJob(this.connectorExecuteJobId, billLineConnectorId);    
        }catch(e){
            Workflow.handleError(e);
            return false;
        }

        var theThis = this;
        View.openJobProgressBar(getMessage('BillLineProgress'), this.billLineImportJobId, null, function(jobStatus) {
            theThis.jobStatusBillLineImp = jobStatus;
            // If bills and bill lines import completed without error, call WFRs to autoApprove and calc Energy values
            if (jobStatus.jobFinished && jobStatus.jobStatusCode==3) {  
                theThis.importNextBill(autoApprove);                    
            }
            else {
                View.showMessage('error', jobStatus.jobStatusMessage + ":  " + jobStatus.jobMessage, null, null,
                        function() {
                            View.openDialog('ab-energy-connector-log.axvw');
                        });                    
                return;
            }
        });                        
    },
      
    /**
     * If this.multipleBillLoad=true and bills remain to import, import the next selected bill
     * If done importing all selected bills or this.multipleBillLoad=false, approve and archive all imported bills
     */
	importNextBill: function(autoApprove){
                
        if (valueExistsNotEmpty(autoApprove)) {
            try{ 
                var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-processImportedBills', autoApprove);  
                // Check result, if successful display success message (if no more bills to process), else show error in result 
                if (result.code=='executed') {
                    if (!this.multipleBillLoad || (this.multipleBillLoad && this.currentBillIndex == this.selectedBillsCount))
                    View.showMessage(getMessage('BillImportSuccess'));                    
                }
                else {
                    View.showMessage('error', result.message, null, null,
                        function() {
                            View.openDialog('ab-energy-connector-log.axvw');
                        });
                    this.multipleBillLoad = false;
                    this.selectedBillsCount = 0;
                    return;
                        
                }
                
            } catch (e){
                Workflow.handleError(e);
                return false;
            }
            
        }
        
        if (this.multipleBillLoad && this.currentBillIndex < this.selectedBillsCount) {
            
            var dataRow = this.selectedBillRows[this.currentBillIndex];
		    var billConnectorId = dataRow['bill_connector.bill_connector_id'];
		    var billLineConnectorId = dataRow['bill_connector.bill_line_connector_id'];
		    var autoApproveVal = dataRow["bill_connector.auto_approve.raw"];
		    var autoApprove = Boolean(parseInt(autoApproveVal));
            var fileName = dataRow["bill_connector.default_file"];
            this.currentBillIndex++;
            
            this.loadBill(billConnectorId, billLineConnectorId, false, autoApprove, fileName);
            
        }
        else {
            this.multipleBillLoad = false;
            this.selectedBillsCount = 0;
        }             
    },
    
    /**
     * Override the Connector's connection string (filename) with specified fileName
     */
	setConnectorFilename: function(connectorId, fileName){		
        if (fileName) {
            var restriction = new Ab.view.Restriction(); 
            restriction.addClause("afm_connector.connector_id", connectorId, "=");
            var connector = this.abEnergyRunBillConnector_ds_2.getRecord(restriction);
            connector.setValue("afm_connector.conn_string", fileName);
            this.abEnergyRunBillConnector_ds_2.saveRecord(connector);
        }
    },
    
    /**
     * Read form values and call loadBill method.
     * uploadPath contains optional pathname of uploaded file to use instead of [default_file] in the form.
     */
    loadSelectedBill: function(uploadPath) {

        var billConnectorForm = this.abEnergyRunBillConnector_detailsPanel;
		var billConnectorId = billConnectorForm.getFieldValue("bill_connector.bill_connector_id");
		var billLineConnectorId = billConnectorForm.getFieldValue("bill_connector.bill_line_connector_id");
		var autoApproveVal = billConnectorForm.getFieldValue("bill_connector.auto_approve");
		var autoApprove = Boolean(parseInt(autoApproveVal));
        var fileName = billConnectorForm.getFieldValue("bill_connector.default_file");
        if (uploadPath) {
            fileName = uploadPath;
        }
        
        this.loadBill(billConnectorId, billLineConnectorId, autoApprove, fileName);                    
    },
    
    /**
     * Callback for upload file job
     * Local file upload was initiated, wait for it to finish
     */
    uploadFileCallback: function(result) {

        var jobId = result.message;
        var theThis = this;
        var destPath = "projects/" + this.uploadPath + this.localFileName;
        View.openJobProgressBar(getMessage('FileUploadProgress') + destPath, jobId, null, function(jobStatus) {
            if (jobStatus.jobFinished && jobStatus.jobStatusCode==3) {  // Local file upload was completed
                var uploadPath = "/#Attribute%//@webAppPath%/projects/" + theThis.uploadPath + theThis.localFileName;
                theThis.loadSelectedBill(uploadPath);
            }
            else {
                View.showMessage(jobStatus.jobStatusMessage + ":  " + jobStatus.jobMessage);
                return;
            }
        });                        
    }    
        
});

// User selected local file
function localFileChanged(formPanelId, fileToUploadId){
   var formPanel = View.panels.get(formPanelId);
   var fileName;
   if ($(fileToUploadId).files.length==1) {   
     var uploadFileName = $(fileToUploadId).files[0].name;
     fileName = "/#Attribute%//@webAppPath%/projects/" + energyLoadBillsController.uploadPath + uploadFileName;
   }
   
   if (fileName) {
     formPanel.setFieldValue('bill_connector.default_file', fileName);
     formPanel.enableField('bill_connector.default_file', false); 
   }
   else {
     formPanel.enableField('bill_connector.default_file', true);        
   }
}



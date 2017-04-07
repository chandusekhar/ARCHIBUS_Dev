/**
 * @author AD
 */
var abCompCopyAsNewController = View.createController('abCompCopyAsNewController', {

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click input[type=checkbox]': function() {
            this.initializeCheckboxes();
        }
    },

	regrequirement_from : null,
	regprogram_from : null,
	regulation_from : null,

	regrequirement_to : null,
	regprogram_to : null,
	regulation_to : null,

	/** Get Primary Key of Item to Copy
    /*  Hide and disable items
    */
    afterInitialDataFetch: function(){
/* FOR TESTING
          View.parameters = {
                    fromRecord: {regulation: 'CAA', regprogram: '', regrequirement: ''},
                    toRecord: {regulation: 'CAA-COPY4', regprogram: '', regrequirement: ''}                            
                };
*/
          if (View.parameters && valueExistsNotEmpty(View.parameters.fromRecord) && valueExistsNotEmpty(View.parameters.toRecord)) {
            this.regrequirement_from = View.parameters.fromRecord['regrequirement'];
            this.regprogram_from = View.parameters.fromRecord['regprogram'];
            this.regulation_from = View.parameters.fromRecord['regulation'];
            this.regrequirement_to = View.parameters.toRecord['regrequirement'];
            this.regprogram_to = View.parameters.toRecord['regprogram'];
            this.regulation_to = View.parameters.toRecord['regulation'];

            this.regrequirement_from = this.regrequirement_from!=undefined ? this.regrequirement_from : '';
            this.regprogram_from = this.regprogram_from!=undefined ? this.regprogram_from : '';
            this.regulation_from = this.regulation_from!=undefined ? this.regulation_from : '';
            this.regrequirement_to = this.regrequirement_to!=undefined ? this.regrequirement_to : '';
            this.regprogram_to = this.regprogram_to!=undefined ? this.regprogram_to : '';
            this.regulation_to = this.regulation_to!=undefined ? this.regulation_to : '';
           
            this.initializeCheckboxes();
            
            var title = getMessage('copyFrom');
            if(valueExistsNotEmpty(this.regrequirement_from)){
                title += ' [<b>' + this.regrequirement_from + '</b>] ' + getMessage('copyTo');
                title += ' [<b>' + this.regrequirement_to + '</b>]';                
            }  
            else if (valueExistsNotEmpty(this.regprogram_from)){
                title += ' [<b>' + this.regprogram_from + '</b>] ' + getMessage('copyTo');
                title += ' [<b>' + this.regprogram_to + '</b>]';                
            } 
            else if (valueExistsNotEmpty(this.regulation_from)){
                title += ' [<b>' + this.regulation_from + '</b>] ' + getMessage('copyTo');
                title += ' [<b>' + this.regulation_to + '</b>]';                
            }             
            this.abCompCopyAsNewForm.setInstructions(title);
          }  
    },
    
    /**
     * Copy the selected child items  
     */
    initializeCheckboxes: function(){
        var compItems = document.getElementsByName('abCompCopyAsNewForm_compItems');
        var compLocations = document.getElementsByName('abCompCopyAsNewForm_compLocations');
        var compNotifyTemplates = document.getElementsByName('abCompCopyAsNewForm_compNotifyTemplates');
        var compEvents = document.getElementsByName('abCompCopyAsNewForm_compEvents');
        
        //  If we are copying a requirement, disable some selections
        if(valueExistsNotEmpty(this.regrequirement_from)){
           if (compItems) {
             for (var i = 0; i < compItems.length; i++) {
                compItems[i].disabled = true;
             }               
           }
           if (compLocations) {
             for (var i = 0; i < compLocations.length-1; i++) {
                compLocations[i].disabled = true;
             }               
           }
           if (compNotifyTemplates) {
             for (var i = 0; i < compNotifyTemplates.length-1; i++) {
                compNotifyTemplates[i].disabled = true;
             }               
           }
        }  
        //  If we are copying a program, disable some selections
        else if (valueExistsNotEmpty(this.regprogram_from)){
           var values = this.abCompCopyAsNewForm.getCheckboxValues('compItems');
           if (compItems) {
             for (var i = 0; i < compItems.length-1; i++) {
                compItems[i].disabled = true;
             }               
           }
           if (compLocations) {
              compLocations[0].disabled = true;
              compLocations[2].disabled = (values.length>0) ? false : true;
           }
           if (compNotifyTemplates) {
              compNotifyTemplates[1].disabled = (values.length>0) ? false : true;
           }
           if (compEvents) {
              compEvents[0].disabled = (values.length>0) ? false : true;
           }
        } 
        //  If we are copying a regulation, disable some selections
        else if (valueExistsNotEmpty(this.regulation_from)){
           if (compItems) {
             for (var i = 1; i < compItems.length; i++) {
                compItems[i].disabled = true;
             }               
           }
           if (compLocations) {
             for (var i = 1; i < compLocations.length; i++) {
                compLocations[i].disabled = true;
             }               
           }
           if (compNotifyTemplates) {
             for (var i = 0; i < compNotifyTemplates.length; i++) {
                compNotifyTemplates[i].disabled = true;
             }               
           }
           if (compEvents) {
              compEvents[0].disabled = true;
           }
           
           var values = this.abCompCopyAsNewForm.getCheckboxValues('compItems');
           if (values.indexOf('programs')!=-1) {
               compItems[1].disabled = false;
               compLocations[1].disabled = false;                
               compNotifyTemplates[0].disabled = false;
           }
           else {
               compItems[1].checked = false;
               compLocations[1].checked = false;                
               compNotifyTemplates[0].checked = false;               
           }           
           values = this.abCompCopyAsNewForm.getCheckboxValues('compItems');
           if (values.indexOf('requirements')!=-1) {
               compLocations[2].disabled = false;                
               compNotifyTemplates[1].disabled = false;
               compEvents[0].disabled = false;
           } 
        } 
        else {
            View.getOpenerView().closeDialog();            
        }
        
       var values = this.abCompCopyAsNewForm.getCheckboxValues('compItems');
       if (values.indexOf('requirements')==-1 && !valueExistsNotEmpty(this.regrequirement_from)) {
           compLocations[2].checked = false;                
           compNotifyTemplates[1].checked = false;
           compEvents[0].checked = false;
       }            
                
        // Disable Event Notifications checkbox by default
        if (compEvents) {
            var values = this.abCompCopyAsNewForm.getCheckboxValues('compEvents');
            if (values.indexOf('events')==-1) {
              compEvents[1].checked = false;
            }
            compEvents[1].disabled = (values.indexOf('events')==-1) ? true : false;
        }
        
    },
    
    /**
     * Copy the selected child items  
     */
    abCompCopyAsNewForm_onSaveCopy: function(){

      var config = {
                compItems: this.abCompCopyAsNewForm.getCheckboxValues('compItems'),
                compLocations: this.abCompCopyAsNewForm.getCheckboxValues('compLocations'),                            
                compNotifyTemplates: this.abCompCopyAsNewForm.getCheckboxValues('compNotifyTemplates'),                            
                compEvents: this.abCompCopyAsNewForm.getCheckboxValues('compEvents'),  
                advanceDates: $('advanceDates').checked,
                advanceDatesByNum: $('advanceDatesByNum').value,
                advanceDatesByInterval: $('advanceDatesByInterval').value
            };
            
      var selectedItems = config.compItems.length + config.compLocations.length 
                            + config.compNotifyTemplates.length + config.compEvents.length;
                            
      if (selectedItems == 0) {
           View.getOpenerView().showMessage(getMessage("noSelections"));
      } 
      else if (config.advanceDates && config.advanceDatesByNum=='') {
           View.getOpenerView().showMessage(getMessage("noAdvanceDatesBy"));          
      }
      else {
		try{
			var jobId = Workflow.startJob('AbRiskCompliance-ComplianceCommon-copyChildComplianceRecords', 
               this.regulation_from, this.regprogram_from, this.regrequirement_from, 
               this.regulation_to, this.regprogram_to, this.regrequirement_to, config);
               
			    View.openJobProgressBar(getMessage("copyProgress"), jobId, '', function(status) {
                    if (status.jobFinished && status.jobStatusCode != 8) {
                        View.getOpenerView().showMessage(getMessage("copySuccess"));
					    View.getOpenerView().closeDialog();
                        if (valueExistsNotEmpty(View.parameters.callback)) {
                            View.parameters.callback();
                        }                        
                    }
			    });
               
		} catch(e){
			Workflow.handleError(e);
			return false;
		}
      }      
    }    

});    


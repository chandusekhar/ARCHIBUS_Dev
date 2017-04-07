/**
 * JS controller for CrystalReportsService opener view.
 * 
 * See CrystalReportsService.java for implementation details.
 */
View.createController('crystalReportsOpener', {
    
	fileName: '',
		
	clientRestriction: '',
	
	reportContent: null,
	
	afterViewLoad: function() {
		this.reportContent = document.getElementById("reportContent");

        for (var name in window.location.parameters) {
        	if(name.toLowerCase() == 'fileName'.toLowerCase()){
        		this.fileName = window.location.parameters[name];
        		break;
        	} else if(name.toLowerCase() == 'clientRestriction'.toLowerCase()){
        		this.clientRestriction = window.location.parameters[name];
        		break;
        	}
        }
		
        if(this.fileName!= null && this.fileName.length > 4)
        	this.displayCrystalReport();
        else
        	this.reportContent.innerHTML = "<br><br><span align='center' height='50px'><font color='red'>" + getMessage('errorMessage') + "</font></span>";
		
	},
	
    /**
     * Invoke CrystalReportsService, apply VPA.
     */
	displayCrystalReport: function() {
    	setTimeout(this.setWaitMessage(), 500);
    	
	    // invoke CrystalReportsService, always apply VPA
		CrystalReportsService.generateReport(this.fileName, true, this.clientRestriction, {
	        callback: function(fileTransfer) {
	        	// Show generated PDF report in IFRAME
	            var reportContent = document.getElementById("reportContent");
	            
	            //calculate the absolute height
	            var height = document.getElementById("viewLayout_center_div").parentNode.style.height;
	            reportContent.innerHTML = "<iframe width='100%' height='" + height + "px' scrolling='yes' frameborder='3' src='" + fileTransfer + "'></iframe>"; 
	        },
	        
	        errorHandler: function(m, e){
	            Ab.view.View.showException(e);
	        }
		});
	},
	
	setWaitMessage: function(){
		this.reportContent.innerHTML = "<span align='center' height='50px'><font color='red'>" + getMessage('waitMessage') + "</font></span>";
	}
});

/**
 * JS controller for CrystalReportsService example.
 * 
 * See CrystalReportsService.java for implementation details.
 * Works in IE, does not work in FireFox (ignores "inline" content disposition and downloads PDF as a file).
 */
View.createController('crystalReports', {
    
	setWaitMessage: function(){
		var waitMessageContent = document.getElementById("waitMessageContent");
		waitMessageContent.innerHTML = "<span align='center' height='50px'><font color='red'>" + getMessage('waitMessage') + "</font>";
	},
	
    /**
     * Invoke CrystalReportsService, apply VPA.
     */
	crystalReportsConsole_onInvokeCrystalReportsService: function() {
    	setTimeout(this.setWaitMessage(), 500);
    	
    	var fileName = $('fileName').value;
	    var applyVpa = $('applyVpa').checked;
	     var clientRestriction = $('clientRestriction').value;

	    // invoke CrystalReportsService, apply VPA
		CrystalReportsService.generateReport(fileName, applyVpa, clientRestriction, {
	        callback: function(fileTransfer) {
	        	// Show generated PDF report in IFRAME inside of crystalReportConsole
	            
	            var reportContent = document.getElementById("reportContent");
	            var previousSiblingElement = reportContent.parentNode.previousSibling;
	            if(typeof previousSiblingElement != 'undefined' && previousSiblingElement !=null)
	            reportContent.parentNode.parentNode.removeChild(previousSiblingElement);
	            reportContent.parentNode.colSpan = 2;
	            reportContent.parentNode.width = "100%";
	            reportContent.parentNode.height = "100%";
	            
	            //calculate the absolute height
	            var height = document.getElementById("viewLayout_center_div").parentNode.style.height;
	            var newHeight;
	            var pxIndex = height.indexOf("px");
	            if (pxIndex != -1) 
	            	newHeight = height.substr(0, pxIndex);
	            else
	            	newHeight = height;
	            newHeight = newHeight - 150;
	            
	            reportContent.innerHTML = "<iframe width='100%' height='" + newHeight + "px' scrolling='yes' frameborder='3' src='" + fileTransfer + "'></iframe>"; 
	            
	    	    setTimeout(function(){
	    	    				var waitMessageContent = document.getElementById("waitMessageContent");
	    	    				waitMessageContent.innerHTML = "<span align='center' height='50px'><font color='red'>" + getMessage('doneMessage') + "</font>";
    						}, 500);
	        	
	        },
	        
	        errorHandler: function(m, e){
	            Ab.view.View.showException(e);
	        },
	        
	        showDoneMessgage: function(){
	        	var waitMessageContent = document.getElementById("waitMessageContent");
    			waitMessageContent.innerHTML = "<span align='center' height='50px'><font color='red'>" + getMessage('doneMessage') + "</font>";
	        }
	    });
	}
});
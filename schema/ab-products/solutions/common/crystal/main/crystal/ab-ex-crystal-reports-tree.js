/**
 * JS controller for CrystalReportsService example.
 * 
 * See CrystalReportsService.java for implementation details.
 * Works in IE, does not work in FireFox (ignores "inline" content disposition and downloads PDF as a file).
 */
var crystalReportController = View.createController('crystalReports', {
    
    setWaitMessage: function(){
        var waitMessageContent = document.getElementById("waitMessageContent");
		waitMessageContent.innerHTML = "<span align='center' height='50px'><font color='red'>" + getMessage('waitMessage') + "</font>";
	},
	
	crystalReportsConsole_onInvokeCrystalReportsService: function(){
		setTimeout(this.setWaitMessage(), 500);
    	
    	
    	var fileName = $('fileName').value;
	    var applyVpa =$('applyVpa').checked;
	    
	    
	    var viewRest = new Ab.view.Restriction();
	    var treeView = View.panels.get("cystalReportTree_1");
	    if(treeView.lastNodeClicked){
		    var clickedData = treeView.lastNodeClicked.data["wr.bl_id"];
		    if(clickedData)
		    	viewRest.addClause('wr.bl_id', clickedData, '=');
	
		    var clickedData = treeView.lastNodeClicked.data["wr.fl_id"];
		    if(clickedData)
		    	viewRest.addClause('wr.fl_id', clickedData, '=');
		    
		    var clickedData = treeView.lastNodeClicked.data["wr.wr_id"];
		    if(clickedData)
		    	viewRest.addClause('wr.wr_id', clickedData, '=');
	    }
	    
	    var restriction = toJSON(viewRest || {});

	    // invoke CrystalReportsService, apply VPA
		CrystalReportsService.generateReport(fileName, applyVpa, restriction, {
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

        
        //clear the last clicked node in case user select the console action button
        treeView.lastNodeClicked = null;

	}
	
});



function onInvokeCrystalReportsService() {
	crystalReportController.crystalReportsConsole_onInvokeCrystalReportsService();    		
}

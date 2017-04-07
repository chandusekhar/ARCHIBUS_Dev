var uploadBimFile = View.createController('uploadBimFile', {
	progressWindow: null,
	progressBar: null,
	
	/**
	 * Call WFR to upload the file: upload, register
	 */
	bimuploadpanel_onUpload: function(){
		this.openJobProgressBar('Pleas wait...');
		var bucketName = $('bucket').value;
		var clientId = $('clientId').value;
		var clientSecret = $('clientSecret').value;
		
		var file = dwr.util.getValue("uploadfile");
		var fileName =  file.value;
		dwr.util.setValue("uploadFile", null);

		var _this = this;
		
		DrawingBimService.uploadFile(file, fileName, bucketName, clientId, clientSecret, true, {
		       callback: function(status) {
		    	   if(_this.progressBar){
		    		   _this.progressBar.updateProgress(1);
		    		   _this.closeProgressBar();
		    	   }
		       },
		       errorHandler: function(m, e) {
		    	   Ab.view.View.showException(e);
		    	   _this.closeProgressBar();
		       }
		});
	},
	/**
	 * Call WFR to check uploaded file's status
	 */
	bimuploadpanel_onStatus: function(){
		var _this = this;
		var bucketName = $('bucket').value;
		var clientId = $('clientId').value;
		var clientSecret = $('clientSecret').value;
		var fileName =  dwr.util.getValue("uploadfile").value;
		DrawingBimService.checKStatus(fileName, bucketName, clientId, clientSecret, {
		       callback: function(status) {
		    	   var result = "Status: " + status.state + "\n\n";
		    	   result = result + "Urn: " + status.urn;
		    	   
		    	   alert(result);
		    	   
		    	   if(_this.progressBar){
		    		   _this.progressBar.updateProgress(1);
		    		   _this.closeProgressBar();
		    	   }
		       },
		       errorHandler: function(m, e) {
		    	   Ab.view.View.showException(e);
		    	   _this.closeProgressBar();
		       }
		});
	},
	
	
	/**
	 * Call WFR to create a bucket
	 */
	createBucket: function(){
		var bucketName = $('bucket').value;
		var clientId = $('clientId').value;
		var clientSecret = $('clientSecret').value;
		DrawingBimService.createBucket(bucketName, clientId, clientSecret, {
		       callback: function(status) {
		       },
		       errorHandler: function(m, e) {
		    	   Ab.view.View.showException(e);
		       }
		});
	},
	
	  openJobProgressBar: function(message) {
	        var runner = new Ext.util.TaskRunner();
	        var _this = this;
	        var progressBar = this.initializeProgressBar(message);
	        var progress = 0;
	        var task = {
	            run: function() {
	        	try {
	                
	                if (valueExists(progressBar)) {
	                    // update the progress bar
	                	progress +=5;
	                	if(progress === 80){
	                		progress = 50;
	                	}
		                progressBar.updateProgress(progress/100);
		               
	                }
	              
	        	} catch (e) {
	        		runner.stop(task);
	        	}
	        	},
	            interval: 1000
	        }
	        runner.start(task);        
	    },
	
	initializeProgressBar: function(message) {
     
        if (this.progressWindow) {
            return null;
        }
        
        var windowConfig = {
            width: 500,
            height: 'auto',
            closable: false,
            modal: true,
            title: valueExists(message) ? message : this.getLocalizedString(this.z_MESSAGE_LOADING)
        };
      
        this.progressWindow = new Ext.Window(windowConfig);
        this.progressWindow.show();
        this.progressBar = new Ext.ProgressBar({
            renderTo: this.progressWindow.body
        });
        
        return this.progressBar;
    },
    
    closeProgressBar: function() {
        if (this.progressWindow) {
            this.progressBar.reset();
            this.progressWindow.close();
            this.progressWindow = null;
        }        
    }
    
});






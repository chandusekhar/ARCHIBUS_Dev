/**
 * Handles svg actions such as upload form, upload image action, save action.
 * show or hide upload and svg panels.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 * 
 */
var SvgActions = Base.extend({

	// config passed from drawing control ex.
	config: null,
	
	// panel to hold the upload image document form
    uploadPanel: null,
    
    // panel to hold the svg drawing.
    svgPanel: null,
    
    // <input> file element in upload form
    fileElement: null,
    
    // svg control
    control: null,
    
    changeEventAdded: false,
    
	constructor: function(config, svgPanelId, control){

		this.config = config;
		
		this.uploadPanel = View.panels.get(this.Z_UPLOADPANEL_ID);
		
		this.svgPanel = View.panels.get(svgPanelId);
	
		this.control = control;
		
		this.addChangeEvent();
		
		// add save and upload actions to svg panel
		this.addActions();
	},

	/**
	 * remove the default onchange event of the afm_redlines.image_file field's browse button, add a new event handler.
	 * allow user to only select image types.
	 */
	addChangeEvent: function(){
		var fileElement = document.getElementById(this.Z_UPLOADPANEL_ID + "_afm_redlines.image_file_browseDocument")
    	if(fileElement){
    		fileElement.setAttribute("accept", "image/*");
    		fileElement.removeAttribute("onchange");
    		if(!fileElement.onchange){
	    		var control = this.control;
	    		fileElement.addEventListener("change", this.onUploadFileChanged.createDelegate(fileElement, [control]), false);
    		}
    	} else {
    		// try again due to timing.
    		var actionControl = this;
    		setTimeout(function(){
    			actionControl.addChangeEvent();
    		}, 500);
    	}
		this.fileElement = fileElement;
	},
	
	/**
	 * add save and upload image actions to svg panel.
	 */
	addActions: function(){
		var control = this.control;
		if(this.config.svgActions.uploadImage && !this.svgPanel.actions.map[this.Z_UPLOADIMAGEACTION_ID]){
			this.svgPanel.addAction({
		         		id: this.Z_UPLOADIMAGEACTION_ID,
		         		text: View.getLocalizedString(this.Z_UPLOADIMAGEACTION_TEXT) 
		     }); 
			var fn = this.confirmUploadImage.createDelegate(this, [control]);
			this.svgPanel.addActionListener(this.Z_UPLOADIMAGEACTION_ID, fn, control);
		}
		
		if(this.config.svgActions.saveSvg && !this.svgPanel.actions.map[this.Z_SAVESVGACTION_ID]){
			this.svgPanel.addAction({
         		id: this.Z_SAVESVGACTION_ID,
         		text: View.getLocalizedString(this.Z_SAVESVGACTION_TEXT)
			});
			var fn = control.save.createDelegate(control, [control]);
			this.svgPanel.addActionListener(this.Z_SAVESVGACTION_ID, fn, control);
		}
	},
	
	/**
	 * called when user click on the "Save" panel action
	 */
	confirmUploadImage: function(){
    	if(!this.control.getSvg(this.control.divId).empty()){

    		// reset the activity_log_id with the new value instead of the value attached last time add event.
    		this.control.config.activityLogId = this.uploadPanel.getFieldValue("afm_redlines.activity_log_id");

    		// update the form with the related afm_docvers record
    		this.control.svgData.addOrRetrieveRedlineRecord(this.control.config.activityLogId, false);
    		this.uploadPanel.refresh({"afm_redlines.auto_number" : this.control.svgData.autoNumber});	
			
        	var control = this;
        	View.confirm(View.getLocalizedString(this.Z_CONFIRMMSG), function(button) {
	    		if (button == 'yes') {
	    			control.control.showLegend(false);
	    			control.uploadPanel.setFieldValue("afm_redlines.image_file", "");
	    			control.uploadPanel.updateDocumentButtons();
	    			
	    			//add event if needed.
	    			control.addChangeEvent(control.uploadPanel.id);

	    		}
			});
		} 
    },
    
    /*
     * If true, show upload panel and hide the svg panel, false otherwise.
     * Record the actvityLogId in the form.
     * 
     */
    show: function(show){
		
    	if(!this.svgPanel || !this.uploadPanel)
    		return;

		this.svgPanel.show(!show);
		
		//delay by 100ms since refresh the panel could take a bit time
		var uploadPanel = this.uploadPanel;
		setTimeout(function() {
			uploadPanel.show(show);
		}, 100);

		if(show){
			this.uploadPanel.setFieldValue("afm_redlines.activity_log_id", this.config.activityLogId);
		} else {
	    	// resize specified DOM element whenever the panel size changes
	    	this.svgPanel.setContentPanel(Ext.get(this.svgPanel.id));
	    	this.svgPanel.setContentPanel(Ext.get(this.control.divId));
		}
    },
    
    /**
     * calls when user use the browse button to choose a file.
     */
    uploadImageAndDisplay: function(fileName){

   		this.uploadPanel.processingFileInputChange(this.fileElement, 'afm_redlines.image_file');

   		var self= this;
   		var keys = {};
   		
   		//delay the update field and load image so that the uploading file content is complete.
		setTimeout(function(){
	    	var activityLogId = self.uploadPanel.getFieldValue("afm_redlines.activity_log_id");
	    	var autoNumber = self.uploadPanel.getFieldValue("afm_redlines.auto_number");
	    	keys = {'auto_number': autoNumber};
	    	
	    	// since afm_redlines.image_file is auto generated    	
			self.control.svgData.updateImageName(activityLogId, self.composeFileName(autoNumber, fileName));

		
			setTimeout(function(){
				self.control.svgImage.loadImageFromDb();
			}, 500);
		
		}, 1000);
		
		
    },
    
    /**
     * compose auto name file name for afm_redlines.image_file field.
     */
	composeFileName: function(autoNumber, docFileName){
	    var extension = docFileName.substring(docFileName.lastIndexOf('.') + 1);
        if (valueExistsNotEmpty(extension)) {
            extension = extension.toLowerCase();
        }
        var fileName = "afm_redlines-" + autoNumber + "-image_file." + extension;
        return fileName;
	},
	  
	
	/**
	 * event handler when user selected a new file to check in.
	 */
    onUploadFileChanged: function(control) {
    	
    	var fileName = control.svgActions.uploadPanel.validateDocumentFileNameElement(this);

    	if (fileName == null || fileName == '') {
    		return; 
    	}
    	
    	fileName = control.svgActions.uploadPanel.removeDirectories(fileName);

    	if(fileName){
    		control.clearDrawing();
   			control.svgActions.uploadImageAndDisplay(fileName);
    	}
    },
    
    // @begin_translatable
    Z_CONFIRMMSG: "Uploading an image will erase your current image and all unsaved redmarks.  Would you like to proceed?",
    Z_UPLOADIMAGEACTION_TEXT: 'Upload Image',
    Z_SAVESVGACTION_TEXT:		'Save',
    // @end_translatable
    
    Z_UPLOADIMAGEACTION_ID: 'uploadImageAction',
    Z_SAVESVGACTION_ID:		'saveSvgAction',
    Z_UPLOADPANEL_ID: 		'svgDrawingUpload'
    
});


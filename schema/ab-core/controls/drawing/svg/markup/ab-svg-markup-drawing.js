Ab.namespace('svg');

/***
 * This control extends the basic Svg Drawing Control and add additional functionality including:
 * 		Plan Type Highlight
 * 		Filter Highlight (SQL and per-Room)
 * 		Upload Image and Default Actions (Save, Filter Rooms, Select Rooms, Edit/Delete Filters)
 * 		Pre-load saved context (image, redlines, viewbox, plan type/filter highlight) from database for Drawing  
 *      Redlining Color Picker
 *      
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 * 
 */
Ab.svg.MarkupDrawingControl = Ab.svg.DrawingControl.extend({

	//drawing name used to load floor plan
    dwgName: '',
    
    //redmarks control
    redlineControl: null,
    
    //background highlight control
    planTypeHighlight: null,
    
    //additional highlight control
    filterHighlight: null,
        
    // svg drawing paraemters loaded from afm_redlines table
    savedParameters: null,
    
    // data sources used by the control.
    svgData: null,
    
    //image control
    svgImage: null,
    
    // upload image control, save actions
    svgActions: null,
    
    // flag if there is any unsaved changes, used to set the SAVE button.
    hasUnsavedChanges: false,
    
    // @begin_translatable
    Z_REDLINES_TITLE: 'Redlines',
	Z_UPLOADPANEL_ERRORMSG : 'You need to define Upload Panel in your view in order to upload image or load saved image/redlines from database.',
	z_PROGRESS_MESSAGE: 'Please wait...',
	// @end_translatable

    /**
     * Constructor.
	 * @param divId String Id of <div/> that holds the svg
     * @param panelId String Id of the panel
	 * @param config configObject
     */
    constructor: function(divId, panelId, config) {
        this.inherit(divId, panelId, config);
        this.divId = divId;
        this.panelId = panelId;
    	
        // initialize svg related actions - default action include upload and save.
        // user can define CaptureImage as panel action to utilize the Ab.command.captureSvgImage.
        config.addParameterIfNotExists('svgActions', {uploadImage: '', saveSvg: '' });
        
        // initialize the config of redline legends
        config.addParameterIfNotExists('redlineLegend', "{'panelId': '', 'divId': '', 'title': " + Ab.view.View.getLocalizedString(this.Z_REDLINES_TITLE) + ", 'style': {}, 'colorPickerId': ''");
        
        // initialize the config of background highlight radio control
        config.addParameterIfNotExists('planTypeHighlight', "{'panelId': '', 'divId': ''}");

        this.config = config;

        this.svgData = new SvgData();

        this.control = new DrawingSvg(divId, config);
        
        this.svgImage = new SvgImage(this);
        
        this.savedParameters = new SavedParameters();
        
        this.svgActions = new SvgActions(config, this.panelId, this);
        
        this.hasUnsavedChanges = false;
    },
    
    
    
    
    /**
     * Gets and displays SVG.
     * 
     * @param svgDivId      String the id of <div/> to display SVG
     * @param parameters    Object server-side required info such as as bl_id, fl_id, viewName, highlight
     *                      and label dataSource names to get and process corresponding SVG
     * @param eventHandlers Array of event handlers
     */
    load: function(svgDivId, parameters, eventHandlers) {
    	// retrieve the parameters such as activityLogId, bl, fl id etc from client side
    	this.copyParameters(parameters);
    	
    	// retrieve the drawing name from db
    	this.dwgName = this.svgData.retrieveDrawingName(this.config.pkeyValues);
    	
    	// clear the saved parameters.
    	this.savedParameters.reset();
    	
    	//empty svg content
    	this.clearDrawing();
    	
        this.hasUnsavedChanges = false;
		
        this.loadRedlineControl();
        
    	// the floor plan already exists
		if(this.dwgName){
    		
			//find out if there is any existing redline record, if not create one.
    		this.svgData.addOrRetrieveRedlineRecord(this.config.activityLogId, true);

    		//set the upload form to be the related record, the form's field values are used to obtain related db information
			if(!this.svgActions.uploadPanel){
				View.showMessage('error', View.getLocalizedString(this.Z_UPLOADPANEL_ERRORMSG));
				return;
			}
			
    		//set the upload form to be the related record, the form's field values are used to obtain related db information
    		var svgActions = this.svgActions;
    		svgActions.uploadPanel.refresh({"afm_redlines.auto_number" :  this.svgData.autoNumber }, false);

    		var svgControl = this;
			setTimeout(function() {
				svgActions.show(false);

				svgControl.loadFloorPlan(parameters, svgDivId, eventHandlers);
			}, 500);


	        // compatibility with IE
	        if (Ext.isIE) {
	            this.getDiv().node().style.overflow = 'hidden';
	        }
   			
    	} else {
    		
			this.svgData.addOrRetrieveRedlineRecord(this.config.activityLogId, false);
			
			//set the upload form to be the related record, the form's field values are used to obtain related db information
			if(!this.svgActions.uploadPanel){
				View.showMessage('error', View.getLocalizedString(this.Z_UPLOADPANEL_ERRORMSG));
				return;
			}
			
			var uploadPanel = this.svgActions.uploadPanel;
			uploadPanel.refresh({"afm_redlines.auto_number" :  this.svgData.autoNumber }, false);

			var svgControl = this;
			setTimeout(function() {
				uploadPanel.show(true);
				
				svgControl.loadUploadPanelOrImage();
			}, 500);
		}
	},
    
	/**
	 * Display floor plan and attach event, preload the drawing viewbox, redlines, highlight and filters from db, if any.
	 */
    loadFloorPlan: function(parameters, svgDivId, eventHandlers){
		// retrieved the saved svg drawing config and download redlines if any
		var record = this.svgData.getLastRedlineRecord(this.config.activityLogId);
			if(record && record.getValue("afm_redlines.extents_lux") != null &&  record.getValue("afm_redlines.extents_lux") != ''){
				// this will also loads redlines
				this.savedParameters.load(record, this);
				this.copyParameters(this.savedParameters, parameters["isReload"]);
        }
			
		// retrieve svg from server
		// 3049397 - use config object as all the parameters passed through client and database have been saved to the config object
		var svgText  = this.get(this.config);	
		
		//display svg and attach events
		this.processSvg(this, svgDivId, svgText, eventHandlers);
		
		this.getSvgControl().initAddOn();
		
		// set view box if exists in saved svg drawing config 
		if(this.config.viewBox && this.config.viewBox.length > 0)
			this.getSvg(svgDivId).attr("viewBox", this.config.viewBox); 

		this.showPlanTypeHighlight(true);
		
		this.showFilterHighlight(true, parameters["isReload"]);

		this.redlineControl.show(true);

	    this.showAction(this.svgActions.Z_UPLOADIMAGEACTION_ID, false);	

    },

    /**
     * load image from database or show the upload image button if there is no activity log id associated with the record.
     */
    loadUploadPanelOrImage: function(){
    	this.svgActions.show(true);
		
		this.showPlanTypeHighlight(false);

		this.showFilterHighlight(false);

		this.showLegend(false);
        
		if(this.config.activityLogId){
   			this.svgImage.activityLogId = this.config.activityLogId;
   			
   			var svgImage = this.svgImage;
   			setTimeout(function() {
   				svgImage.loadImageFromDb();
   			}, 500);
    	}
    },
    
    
    /**
     * show the specified action
     */
    showAction: function(actionId, show){
    	var action = this.svgActions.svgPanel.actions.get(actionId);
    	if(action) {
            action.render(show);
            action.enableButton(show);
    	}
    },
    

    /**
     * event handler to enable "save" action when there is any change in the drawing. 
     */
    enableSaveAction: function(control){
        control.showAction(control.svgActions.Z_SAVESVGACTION_ID, true);	
    },
    
    /**
     * add redmarks to the svg
     */
    addRedmarks: function(redmarks){
    	
    	var control = this;
    	
    	// timing issue - the redlineTarget take sometime to create - add 500ms delay before retrieving it.
    	setTimeout(function() {
    		control.redlineControl.addRedmarks(redmarks);
   	    }, 500)
    },
    
    /**
     * show or hide redline legend, upload control panel and svg drawing
     * @show boolean true to show legend, svg drawing and hide upload control, false to hide legend, svg drawing and show upload control.
     */
    showLegend: function(show){

   		this.redlineControl.show(show);
    	
   		this.svgActions.show(!show);
    },
    
    
    /**
     * create and load redline legend control, add the event handler. 
     */
    loadRedlineControl: function(){
    	// create and load only once
    	if(!this.redlineControl){
        	this.redlineControl = new Ab.svg.RedlineControl(this.divId, this.config.redlineLegend.panelId, this.config.redlineLegend.divId, this.config.redlineLegend.colorPickerId, this.config); 
    	    this.redlineControl.loadLegend(this.config);

    	    // attach the onDrop event if user did not define any
	    	var control = this;
	    	var fn = this.enableSaveAction.createDelegate(this, [control], false);
    	    if(!this.redlineControl.control.onDrop) {
    	    	this.redlineControl.control.onDrop = fn;
    	    }

    	    // attach onChange event
	    	this.redlineControl.control.onChange = fn;
    	}
    	
    },
    
    /**
     * show or hide background highlight control panel.
     * if the background highlight control has never been created, create the control with config passed from client side.
     * 
     */
    showPlanTypeHighlight: function(show){
    	if(!this.config.planTypeHighlight && !this.config.planTypeHighlight.panelId)
    		return;
    	
    	var panelId = this.config.planTypeHighlight.panelId;
    	if(!this.planTypeHighlight && show){
    		var control = this;
        	this.planTypeHighlight = new PlanTypeHighlight(this.config.planTypeHighlight.divId, this.config.planTypeHighlight.panelId, this.config, control); 
	    	this.planTypeHighlight.setDefault(this.config.selectedPlanType);
	    	this.planTypeHighlight.show(show);
    	} else {
    		var panel = View.panels.get(this.config.planTypeHighlight.panelId);
    		if(panel)
    			panel.show(show);
    	}

    },
    
    /**
     * show or hide additional highlight control panel.
     * if the additional highlight control has never been created, create the control with config passed from client side.
     * load the filter entries from database afm_redlines.highlight_def field if any.
     * 
     */
    showFilterHighlight: function(show, isReload){
    	
    	// show panel first then highlight to avoid the grid's row layout issue (might be a bug in grid)
    	var filterHighlightPanel = View.panels.get("filterHighlightPanel");
    	if(filterHighlightPanel)
    		filterHighlightPanel.show(show);
    	
    	if((!this.filterHighlight || isReload) && show){
    		var control = this;
        	this.filterHighlight = new FilterHighlight(this.config, control); 
        	this.filterHighlight.loadFilters();

        	// pass the control to panel's controller to use in filter dialog
        	View.controllers.get("filterHighlightCtrl").filterHighlightControl = this.filterHighlight;
    	}
    },
    
    /**
     * Gets SVG XML from server-side by specified parameters.
     * @param parameters Object
     * @return result Object
     */
    get: function(parameters) {
    	this.copyParameters(parameters);

        var selectedPlanType = this.config["selectedPlanType"];
        if(!selectedPlanType || selectedPlanType == 'None'){
        	selectedPlanType = '';
	    }
	    
        var result = null;
        var msg = View.getLocalizedString(this.Z_FAILED_TO_LOAD_MESSAGE) + ' ';
        DrawingSvgService.highlightSvgDrawing(this.config.pkeyValues, selectedPlanType, null, {
            async: false,
            callback: function(xml) {
                result = xml;
            },
            errorHandler: function(m) {
                // console.log(msg + m);
            }
        });

        return result;
    },
    
    
    /**
     * clear drawing content.
     */
    clearDrawing: function(){
    	var dwgElement = document.getElementById(this.divId);
    	if(dwgElement){
	    	dwgElement.innerHTML = "";
			dwgElement.style = "";
    	}
    },
    
    /**
     * enable/disable actions.
     * For upload image and save actions, it also bases on the drawing loading status
     */
    enableActions: function(show, hasFloorPlan){
    	// has to loop through the actions since the default showActions() function use the action predefined enable value.
    	var hasUnsavedChanges = this.hasUnsavedChanges;
    	var svgActions = this.svgActions;
    	
    	svgActions.svgPanel.actions.each(function(action) {

    		// do not show upload action if there is a floor plan
    		if(action.id === svgActions.Z_UPLOADIMAGEACTION_ID)
    			show = !hasFloorPlan;
    		
    		// onyl show save if there is any unsaved changes
    		if(action.id === svgActions.Z_SAVESVGACTION_ID)
    			show = hasUnsavedChanges;
    		
    		action.render(show);
            action.enableButton(show);
        });
    },
    

    /**
     * Displays SVG, binds JS events to highlighted assets, and adds interactivity components
     * @param self      Object control
     * @param svgDivId  String of the <div/> id
     * @param svgText	String of the SVG contents
     * @param eventHandlers Array
     */
    processSvg: function(self, svgDivId, svgText, eventHandlers) {
        var emptyDrawingText = View.getLocalizedString(this.Z_NO_CONTENTS_MESSAGE);
        this.divId = svgDivId;

        this.getDiv().classed({'floor-plan': true});
        d3.select("#" + svgDivId).node().innerHTML = (svgText) ? svgText : '<div class="empty-drawing-txt">' + emptyDrawingText + '</div>';
        this.getDiv().select("svg").attr("id", svgDivId + "-svg"); 

        if (this.getDiv()) {
            this.infoBar = this.getSvgControl().createInfoBar(this.divId + "_infoBar", this.getSvg(), this.getDiv(), "");
        }
        
        if (svgText) {
        	self.getSvgControl().setDefaultViewIfNotExists(this);
        	this.getSvg().call(viewBoxZoom());

            if (typeof LayersPopup !== 'undefined') {
                this.layersPopup = new LayersPopup();
            }

            if (eventHandlers) {
                self.addEventHandlers(self, eventHandlers);
            }

            //add room click event
            var control = this;
        	self.addEventHandlers(this, [{'assetType' : 'rm', 'handler' : this.onRoomClicked.createDelegate(this, [control], 2), 'highlightOnly': false}]);
        	self.addHomeButton();

            self.setPanAndZoomButtonVisibility(true);
            self.setIsDrawingLoaded(true);
        } else {
            self.setPanAndZoomButtonVisibility(false);
            self.setIsDrawingLoaded(false);
        }
        d3.select("#" + svgDivId).node().focus();
    },

    /**
     * event handler to add highlight and border to the room asset
     * @param assetId String. id for room asset, i.e. HQ;17;101
     * @param svg  DrawingSvg drawing content.
     * @param control Ab.svg.MarkupDrawingControl the control
     */
    onRoomClicked: function(assetId, svg, control){
    	
    	if(control.selectRoomsMode == 'selectRooms'){
    		var highlightRoomColorValueElem = document.getElementById("highlightRoomColorValue")
    		var asset = svg.getAssetById(assetId);
    		if (asset && highlightRoomColorValueElem) {
    			control.filterHighlight.addHighlight(asset, "#" + highlightRoomColorValueElem.value)
    		}
    	}
    },
    
    /**
     * Saves SVG drawing's extent, drawing name, action item id to afm_redlines table.
     * Save redlines and image content (if any) to its document table and update the related file name in afm_redlines table.
     * Save highlight filter to its docuemnt table and update the related file name in afm_redlines table.
     * Capture the floor plan or image with redlines and highlight, save to activity_log.doc4 field. 
     */
    save: function(){
    	View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
    	var me = this;
    	var saveChange = function(){
    		var viewBox = me.getViewBox();
    	// no svg loaded.
    	if(!viewBox)
    		return;
    	
    	// since save event is attached when the drawing is loaded, we need to retrieve the value according to the current record.
        	me.config.activityLogId = me.svgActions.uploadPanel.getFieldValue("afm_redlines.activity_log_id");
        	
        	if(!me.dwgName){
        		me.svgData.retrieveDrawingName();
        }
    	
    	var highlightJson = {};
       		if(me.planTypeHighlight){
       			highlightJson['planType'] =  me.planTypeHighlight.getHighlightJSON();
       		}
       		if(me.filterHighlight){
       			highlightJson['filter'] =  me.filterHighlight.getHighlightJSON();
       		}
       		
       		me.svgData.saveRecordToRedlineTable(viewBox, me.config.activityLogId, me.dwgName, highlightJson);
    	
   		try{

        		var record = me.svgData.getLastRedlineRecord(me.config.activityLogId);
            	if(me.redlineControl && record){
            		var redmarksSvg = me.redlineControl.retrieveRedmarks();
        		if(redmarksSvg){
        			var autoNumber = record.getValue("afm_redlines.auto_number");
            			me.svgData.saveRedmarksToDb(redmarksSvg, autoNumber);
        		}
        	}

        	//capture image and save it to the activity_log table
            var imageCapture = new ImageCapture();
                var control = me;
                imageCapture.captureImage(me.divId, false, me.svgImage.saveCapturedImageToDb.createDelegate(me, [control], 2));
    	} catch(e){
        		View.showMessage('error', getMessage('Error saving redline record to db.'), e.message, e.data);
    	}
    	
    	View.closeProgressBar();
    	};
    	
    	saveChange.defer(100);	
    },    

    /**
     * copy client config to the drawing control's config.
     */
    copyParameters: function(parameters, isReload){
        
    	this.copyParameter(parameters, 'pkeyValues');
    	this.copyParameter(parameters, 'activityLogId');
    	this.copyParameter(parameters, 'planTypeGroup');
    	
    	// only overwrite if it is first time since the background highlight will reload the drawing again and we should use the new plan type user chooses
    	// instead of the one that is loaded from database.
    	if(!isReload)
    		this.copyParameter(parameters, 'selectedPlanType');
    	
    	this.copyParameter(parameters, 'svgActions');
    	this.copyParameter(parameters, 'redlineLegend');
    	this.copyParameter(parameters, 'planTypeHighlight');
    	this.copyParameter(parameters, 'filterHighlight');
    	this.copyParameter(parameters, 'activityLogId');
    	this.copyParameter(parameters, 'viewBox');
    	this.copyParameter(parameters, 'filter');
    	this.copyParameter(parameters, 'redlineTypes');
    	
    },
    
    /**
     * only copy if the parameter exists
     */
    copyParameter: function(parameters, key){
    	var keyValue = parameters[key];
        if (!valueExists(keyValue)) {
        	keyValue = null;
        }
        if (valueExists(keyValue)) {
            this.config.setConfigParameter(key,  keyValue);
        }
    }
    
}, {});

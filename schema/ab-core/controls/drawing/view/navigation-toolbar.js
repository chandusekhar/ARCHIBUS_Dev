Drawing.namespace("view");

Drawing.view.NavigationToolbar = Base.extend({
	
	toolbarDiv: null,
	
	drawingController: null,
	
	/**
	 * record mouse state for event handler
	 */
	mouseState: {},
	
	/**
	 * switch for asset multiple selection - true if on, false otherwise.
	 */
	multipleSelectionOn: false,
	
	
    // @begin_translatable
    Z_NAVBAR_ZOOM_IN: "Zoom In",
    Z_NAVBAR_ZOOM_OUT: "Zoom Out",
    Z_NAVBAR_ZOOM_EXTENTS: "Zoom Extents",
    Z_NAVBAR_ZOOM_WINDOW: "Zoom into Selected Window Area",
    Z_NAVBAR_SELECT_MULTIASSETS: "Select Multiple Asset(s)",
    // @end_translatable
    

	constructor: function(config) {
		this.config = config;
    	this.init();
	},
	
	 /**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	
    	this.drawingController = drawingController;
    
    	if(!this.config.svg || this.config.svg.empty()){
 	   	   this.config.svg = d3.select("#" + this.config.divId + "-svg");
 	   	}

        // extents the drawing
        var status = this.drawingController.getController("PanZoomController").zoomExtents();
        
        // update icons
        this.updateLinkIcon(status);
        
        this.addDefaultHandlers();
        
        this.mouseState = {};

    },
    
    
    init: function(){
		var navToolbarContainer = document.createElement('div'); 
		navToolbarContainer.id = this.config.divId + "_navToolbarContainer";
		navToolbarContainer.className = 'navToolbarContainer';
        
		this.toolbarDiv = document.createElement('ul');
        this.toolbarDiv.id = this.config.divId + "_navToolbar";
        this.toolbarDiv.className = 'navToolbar';

        this.addLinkDiv('zoomIn', View.getLocalizedString(this.Z_NAVBAR_ZOOM_IN));
        this.addLinkDiv('zoomOut', View.getLocalizedString(this.Z_NAVBAR_ZOOM_OUT));
        this.addLinkDiv('zoomExtents', View.getLocalizedString(this.Z_NAVBAR_ZOOM_EXTENTS));
        this.addLinkDiv('zoomWindow', View.getLocalizedString(this.Z_NAVBAR_ZOOM_WINDOW));
        if(this.config.multipleSelectionEnabled !== 'false'){
        	this.addLinkDiv('multipleSelection', View.getLocalizedString(this.Z_NAVBAR_SELECT_MULTIASSETS));
        }
        this.multipleSelectionOn = false;
        this.zoomWindowOn = false;
        
        navToolbarContainer.appendChild(this.toolbarDiv);
        
        // prevent double click from propagating
        navToolbarContainer.addEventListener("dblclick", function(event){
        	event.stopPropagation();
        });
        
        // append after SVG drawing.
        var containerDiv = d3.select("#" + this.config.divId).node();
        var svg = d3.select("#" + this.config.divId + "-svg");
        if (!svg.empty()) {
        	containerDiv.insertBefore(navToolbarContainer, svg.node().nextSibling);
        }

        this.addLinkEvent('zoomIn');
        this.addLinkEvent('zoomOut');
        this.addLinkEvent('zoomExtents');
        this.addLinkEvent('zoomWindow');
        if(this.config.multipleSelectionEnabled == 'true'){
            this.addLinkEvent('multipleSelection');
        }
        
        // show the toolbar
        this.toolbarDiv.style.display = '';   
        
	},


	/**
	 * turn off the d3 event handlers and add the window's handlers to utilize the max/min zooming functionality.
	 */
	addDefaultHandlers: function(){
		var panel = d3.select("#" + this.config.divId);
        if(panel){
        	// turn off d3 event
        	panel.on(".viewboxzoom", null).on(".zoom", null);	

        	//attach window's event
        	var eventType = (navigator.userAgent.indexOf('Firefox') !=-1) ? "DOMMouseScroll" : "mousewheel"; 
        	var navToolbar = this;
        	panel.node().addEventListener(eventType, function(e){
        			e.preventDefault();
        			// cross-browser wheel delta
        			var e = window.event || e; // old IE support
        			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        			var zoomStatus = 0;
        			if(delta > 0){
        				zoomStatus = navToolbar.drawingController.getController("PanZoomController").zoomIn();
        			} else {
        				zoomStatus = navToolbar.drawingController.getController("PanZoomController").zoomOut();
        			}
       				navToolbar.updateLinkIcon(zoomStatus);
        	    }, false);
        			
        	panel.node().addEventListener("dblclick", function(e){
        			e.preventDefault();
        			var zoomStatus = navToolbar.drawingController.getController("PanZoomController").zoomIn();
        		    navToolbar.updateLinkIcon(zoomStatus);
       	    	}, false);

        	// use window event instead panel, as later is inconsistent with mouseup event and does not work well in Chrome.
        	window.addEventListener("mousedown", function(e){
        		 // skip if user clicks outside of svg
        		if(e.target.nodeName === "svg" || (e.target.viewportElement && e.target.viewportElement.nodeName === "svg")){
	    			e.preventDefault();
	    			navToolbar.mouseDownHandler(e);
        		 }
   	    	}, false);

        	window.addEventListener("mousemove", function(e){
        		// skip if user clicks outside of svg
        		if(e.target.nodeName === "svg" || (e.target.viewportElement && e.target.viewportElement.nodeName === "svg")){
        			 e.preventDefault();
         			 navToolbar.mouseMoveHandler(e);
        		 }
   	    	}, false);

        	window.addEventListener("mouseup", function(e){
        		// skip if user clicks outside of svg
        		if(e.target.nodeName === "svg" || (e.target.viewportElement && e.target.viewportElement.nodeName === "svg")){
       		 		e.preventDefault();
       		 		navToolbar.mouseUpHandler(e);
       		 	}
   	    	}, false);

        }
	},    
    
	mouseDownHandler: function(e){
		this.mouseState = {leftButtonDown : true,
							panning : false,
       						selecting : false,
       						zooming: false,
       						x : e.clientX,
       						y : e.clientY,
       						startX: e.clientX,
       						startY: e.clientY};
	},
	
	mouseMoveHandler: function(e){

		// if left mouse button is not clicked
		if(!this.detectLeftButton(e)){
			//if mouse down event invoked previously
			if(this.mouseState.leftButtonDown){
				this.mouseUpHandler(e);
			}
			return;
		}
		
		if(this.mouseState.leftButtonDown){
			if(this.multipleSelectionOn){
				this.mouseState.selecting = true;
			} else if(this.zoomWindowOn){
				this.mouseState.zooming = true;
			} else {
				this.mouseState.panning = true;
			}
		}

		if(this.mouseState.panning){
			//remove selection window if any.
			d3.selectAll("div.svgSelectWindow").remove();
			this.drawingController.getController("PanZoomController").pan(e.clientX-this.mouseState.x,e.clientY-this.mouseState.y);
			this.mouseState.x = e.clientX;
			this.mouseState.y = e.clientY;
		} else if(this.mouseState.selecting || this.mouseState.zooming){
			this.drawingController.getAddOn("SelectWindow").update(e.clientX, e.clientY);
		}
		
	},
	
	mouseUpHandler: function(e){
		
       	this.mouseState.leftButtonDown = false;

       	if(this.mouseState.panning){
  				this.drawingController.getController("PanZoomController").pan(e.clientX-this.mouseState.x,e.clientY-this.mouseState.y);
	        	this.mouseState.panning = false;
       	} else if(this.mouseState.selecting){
       		this.drawingController.getAddOn("SelectWindow").onAssetsSelected();
       		this.drawingController.getAddOn("SelectWindow").remove();
			this.mouseState.selecting = false;
        } else if(this.mouseState.zooming){
        	var bbox = { x: this.mouseState.startX,
        				y: this.mouseState.startY,
        				width: e.clientX - this.mouseState.startX,
        				height: e.clientY - this.mouseState.startY};

        	var zoomStatus = this.drawingController.getController("PanZoomController").zoomIntoArea(bbox);
        	this.updateLinkIcon(zoomStatus);
        	this.drawingController.getAddOn("SelectWindow").remove();
			this.mouseState.zooming = false;
        }
	},
	
	detectLeftButton: function(e) {
	    if ('buttons' in e) {
	        return e.buttons === 1;
	    } else if ('which' in e) {
	        return e.which === 1;
	    } else {
	        return e.button === 1;
	    }
	},
	
	
	addLinkDiv: function(linkId, linkTitle){

		var liElem = document.createElement('li');
		liElem.id = "navToolbar_" + linkId;
		
		var linkDiv = document.createElement('a');
        linkDiv.className = linkId;
        linkDiv.id = linkId;
        linkDiv.title = linkTitle;
        
        liElem.appendChild(linkDiv);
        
        this.toolbarDiv.appendChild(liElem);
        
	},
	
	removeLinkDiv: function(linkId){
	    var linkDiv = document.getElementById("navToolbar_" + linkId);
	    if(linkDiv){
	    	this.toolbarDiv.removeChild(linkDiv);
	    }
	},
	
	setLinkIcon: function(linkId, selected){
		 var linkDiv = document.getElementById(linkId);
		 if(linkDiv){
			 linkDiv.className = (selected ? linkId + 'Select' : linkId);
			 if(linkId != 'multipleSelection' && linkId != 'zoomWindow')
				 linkDiv.disabled = selected;
			 else 
				 linkDiv.disabled = false;
		 }
	},
	
	addLinkEvent: function(linkId){
        var eventName = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
        var linkDiv = document.getElementById(linkId);
        var self = this;
        linkDiv.addEventListener(eventName,  function(){
        	if(linkDiv.className == 'zoomExtents'){
        		self.onZoomExtents();
        	} else if(linkDiv.className == 'zoomIn'){
        		self.onZoomIn();
        	} else if(linkDiv.className == 'zoomOut'){
        		self.onZoomOut();
        	} else if(linkDiv.className == 'multipleSelection' || linkDiv.className == 'multipleSelectionSelect'){
        		self.toggleMutlipleSelection();
        	} else if(linkDiv.className == 'zoomWindow' || linkDiv.className == 'zoomWindowSelect'){
        		self.toggleZoomWindow();
        	}
        	
        }, false);
	},
	
	onZoomExtents: function(){
		var status = this.drawingController.getController("PanZoomController").zoomExtents();
		
        var clusterControl = this.drawingController.getAddOn('Cluster');
        if (clusterControl) { 
        	this.drawingController.config.svg.call(clusterControl.zoom);
        }
        
		this.updateLinkIcon(status);
	},

	onZoomIn: function(){
		var status = this.drawingController.getController("PanZoomController").zoomIn();
		this.updateLinkIcon(status);
	},

	onZoomOut: function(){
		var status = this.drawingController.getController("PanZoomController").zoomOut();
		this.updateLinkIcon(status);
	},

	toggleMutlipleSelection: function(){
		this.multipleSelectionOn = !this.multipleSelectionOn;
		this.drawingController.getController('SelectController').setMultipleSelection(this.multipleSelectionOn);
		this.setLinkIcon("multipleSelection", this.multipleSelectionOn);
		
		if(this.multipleSelectionOn){
			this.zoomWindowOn = false;
			this.setLinkIcon("zoomWindow", false);
		} else {
			this.drawingController.getAddOn("SelectWindow").remove();
		}
	},

	
	toggleZoomWindow: function(){
		this.zoomWindowOn = !this.zoomWindowOn;
		this.setLinkIcon("zoomWindow", this.zoomWindowOn);
		
		if(this.zoomWindowOn){
			this.multipleSelectionOn = false;
			this.drawingController.getController('SelectController').setMultipleSelection(false);
			this.setLinkIcon("multipleSelection", false);
		} else {
			this.drawingController.getAddOn("SelectWindow").remove();
		}
	},
	
	updateLinkIcon: function(status){
		this.setLinkIcon('zoomExtents', (status==1));
		this.setLinkIcon('zoomIn', (status==2));
		this.setLinkIcon('zoomOut', (status==3));
		this.setLinkIcon("multipleSelection", this.multipleSelectionOn);
	},
	
	show: function(bShow) {
        this.toolbarDiv.style.display = (bShow === true) ? '' : 'none';
    },
    
    showLink: function(linkId, bShow){
    	var linkDiv = document.getElementById(linkId);
    	if(linkDiv){
    		linkDiv.style.display = (bShow === true) ? '' : 'none';
    	}
    },
    
    /**
     * Show or hide zooming buttons
     * @param displayButtons Boolean
     */
    setZoomButtonsVisibility: function(displayButtons) {
        this.showLink("zoomIn", displayButtons);
        this.showLink("zoomOut", displayButtons);
    },
    
    remove: function(){
    	var containerDiv = d3.select("#" + this.config.divId).node();
        if (this.toolbarDiv) {
        	containerDiv.removeChild(this.toolbarDiv);
        }
    }
}, {});

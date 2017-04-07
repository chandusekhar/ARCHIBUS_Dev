
AFM.namespace('planboard');

/**
 * Shortcuts or YAHOO modules.
 */
var $ =  YAHOO.util.Dom.get;
var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;

var DateMath = YAHOO.widget.DateMath;

var $_ = AFM.planboard.Translate.getMessage;

/**
 * This is a button bar for selection a layout.
 */
AFM.planboard.LayoutSelector = Base.extend({	
	container: null,
	scheduleView: null,
	panel: null,
	
	selectedButton: null, // contains the button value that is selected	
	buttons: null, // array of buttons
	 	
	constructor: function(scheduleView, config) { 
		this.scheduleView = scheduleView; 
		if (config !== undefined && config.selectedButton !== undefined) {
			this.selectedButton = config.selectedButton;
		}
		if (config !== undefined && config.buttons !== undefined) {
			this.buttons = config.buttons;			
		} else { // use default
			this.buttons = [
				//KB3044815 - when click '1' button, show current day instead of show monday
	 		  { txt: "1", value: "day", title: $_('buttonsDay'), handler: this.scheduleView.onSelectDay, data: new Date()},		
	 		  { txt: "5", value: "workweek",  title: $_('buttonsWorkweek'), handler:this.scheduleView.onSelectWorkWeek, data:this.scheduleView.startDate},
	 		  { txt: "7", value: "week", title: $_('buttonsWeek'), handler:this.scheduleView.onSelectWeek, data: this.scheduleView.startDate},
	 		  { txt: "31", value: "month",  title: $_('buttonsMonth'), handler:this.scheduleView.onSelectMonth, data: this.scheduleView.startDate}
			];		
		}
	 	
	},  
	
	/**
	 * This will create a button in the button bar.
	 */
	createButton: function(txt, title, clickHandler, clickArg, selected) {
		div = this.panel.appendChild(document.createElement("div"));
		div.setAttribute("title", title);	
 		div.appendChild(document.createTextNode(txt));
 		Dom.addClass(div, "select"); 
 		
		if (selected) {
			Dom.addClass(div, "active"); 
			Dom.setStyle(div, "cursor", "default");
		} else { 		 		
 			Event.addListener(div, "mouseover", function(e) { YAHOO.util.Dom.addClass(this, "active") } );	
			Event.addListener(div, "mouseout", function(e) { YAHOO.util.Dom.removeClass(this, "active") } );		
	
 			Event.addListener(div, "click", clickHandler, clickArg, this.scheduleView, true);
		}
 		
	},
	
	render: function(container) {			 
		if (container !== undefined) this.container = $(container);				
		var date = this.scheduleView.startDate;
		
 		this.panel = this.container.appendChild(document.createElement("div"));
 		Dom.addClass(this.panel, "selector");
 		
 		for (var i=0; i<this.buttons.length; i++) {
 			var button = this.buttons[i];
 			this.createButton(button.txt, button.title, button.handler, button.data, this.selectedButton == button.value ? true:false );  		
 		}  		
	},
	
	destroy: function() {
		var elements = Dom.getElementsByClassName("select", "div", this.panel);		
		for (var i=0; i<elements.length; i++) {
			Event.purgeElement(elements[i]);			
			elements[i].parentNode.removeChild(elements[i]);	
		}		
	},
	
	toString: function() {
		return "Layout selector"
	}
});	

/**
 * 	Abastract layout.
 * 	
 * 	This is an abstract class as base class for a layout.
 * 	This base class will create a navigation and timeline at top.
 */
AFM.planboard.AbstractLayout = Base.extend({	
	scheduleView : null,
	container: null,
	
	config: null,
	selectedButton: "week", // default value
	
	selector: null,
	timeline: null,
	
	style: AFM.planboard.STYLES.EU_7_DAYS,
	timelineClass: AFM.planboard.WeekTimeline,		
	layoutSelectorClass: AFM.planboard.LayoutSelector,	
	
	resourceGroupPanelClass: AFM.planboard.CollapsiblePanel,
	resourceContainerClass: AFM.planboard.ResourceWorkWeekContainer,	
		
	constructor: function(scheduleView, config) {
		this.scheduleView = scheduleView;		 
		if (config !== undefined) {
			for (var key in config) {
				this[key] = config[key];
			}
		} 
			
	},
	
	/**
	 * refresh with new data
	 */
	refresh: function() {
		alert("abstract layout, override");
	},
	
	resize: function() {
		this.timeline.resize();		
	},
	
	setButtons: function(buttons) {		
		if (this.selector != null) {
			this.selector.setButtons(buttons);
		}		
	},
	
	/*
	 * render the layout
	 */
	render: function(container) {	
		
		if (container !== undefined) this.container = $(container); 
		// this.container.innerHTML = "";		
		if (this.selector != null) this.selector.destroy();
		if (this.timeline != null) this.timeline.destroy();	
		
		this.container.innerHTML = "";	// make sure everything is cleared...	
		var topContainer = this.container.appendChild(document.createElement("div"));
		Dom.addClass(topContainer, "topContainer");
		
		this.selector = new this.layoutSelectorClass(this.scheduleView, {selectedButton: this.selectedButton});
		this.timeline = new this.timelineClass(this.scheduleView, this.style);			
	
		
		this.selector.render(topContainer);	
		this.timeline.render(topContainer);	 	
		
		// to override and add ....
	},
	
	destroy: function() {
		if (this.selector != null) this.selector.destroy();
		if (this.timeline != null) this.timeline.destroy();
		
		for (var key in this) {
			delete this[key];
		}		
	}
	
});


/**
 * The resource layout
 */
AFM.planboard.ResourceLayout = AFM.planboard.AbstractLayout.extend({	
	// arrays of containers and panels
	resourceTypePanels: null,	
	resourceGroupPanels: null,			
	resourceContainers: null, // drag and drop container
	 	
	// default configuration parameters
	style: AFM.planboard.STYLES.EU_7_DAYS,
	timelineClass: AFM.planboard.WeekTimeline,		
	resourceGroupPanelClass: AFM.planboard.CollapsiblePanel,
	resourceContainerClass: AFM.planboard.ResourceWeekContainer,		
	selectedButton: "week", // default value
	
	constructor: function(scheduleView, config) {			 
		this.inherit(scheduleView, config)
		// create new arrays
		this.resourceTypePanels = []; // work, tools, etc
		this.resourceGroupPanels = []; // for each trade		
		this.resourceContainers = []; // for each craftsperson	 
		
		if (this.resourceGroupPanelClass == null) this.resourceGroupPanelClass = AFM.planboard.CollapsiblePanel;
		if (this.resourceContainerClass == null) this.resourceContainerClass = AFM.planboard.ResourceWorkWeekContainer;
 
 	},
 	
 	refresh: function() {
 		this.timeline.refresh();
 		for (var i=0; i < this.resourceContainers.length; i++) {
 			this.resourceContainers[i].refresh();
 		}
 	}, 	
 		
	render: function(container) {		
		this.inherit.call(this, container);	
		
		//var bodyContainer = this.container.appendChild(document.createElement("div"));
		// Dom.addClass(bodyContainer, "bodyContainer");			
				
		// render all resource groups (trades)		
		for (var i=0; i<this.scheduleView.resourceGroups.length; i++) {
			var resourceGroup = this.scheduleView.resourceGroups[i];
 
			var config = {
				title: resourceGroup.getLabel(),
				width: "auto" 	// the height has to be reset when adding resources	
			};		
			
			var resourceGroupPanel = new this.resourceGroupPanelClass(resourceGroup, config);
			 			
			this.resourceGroupPanels.push(resourceGroupPanel); // for destroy !!!
			resourceGroupPanel.render(this.container);	 
			
			// var resourceGroup = resourceGroupPanel.getReferenceObject(); 
			if (resourceGroup.resources != null) {
				for (var j=0; j<resourceGroup.resources.length; j++) {
					var resource = resourceGroup.resources[j];		
				
					var resourceContainer = new this.resourceContainerClass(resource, this.scheduleView, this.style);
					this.resourceContainers.push(resourceContainer);	
					// 
					resource.setResourceContainer(resourceContainer);								
					resourceContainer.render(resourceGroupPanel.getContentContainer());								
				} 			
			} // end if		
							
		} // end for			
	},
			
	resize: function() {
		if (this.timeline != null) this.timeline.resize();		
		
		for (var i=0; i<this.resourceContainers.length; i++) {
			this.resourceContainers[i].resize();
		}
	},
	
	/*
	clear: function() {
		for (var i=0; i<this.resourceContainers.length; i++) {
			var cells = this.resourceContainers[i].cells;
			for (var j=0; j<cells.length; j++) {
				cells[j].destroy();
			}			
		} 
	},*/
	
	destroyAllEntries: function() {
		for (var i=0; i<this.resourceContainers.length; i++) {
			this.resourceContainers[i].destroyAllEntries();			
		}
	},
	/*
	destroyResourceGroupPanel: function(index) {
		this.resourceGroupPanels[index].destroy();		
		this.resourceGroupPanels[index].splice(i,1);
	}, */
	
	destroyResourceContainer: function(resource) {
		for (var i=0; i<this.resourceContainers.length; i++) {
			if (resource.compare(this.resourceContainers[i].resource)) {
				this.resourceContainers[index].destroy();		
				this.resourceContainers[index].splice(i,1);
				break;
			}			
		}		
	}, 
	
	/**
	 * The destroy method is called when setting a new layout in the ScheduleView.
	 * 
	 * This will clean up all resources and makes sure we can create a new layout.
	 * Destroy method makes sure we don't have memory leaks (or minimize at least).
	 * 
	 * First we destroy all resource containers.
	 * Then the resource group panels.
	 * 
	 * Base class method should be called as last. This will clear all references of the object.
	 * The Abstract layout cleans the selector buttons and the timeline.
	 * 
	 * The innerHTML should not be called; this can be as cause to memory leaks.
	 */
	destroy: function() {	
		
		for (var i=0; i<this.resourceContainers.length; i++) {
			this.resourceContainers[i].destroy();			
		}  
		for (var i=0; i<this.resourceGroupPanels.length; i++) {
			this.resourceGroupPanels[i].destroy();
		} 		
		
		// call base class destroy as last		
		this.inherit.call(this); // destroy timeline and selector			
	}

});

/**
 * Implementations of Resource layouts.
 * 
 * 
 * 
 * 
 */

AFM.planboard.WeekResourceLayout = AFM.planboard.ResourceLayout.extend({	

	style: AFM.planboard.STYLES.EU_7_DAYS,
	selectedButton: "week",		
	timelineClass: AFM.planboard.WeekTimeline,		
	
	resourceGroupPanelClass: null,
	resourceContainerClass: null,	
 	
	constructor: function(scheduleView, config) {
		this.inherit(scheduleView, config); 
		
		if (this.resourceGroupPanelClass == null) this.resourceGroupPanelClass = AFM.planboard.CollapsiblePanel;
		if (this.resourceContainerClass == null) this.resourceContainerClass = AFM.planboard.ResourceWeekContainer;
		if (this.timelineClass == null) this.timelineClass = AFM.planboard.WeekTimeline;			
	}
});

/**
 * Display a work week (5 days) from Monday to Friday.
 * 
 */
AFM.planboard.WorkWeekResourceLayout = AFM.planboard.ResourceLayout.extend({		
	
	style: AFM.planboard.STYLES.EU_5_DAYS,
	selectedButton: "workweek",		
	
	timelineClass: AFM.planboard.WeekTimeline,		
	
	resourceGroupPanelClass: null, 
	resourceContainerClass: null,	
		
	constructor: function(scheduleView, config) {
		this.inherit(scheduleView, config); 
		
		if (this.resourceGroupPanelClass == null) this.resourceGroupPanelClass = AFM.planboard.CollapsiblePanel;
		if (this.resourceContainerClass == null) this.resourceContainerClass = AFM.planboard.ResourceWorkWeekContainer;
		
	}
	
	
});

/**
 * Display a Day overview.
 * 
 * 
 */
AFM.planboard.WorkDayResourceLayout = AFM.planboard.ResourceLayout.extend({	
	
	style: AFM.planboard.STYLES.DAY_7H_18H,
	selectedButton: "day",		
	timelineClass: AFM.planboard.DayTimeline,		
	resourceGroupPanelClass: null,
	resourceContainerClass: null,	
 	
	constructor: function(scheduleView, config) {
		this.inherit(scheduleView, config);
		
		if (this.resourceGroupPanelClass == null) this.resourceGroupPanelClass = AFM.planboard.CollapsiblePanel;
		if (this.resourceContainerClass == null) this.resourceContainerClass = AFM.planboard.ResourceDayContainer;
		
	},  
	
	render: function(container) {	
		if (container !== undefined) this.container = $(container); 
		this.container.innerHTML = "";
			
		var topContainer = this.container.appendChild(document.createElement("div"));
		Dom.addClass(topContainer, "topContainer");		 
		
		this.selector = new AFM.planboard.LayoutSelector(this.scheduleView, {selectedButton: "day"});
		this.selector.render(topContainer);		  
		
		this.timeline = new AFM.planboard.DayTimeline(this.scheduleView, AFM.planboard.STYLES.DAY_7H_18H);		
		this.timeline.render(topContainer);	 			
				
		// render all resource groups (trades)		
		for (var i=0; i<this.scheduleView.resourceGroups.length; i++) {
			var resourceGroup = this.scheduleView.resourceGroups[i];
					 
			var config = {
				title: resourceGroup.getLabel(),
				width: "auto" 	// the height has to be reset when adding resources		
			};
			var resourceGroupPanel = new AFM.planboard.CollapsiblePanel(resourceGroup, config);
			this.resourceGroupPanels.push(resourceGroupPanel);  	
			resourceGroupPanel.render(this.container);	 
			
			// var resourceGroup = resourceGroupPanel.getReferenceObject(); 
			if (resourceGroup.resources != null) {
				for (var j=0; j<resourceGroup.resources.length; j++) {
					var resource = resourceGroup.resources[j];		
					// pass the content container as parent for this element			 
					var resourceContainer = new AFM.planboard.ResourceDayContainer(resource, this.scheduleView);
					
					this.resourceContainers.push(resourceContainer);	
					resource.setResourceContainer(resourceContainer);		
					
					resourceContainer.render(resourceGroupPanel.getContentContainer());								
				} 			
			} // end if							
		} // end for			
	}
	
});

/**
 * Display a month overview.
 * 
 * 
 * 
 */
AFM.planboard.MonthResourceLayout = AFM.planboard.ResourceLayout.extend({	
	
	style: AFM.planboard.STYLES.MONTH_31,
	selectedButton: "month",		
	timelineClass: AFM.planboard.MonthTimeline,		
	resourceGroupPanelClass: AFM.planboard.CollapsiblePanel,
	resourceContainerClass: AFM.planboard.ResourceMonthContainer,
 	
	constructor: function(scheduleView, config) {
		this.inherit(scheduleView, config); 	
		timelineClass = AFM.planboard.MonthTimeline;
		if (this.resourceGroupPanelClass == null) this.resourceGroupPanelClass = AFM.planboard.CollapsiblePanel;
		if (this.resourceContainerClass == null) this.resourceContainerClass = AFM.planboard.ResourceMonthContainer;
		
 	},  
	
	// the render function must be overridden
	render: function(container) {		
		if (container !== undefined) this.container = $(container); 
		this.container.innerHTML = "";
		
		var topContainer = this.container.appendChild(document.createElement("div"));
		Dom.addClass(topContainer, "topContainer");		 
		
		this.selector = new AFM.planboard.LayoutSelector(this.scheduleView, {selectedButton: this.selectedButton} );
		this.selector.render(topContainer);		  
		
		this.timeline = new AFM.planboard.MonthTimeline(this.scheduleView);		
		this.timeline.render(topContainer);	 		 	
				
		// render all resource groups (trades)		
		for (var i=0; i<this.scheduleView.resourceGroups.length; i++) {
			var resourceGroup = this.scheduleView.resourceGroups[i];
	 
			var config = {
				title: resourceGroup.getLabel(),
				width: "auto" 	// the height has to be reset when adding resources		
			};
			var resourceGroupPanel = new AFM.planboard.CollapsiblePanel(resourceGroup, config);
			this.resourceGroupPanels.push(resourceGroupPanel); 	
			resourceGroupPanel.render(this.container);	 
			
			// var resourceGroup = resourceGroupPanel.getReferenceObject(); 
			if (resourceGroup.resources != null) {
				for (var j=0; j<resourceGroup.resources.length; j++) {
					var resource = resourceGroup.resources[j];		
					// pass the content container as parent for this element			 
					var resourceContainer = new AFM.planboard.ResourceMonthContainer(resource, this.scheduleView, this.style);
					
					this.resourceContainers.push(resourceContainer);	
					resource.setResourceContainer(resourceContainer);		
					
					resourceContainer.render(resourceGroupPanel.getContentContainer());								
				} 			
			} // end if							
		} // end for			
	}
	
});



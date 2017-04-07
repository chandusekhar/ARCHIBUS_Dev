/***
 * 
 * 
 * 
 * 
 * 
 */
 
 
AFM.namespace('planboard');

/**
 * Shortcuts or YAHOO modules.
 */
var $ =  YAHOO.util.Dom.get;
var Dom = YAHOO.util.Dom;
var Event = YAHOO.util.Event;
var Lang = YAHOO.util.Lang;
var Log = YAHOO.log; 
 
var DateMath = YAHOO.widget.DateMath;

var $_ = AFM.planboard.Translate.getMessage;

/**
 * The ScheduleView class is the main class from the planning board.
 * 
 * After calling the constructor, a layout is set. In the constructor the
 * start and end date must be provided. When using a week overview this is
 * not required, since default the start and end date for the week is used.
 * 
 * The layout a style is defined. The style defines settings for the layout.
 * For a week layout the style can define the start date (Sunday or Monday).
 * 
 * The layout displays the available resources (craftspersons) where tasks 
 * can be assigned to. 
 * 
 * Building the ScheduleView will load all data and render the planning board.
 * When building the debug flag can be set. If debugging is true, the YUI debugger 
 * window is displayed.
 * 
 * Navigation of tasks is a tree control. Tasks are drag and drop items that
 * can be dropped on the schedule. Drag and drop can be constrained to a 
 * resource group. This is optional.
 * 
 * The ScheduleView contains handlers used by navigation. 
 * 
 * 
 */
AFM.planboard.ScheduleView = Base.extend({	
	
	container: null,
	 	
	startDate: null,
	endDate: null,
	 
	treeView: null, // reference to the AFM.planboard.TreeView
	
	taskNodes: [], // all drag and drop task nodes
	layout: null,	 
	
	sites: [],
		
	// data objects	
	workRequests: [], // this is the main object for trees
	
	resourceGroups: [],
	resources: [],	
		
	tasks: [],
	
	scheduleEntries: [],
	
	holidays : {}, // this is map with iso-date strings / names
	
	progressWindow: null,
	
	counter: 0, // counter for tree leaves
	
	entryViewContextMenu: null,
	entryEditContextMenu: null,
	
	taskContextMenu: null,
	
	selectDialog: null,
	confirmDialog: null,
	errorDialog: null,	
	
	unitWidth: null,
	
	ddGroup: "default",	
	 
	_resources: null, // list of all resources
	_resourceGroups: null, // list of all resource groups
	
	logger: null,	 
	
	debug: false,
	
	workteamRestriction: null,
	supervisorRestriction: null,
	scheduleRestriction: null,
				
	constructor: function(container, startDate, endDate) {				
		this.container = $(container);
			
		if (startDate === undefined) { // default this week, start on Monday
			var today = new Date();
			var week = DateMath.getWeekNumber(today);
			var dayOfTheWeek = today.getDay();
						
			this.startDate = DateMath.subtract(today, DateMath.DAY, dayOfTheWeek-1);
			DateMath.clearTime(this.startDate);	
			// we end the week on sunday
			this.endDate = DateMath.add(this.startDate, DateMath.DAY, 6);	
		} else {
			this.startDate = startDate;	
			if (endDate === undefined) {
				this.endDate = DateMath.add(this.startDate, DateMath.DAY, 6);	
			} else {
				this.endDate = endDate;	
			}      			 
		}              
        
        // database array objects	
        this.sites = [];		
		this.workRequests = [];  
		this.resourceGroups = [];
		this._resourceGroups = []; // all resource groups (trades)
		// all available resources loaded from database		
		this.resources = [];		
		this._resources = []; // all resources (craftspersons)
					
		this.tasks = [];	
		this.scheduleEntries = [];
		
		
   		// load holidays for all sites (country and region), reload when site is selected
  		// the user should be restricted to a country and region, so local holidays are loaded
  		this.holidays = AFM.planboard.ScheduleController.loadHolidays(null, this.startDate.getFullYear());
  		  		
  		this.initEvents();  	  		
  		this.initContextMenus();  		
  		this.initDialogs();
  		  		
  		// create event listener for top navigation
  		// Event.addListener( AFM.planboard.ScheduleController.BUTTON_SELECT_TRADES, "click", this.onSelectTrades, this, true); 
  		
  		Event.addListener( AFM.planboard.ScheduleController.BUTTON_FILTER, "click", this.onFilter, this, true);   		
  		Event.addListener( window, "resize", this.onResize, this, true);  	
  	},
  	
  	getButtons: function() {
  		return [
			{ txt: "1", value: "day", title: $_('buttonsDay'), handler: this.onSelectDay, data: this.startDate}, 		
	 		{ txt: "5", value: "workweek",  title: $_('buttonsWorkweek'), handler:this.onSelectWorkWeek, data:this.startDate},
	 		{ txt: "7", value: "week", title: $_('buttonsWeek'), handler:this.onSelectWeek, data: this.startDate},
	 		{ txt: "31", value: "month",  title: $_('buttonsMonth'), handler:this.onSelectMonth, data: this.startDate}
		]
  	},
  	
  	/**
  	 * Create Custom Events and initialize listeners.
  	 */
  	initEvents: function() {
  		// events fired when entry is created, changed or removed.	
  		this.createEvent("loadEntry");  		  		
		this.createEvent("createEntry");
		this.createEvent("beforeChangeEntry");
		this.createEvent("changeEntry");
		this.createEvent("removeEntry");
		this.createEvent("destroyEntry");	// unload entry	
			
		// events fired after save to database, callback from server
		this.createEvent("commit"); 
		this.createEvent("rollback"); 
		
		this.createEvent("reloadTree"); 
		
		// fired when response from server after save and delete
		this.createEvent("updateTree");   		  	
		
		// subscribe custom events
		this.subscribe("updateTree", this.onUpdateTasks, this, true);
		this.subscribe("reloadTree", this.onReloadTree, this, true);	
		
		// when success from database, commit the record and add to resource		
		this.subscribe("commit", this.onCommitEntry, this, true);			
		this.subscribe("commit", this.onAddEntryToResource, this, true);		
		// this.subscribe("commit", this.addEntry, this, true);	
		
		// when failure from database or validation failure, restore old values	
		// this.subscribe("rollback", this.onRemoveEntryFromResource, this, true);
		this.subscribe("rollback", this.onRestoreEntry, this, true);		
		this.subscribe("rollback", this.onAddEntryToResource, this, true);				
				
		// persist to database		
		this.subscribe("createEntry", this.onSaveEntry, this, true);
		this.subscribe("changeEntry", this.onSaveEntry, this, true);		
		this.subscribe("removeEntry", this.onDeleteEntry, this, true);
		
		// when the entry is loaded from the database
		this.subscribe("loadEntry", this.addEntry, this, true);	
		this.subscribe("loadEntry", this.onAddEntryToResource, this, true);		
			
		this.subscribe("createEntry", this.addEntry, this, true);						
		
		this.subscribe("beforeChangeEntry", this.onRemoveEntryFromResource, this, true);					
		this.subscribe("destroyEntry", this.onRemoveEntryFromResource, this, true);	
		this.subscribe("removeEntry", this.onRemoveEntryFromResource, this, true);	
		
		// put these as last to be executed !!!
		this.subscribe("removeEntry", this.removeEntry, this, true);
		this.subscribe("destroyEntry", this.removeEntry, this, true);	  	
  	}, 
  	
  	/**
  	 * Event handler when resizing the window. The layout is liquid. 
  	 * 
  	 */
  	onResize: function(e) {
  		this.layout.resize();
  	},
  	
  	onCommitEntry: function(record) {
  		record.commit();	
  	},
  	
  	onRestoreEntry: function(record) {
  		if (this.debug)
  			Log("Restore values");
  		record.rollback();
  		if (this.debug)
  			Log("Values Restored");
  	},  	
  	
  	onSaveEntry: function(entry) {		
		AFM.planboard.ScheduleController.saveRecord(entry);				
	},
	
	onDeleteEntry: function(entry) {
		AFM.planboard.ScheduleController.removeRecord(entry);		
	},	 
	
	/**
	 * Event Handler called by custom events.
	 * 
	 */
	onAddEntryToResource: function(entry) {
		var resource = entry.resource;
		if (resource != null) {
			resource.addEntry(entry);
			if (entry.startDate != null && resource.resourceContainer) { // this should always be true?? 				 
				var entryCell = resource.resourceContainer.getCell(entry.startDate);
				if (entryCell != null) entryCell.addEntry(entry);	
				if (this.debug)
					Log("Added to " + entryCell);			
			} else {
				if (this.debug)
					Log("No container for " + resource + " on " + entry.startDate);	 
			}	
		}
	},
	 
	
	/**
	 * Event Handler called by custom events.
	 * 
	 */
	onRemoveEntryFromResource: function(entry) {
		var resource = entry.resource;
		if (resource != null) {
			resource.removeEntry(entry);
			if (entry.startDate != null && resource.resourceContainer != null) {
				var entryCell = resource.resourceContainer.getCell(entry.startDate);
				if (entryCell != null) entryCell.removeEntry(entry);
				if (this.debug)
					Log("Removed from " + entryCell);		
			}
		}
	},	
  	
  	/**
  	 * Initialize dialog boxes. 
  	 */
  	initDialogs: function() {
  			
  		this.selectDialog = new YAHOO.widget.Dialog("selectTradeDialog", 
			{ 
			  width: "400px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  visible : false,
			  draggable: false
			 } ); 		
					
	    this.selectDialog.cfg.queueProperty("buttons", [ { text:"Confirm", 
					handler: {fn: this.confirmSelection, obj: this.selectDialog, scope: this},
					isDefault:true },
				  { text:"Cancel", 
				  	handler: this.cancelSelection} ]);  				  	
				  		
  		this.selectDialog.render(document.body);
  		
  		/**
  		 * 
  		 */
  		
  		this.confirmDialog = new YAHOO.widget.Dialog("confirmDialog", 
			{ 
			  width: "500px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  visible : false,
			  draggable: false
			 } );
  		
  		
		this.confirmDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
		
		var yesText = getMessage("validateYes");
		var cancelText = getMessage("validateCancel");
		
	    this.confirmDialog.cfg.queueProperty("buttons", [ { text:yesText, 
					handler: function(){return true} },
				  { text:cancelText, 
				  	handler: function(){return false},
					isDefault:true } ]);  		
  		this.confirmDialog.render(document.body);
  		
  		this.errorDialog = new YAHOO.widget.Dialog("errorDialog", 
			{ 
			  width: "500px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  visible : false,
			  draggable: false
			 } );
		// ICON_BLOCK, ICON_WARN, ICON_HELP, ICON_INFO, ICON_ALARM, and ICON_TIP	 
  		this.errorDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_ALARM);	
  		   
  		var okText = getMessage("validateOk");
	    this.errorDialog.cfg.queueProperty("buttons", [ { text:okText, 
					handler: function(){return false} } ]);  		
  		this.errorDialog.render(document.body);
  		 		
	  
	    /**  	    
	     * create a progress bar panel
	     */
	 	this.progressWindow = new YAHOO.widget.Panel("wait",  
			{ width:"240px",  
			  center: true,	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  close:false, 
			  draggable:false, 
			  zindex:999999,
			  modal:true, 
			  visible:false
			} 
		); 

		this.progressWindow.setHeader( $_('progressWindowWaiting') );
		this.progressWindow.setBody('<img src="' + Ab.view.View.contextPath + '/schema/ab-products/bldgops/ondemandwork/supervisor/schedule/rel_interstitial_loading.gif" />');
		this.progressWindow.render(document.body);
  		
  	},
  	
  	/**
  	 * Initialize context menus.
  	 */
  	initContextMenus: function() {
  		/**
  		 * create two context menu's for entries
  		 */
  		this.entryEditContextMenu = new YAHOO.widget.ContextMenu("entryEdit-cm", {lazyload: true,width: "120px", clicktohide: true, hidedelay:1000});		        
		this.entryEditContextMenu.addItem($_('contextmenuEdit'));
        this.entryEditContextMenu.addItem($_('contextmenuRemove'));
        this.entryEditContextMenu.addItem($_('contextmenuSplit'));     
        this.entryEditContextMenu.render("divContextMenu");
        
        this.entryViewContextMenu = new YAHOO.widget.ContextMenu("viewEdit-cm", { lazyload: true } );	
		this.entryViewContextMenu.addItem($_('contextmenuShowInfo'));	        
        this.entryViewContextMenu.render(document.body);
        //this.entryViewContextMenu.render("scheduleView");
        
        this.taskContextMenu = new YAHOO.widget.ContextMenu("viewTask-cm", { lazyload: true } );	
		this.taskContextMenu.addItem($_('contextmenuShowInfo'));	        
        this.taskContextMenu.render(document.body);
        //this.taskContextMenu.render("scheduleView");  		
  	},
  	
  	/**
  	 * Calendar functions for holiday and weekend.
  	 */
  	isHoliday: function(date) { 
  		if (date === undefined) return false;
  		if (this.holidays[AFM.planboard.DateUtil.getIsoFormatDate(date)] === undefined) return false;
  		return true;
  	},
  	
  	isWeekend: function(date) {
  		if (date === undefined) return false;
  		if (date.getDay() == 0 || date.getDay() == 6) return true;
  		return false;
  	},
  	
  	/**
  	 * Called from the filter panel.
  	 * 
  	 * Filters the navigation tree.
  	 * 
  	 */
  	onFilter: function(e) { 			
  		/*
  		var frm = AFM.view.View.getControl('', 'panel_filter');		  		 	
  		var filter = frm.getFieldValues(); // doesn't include the alias fields
  		var dateValue = frm.getFieldValue("filter_date"); // this is an alias field
  		filter["filter_date"] = dateValue;
  		this.treeView.build(filter);  	
  		this.treeView.render();	
  		// when a site is selected, get the holidays for this site, otherwise site location of user is used as default
  		if (filter["wr.site_id"] != '') {
  			this.holidays = AFM.planboard.ScheduleController.loadHolidays(filter["wr.site_id"], this.startDate.getFullYear());
  			this.refresh(); // refresh holidays on screen
  		}
  		*/
  	},
  	
  	/**
  	 * Not used at this moment
  	 */
  	onSelectTrades: function(e) {  	  		
  		var html="<ul>";
  		
  		for (var i=0; i<this._resources.length; i++) {
  			var selected = 'checked="false"';
  			for (var j=0; j<this.resources.length; j++) {
  				if (this._resources[i].compare(this.resources[j])) {
  					selected = 'checked="true"';; break;
  				}
  			}
  			
  			html += '<li><input type="checkbox" '+ selected +' id="cf_id_'+ i +'" name="cf_ids"/>'+this._resources[i].getLabel() +' ' + this._resources[i].getResourceGroupName() +'</li>';	
  		}
  		html += "</ul>";
  		
  		// this.selectDialog.setHeader("Select Craftspersons and Trades");
		this.selectDialog.setBody(html);
		
		for (var i=0; i<this._resources.length; i++) {			
			Event.addListener("cf_id_"+ i, "click", this.onCheckResource, {id: "cf_id_"+ i, resource: this._resources[i]}, this);
		}
					 
		this.selectDialog.show();	
				
  	},  	 
 
  	
  	onCheckResource: function(e, args) {
  		 
  		var checkbox = $(args.id);
  		var resource = args.resource;
  		
  		var resourceGroup = this.getResourceGroup({ "tr.tr_id": resource.getProperty("cf.tr_id") });
  		
  		if (checkbox.checked) {
  			// this.addToList(this.resources, resource);
  			resourceGroup.addResource(resource);
  		} else {
  			// this.removeFromList(this.resources, resource);
  			resourceGroup.removeResource(resource);
  		}  		
  		 		
  	},
  	
  	/***
  	 *  Event handlers
  	 */
  	
  	onReloadTree: function(data) {
  		// make sure to clean up all drag and drop
  		for (var i=0; i < this.taskNodes.length; i++) {		 
			this.taskNodes[i].destroy(); 
		} // end for 
  		
  		this.taskNodes = [];
  		  		  		
  		abOndemandPlaningboardController.treeProbWrTask.addParameter('supervisorRest',this.supervisorRestriction);
  		abOndemandPlaningboardController.treeProbWrTask.addParameter('workteamRest',this.workteamRestriction);
  		abOndemandPlaningboardController.treeProbWrTask.addParameter('scheduleRest',this.scheduleRestriction);
  		
  		abOndemandPlaningboardController.treeProbWrTask.refresh();
  		if(valueExistsNotEmpty(data)){
  			this.updateProgress(data);
  		}
  		
  		
  		//abOndemandPlaningboardController.currentTreePanel.expand();
  	},
  	/**
  	 * When an entry (assignment) is saved, the scheduled hours are calculated.
  	 *  
  	 * 
  	 * 
  	 */
  	onUpdateTasks: function(data) {
  		// data is array of tr_id and hours_sched
  		if (data === undefined || ! Lang.isArray(data)) return;
  		
  		for (var i=0; i<data.length; i++) {
  			var record = data[i];
  			var tr_id = record["wrtr.tr_id"];
  			var wr_id = record["wrtr.wr_id"];
  			var hours_sched = record["wrtr.hours_sched"];  			
  			
  			var task = this.getTask({"wrtr.wr_id": wr_id, "wrtr.tr_id": tr_id});
  			
  			if (task != null && task.node != null && hours_sched !== undefined) {  	
  				task.setScheduledHours(hours_sched);	  				
  				var hours_est = task.getEstimatedHours(); 
  				   	
  				if (this.debug)
					Log("Est: "+ hours_est +", sched: "+ hours_sched);		
  							 				
  				task.node.setProgressWidth(hours_est, hours_sched);				 			 
  			}  			
  		}
  		
  	},
  	
  	/**
  	 * When selection a day view layout.
  	 */  	
  	onSelectDay: function(e, date) {  
  		// set dates and reload entries		 
  		this.unloadEntries();
  	
  		var style = AFM.planboard.STYLES.DAY_7H_18H;
  		
  		this.startDate = date; 
  		this.startDate.setHours(style.start);  		
  		this.endDate = new Date();
  		this.endDate.setTime(this.startDate.getTime()); 	
  		this.endDate.setHours(style.end);	
  		
  		this.setLayout(new AFM.planboard.WorkDayResourceLayout(this));
  		
  		this.progressWindow.show();   
  		window.scheduleView = this;	 	
  	 	window.setTimeout(this.renderEntries, 1);    
  	},
  	
  	/**
  	 * When selecting a work week layout.
  	 */
  	onSelectWorkWeek: function(e, date) {   
  		this.unloadEntries();  
  		
  		date = DateMath.clearTime(date); // make sure hours are reset to 0
  		var dayOfTheWeek = date.getDay(); // 0=Sunday, 1=Monday
  		// set startDate on Monday 
  		this.startDate = YAHOO.widget.DateMath.subtract(date, YAHOO.widget.DateMath.DAY, dayOfTheWeek-1);	
  		this.endDate = DateMath.add(this.startDate, DateMath.DAY, 4); 	// set on Friday
  			 		
  		this.setLayout(new AFM.planboard.WorkWeekResourceLayout(this));
  		
  		this.progressWindow.show();   
  		window.scheduleView = this;	 	
  	 	window.setTimeout(this.renderEntries, 1);    	  		  
  	},  
  	
  	/**
  	 * when selecting a week layout.
  	 */
  	onSelectWeek: function(e, date) {  
  		// set dates and reload entries		  		 
  		this.unloadEntries(); 
  		
  		date = DateMath.clearTime(date);
  		var dayOfTheWeek = date.getDay();
  		
  		this.startDate = YAHOO.widget.DateMath.subtract(date, YAHOO.widget.DateMath.DAY, dayOfTheWeek-1);	
  		this.endDate = DateMath.add(this.startDate, DateMath.DAY, 6); 	
  			 		
  		this.setLayout(new AFM.planboard.WeekResourceLayout(this, AFM.planboard.STYLES.EU_7_DAYS));
  	  	   		
  		this.progressWindow.show();   
  		window.scheduleView = this;	 	
  	 	window.setTimeout(this.renderEntries, 1);    	  		  
  	},  	 
  	
  	/**
  	 * when selecting a month layout.s
  	 */
  	onSelectMonth: function(e, date) {   
  		this.unloadEntries(); 	
  		    			
  		this.startDate = DateMath.findMonthStart(date);
  		this.endDate = DateMath.findMonthEnd(date);  	  		  		
  		
  		this.setLayout(new AFM.planboard.MonthResourceLayout(this)); 
  		
  		this.progressWindow.show();   
  		window.scheduleView = this;	 	
  	 	window.setTimeout(this.renderEntries, 1);   	
  	},
  	  
  	/**
  	 * Open popup window when a resource label is clicked.
  	 */   	
  	onSelectResource: function(e, resource) {
  		var restriction = {
  			"cf.cf_id" : resource.getProperty("cf.cf_id"),
  			"wrcf.cf_id" : resource.getProperty("cf.cf_id")      			
  		}
  		View.openDialog("ab-ondemand-planningboard-cf.axvw", restriction, false);
  	}, 
  
  	  	
  	onNextWeek: function(e) {  		
  		this.unloadEntries();
  		
  		this.startDate = DateMath.add(this.startDate, DateMath.DAY, 7); 
  		this.endDate = DateMath.add(this.endDate, DateMath.DAY, 7);   
  		
  		this.refresh();
  		  		
  		this.progressWindow.show();   
  		window.scheduleView = this;	 	
  	 	window.setTimeout(this.refreshEntries, 1);    
  	},

  	onPreviousWeek: function(e) {
  		this.unloadEntries();
  		
  		this.startDate = DateMath.subtract(this.startDate, DateMath.DAY, 7); 
  		this.endDate = DateMath.subtract(this.endDate, DateMath.DAY, 7);   
  	 	
  	 	this.refresh();
  	    	
  	    this.progressWindow.show();   	 	
  	 	window.scheduleView = this;	 	
  	 	window.setTimeout(this.refreshEntries, 1);   
  	},
  	
  	onPreviousDay: function(e) {
  		this.unloadEntries();
  		
  		this.startDate = DateMath.subtract(this.startDate, DateMath.DAY, 1); 
  	 	this.endDate = DateMath.subtract(this.endDate, DateMath.DAY, 1);   		 
  	   	 	
  		 this.progressWindow.show();   	 	
  	 	 window.scheduleView = this;	 	
  	 	 window.setTimeout(this.refreshEntries, 1);   
  	},		
  
  	onNextDay: function(e) {
  		this.unloadEntries();
  		
  		this.startDate = DateMath.add(this.startDate, DateMath.DAY, 1); 
  		this.endDate = DateMath.add(this.endDate, DateMath.DAY, 1); 
  	   	 	
  		this.progressWindow.show();   	 	
  	 	 window.scheduleView = this;	 	
  	 	 window.setTimeout(this.refreshEntries, 1);   
  	},		
  	
  	onPreviousMonth: function(e) {  		
  		this.unloadEntries();
  		
  		this.startDate = DateMath.subtract(this.startDate, DateMath.MONTH, 1); 
  		this.endDate = DateMath.subtract(this.endDate, DateMath.MONTH, 1);   		
  	   	 	
  		this.progressWindow.show();   	 	
  	 	window.scheduleView = this;	 	
  	 	window.setTimeout(this.refreshEntries, 1);   
  	},		
  
  	onNextMonth: function(e) {
  		this.unloadEntries();
  		
  		this.startDate = DateMath.add(this.startDate, DateMath.MONTH, 1); 
  		this.endDate = DateMath.add(this.endDate, DateMath.MONTH, 1); 
  		 	
  		this.progressWindow.show();   	 	
  	 	window.scheduleView = this;	 	
  	 	window.setTimeout(this.refreshEntries, 1);   
  	},		
  	
  	/** 
  	 * the render function clears the schedule and re-render all contents
  	 */
    renderEntries: function() {  	
    	window.scheduleView.render(); 	
  		window.scheduleView.loadEntries(); // reload for new period	   	
  		   		   
   		window.scheduleView.progressWindow.hide(); 	   		
   		window.scheduleView.onResize();		
  	},  
  	 
  	/**
  	 * refreshing only entries, the grid remains
  	 */  	
  	refreshEntries: function() {  	   
  		window.scheduleView.loadEntries(); // reload for new period
  		window.scheduleView.refresh();	
  		   
  		// when finished hide the progress bard
  		window.scheduleView.progressWindow.hide();   		
  		window.scheduleView.onResize();		
  	},
  	
   	/**
   	 * Loading data functions.
   	 * 
   	 * 
   	 */
   	loadResourceGroups: function() {
 
		var fieldNames = ["tr.tr_id","tr.description", "tr.std_hours_avail", "tr.rate_hourly"];
			
   		var parameters = {
   			tableName: "tr",
   			fieldNames: toJSON(fieldNames),
			//KB3044815 - restriction trade only show records that associated craftsperson
			restriction: 'exists(select 1 from cf where cf.tr_id = tr.tr_id and '+ Workflow.callMethod('AbBldgOpsOnDemandWork-Schedule-getCraftspersonsRestriction').message+")" 

   		};
   		
   		var records = AFM.planboard.ScheduleController.loadRecords(parameters); 
		 
		for (var i=0; i < records.length; i++) {
			var tr_id = records[i]["tr.tr_id"];
			var trade = new AFM.planboard.Trade( {"tr.tr_id": tr_id}, records[i]);
			this.addResourceGroup(trade);	 
		}   
		
   	},
   	
   	loadResources: function() {
   		var records = AFM.planboard.ScheduleController.loadCraftspersons();
   			
		for (var i=0; i < records.length; i++) {
			var cf_id = records[i]["cf.cf_id"];
			var tr_id = records[i]["cf.tr_id"];
		
			var craftsperson = new AFM.planboard.Craftsperson( {"cf.cf_id": cf_id},  records[i], false, this);		 
			this.addResource(craftsperson);	 
						
			var resourceGroup = this.getResourceGroup({"tr.tr_id": tr_id});			
			if (resourceGroup != null) {
				resourceGroup.addResource(craftsperson);	
			} 							
		}
   	},
   	
   	unloadEntries: function() {    		
		for (var i=0; i < this.resources.length; i++) {
   			this.resources[i].destroyAllEntries(); 
   		}
   		
   		this.scheduleEntries.length = 0; // it should be empty by now  
   	},   	
   	
   	/**
   	 * Load the schedule entries (assignments).
   	 */
   	loadEntries: function() {     		   		
   		// always pass dates in iso format : yyyy-mm-dd
		var filter = {"startDate": AFM.planboard.DateUtil.getIsoFormatDate(this.startDate), 
						"endDate": AFM.planboard.DateUtil.getIsoFormatDate(this.endDate) }
		
		var records = AFM.planboard.ScheduleController.loadAssignments( filter );	
						
		for (var i=0; i < records.length; i++) {
			var record = records[i];
	 		var cf_id = records[i]["wrcf.cf_id"]; 
	 		var wr_id = records[i]["wrcf.wr_id"]; 
	 		var tr_id = records[i]["wrcf.scheduled_from_tr_id"]; 	
	 		
	 		var date_assigned = AFM.planboard.DateUtil.getDateValue(records[i]["wrcf.date_assigned"]); 
	 		records[i]["wrcf.date_assigned"] = date_assigned;
	 		var time_assigned = AFM.planboard.DateUtil.getTimeValue(records[i]["wrcf.time_assigned"]);
	 		records[i]["wrcf.time_assigned"] = time_assigned;
	  
	 		var resource = this.getResource({"cf.cf_id": cf_id});	// it should always be found	 		
	 		var duration = records[i]["wrcf.hours_est"]; 	 	
	 		
	 		if (resource != null) { // this should be true	 		 			
	 			if (tr_id === "") {
	 				tr_id = resource.getProperty("cf.tr_id"); // take the trade from this craftsperson
	 			} 		
	 			var trade = this.getResourceGroup({"tr.tr_id": tr_id});
	 			// the task can be null if there is no estimation
	 			var task = this.getTask({"wrtr.wr_id": wr_id, "wrtr.tr_id": tr_id});	
	 			// the work request is null if this is not in my planning list
	 			var workRequest = this.getWorkRequest({"wr.wr_id": parseInt(wr_id)});
	 			var editable = true;
	 				 			
	 			if (workRequest == null) {
	 				var id = {"wr.wr_id":wr_id};
	 				var wr_values = {"wr.wr_id":wr_id};
	 							
	 				workRequest = new AFM.planboard.WorkRequest(id, wr_values, false);
	 				editable = false;
	 			}
	 		 			
	 			// get Date object	
		 		var dateStart = AFM.planboard.DateUtil.convertIsoFormatToDate(date_assigned, time_assigned);
		 	 	 	
		 		var id = {"wrcf.wr_id": wr_id, "wrcf.cf_id": cf_id, "wrcf.date_assigned": date_assigned, "wrcf.time_assigned": time_assigned };
	 				 		
		 		var wrcf_values = {}; 
 				  			 				 
 				for (var key in record) {
 					if (key.indexOf("wrcf.") == 0)
 						wrcf_values[key] = record[key]; 	 						
 				}	
		 			 		
		 		var assignment = new AFM.planboard.Assignment(id, wrcf_values, false, this, workRequest, task, resource, editable); // default constructor
		 		assignment.setData(resource, dateStart, duration); // initialize with reference objects
		 		 
		 		this.fireEvent("loadEntry", assignment); // fire event to notify event listeners
	 			
	 		} else {
	 			alert("Resource not found for " + cf_id);
	 		}	 		 			 		
	 			 	 		 	
		}	
   	},
   	
   	/**
   	 * Load the work requests.
   	 */
   	loadWorkRequests: function() {
   		var records = AFM.planboard.ScheduleController.loadWorkRequests({},this.supervisorRestriction,this.workteamRestriction,this.scheduleRestriction);
   		 		
		for (var i=0; i < records.length; i++) {
			var wrValues = records[i];
			var wr_id = wrValues["wr.wr_id"];
			 			
			// load wr values and tasks
			/*var data = AFM.planboard.ScheduleController.loadWorkRequestDetails(wr_id);
			var wrValues = data.details;*/	 
			
			var workRequest = new AFM.planboard.WorkRequest( {"wr.wr_id": wr_id}, wrValues, false, this);
					
			var days = eval ('(' + "[" + wrValues["wr.serv_window_days"] + "]" + ')');
			var startTime = AFM.planboard.DateUtil.getTimeValue(wrValues["wr.serv_window_start"]);
			var endTime = AFM.planboard.DateUtil.getTimeValue(wrValues["wr.serv_window_end"]);
			
			workRequest.setServiceWindow(new AFM.planboard.ServiceWindow(days, startTime, endTime));
			
			this.addWorkRequest(workRequest);	
			
		 	
		 	for(var j=0; j<wrValues.tasks.length; j++) {
		 	 	var taskValues = wrValues.tasks[j];	 				 		
		 	 		 				 		
		 		var tr_id = taskValues["wrtr.tr_id"];
		 		// constructor with id and values
		 		var trade = this.getResourceGroup({"tr.tr_id": tr_id});
		 		var duration = taskValues["wrtr.hours_est"];
		 		// create the estimated task for this trade
		 		var id = {"wrtr.wr_id":wr_id, "wrtr.tr_id": tr_id};
		 		 		 		
		 		var task = new AFM.planboard.Task(id, taskValues);
		 		task.init(workRequest, trade, duration);		 		
		 						 
				this.addTask(task);
				workRequest.addTask(task);
			}	 				 	 
		}
   	},
   	
   	loadSites: function() {
   		
   		var fieldNames = ['site.site_id','site.name'];
   		
   		var parameters = {
   			tableName: "site",
   			fieldNames: toJSON(fieldNames)
   		};
   		
   		var records = AFM.planboard.ScheduleController.loadRecords(parameters);
		 
		for (var i=0; i < records.length; i++) {
			this.addSite(records[i]);
		}   		
   	},
   	
   	getSupervisorAndWorkTeamRestriction: function() {
   		var result = AFM.planboard.ScheduleController.loadSupervisorAndWorkTeam();
   		this.supervisorRestriction = result.supervisorrestriction;
   		this.workteamRestriction = result.workteamrestriction;
   		this.scheduleRestriction = result.schedulingrestriction;   		
   	},
		
	/**
	 * Adding items to lists (arrays)
	 */	
		
	addSite: function(site) {		
		this.sites.push(site);		
	},
	
	addWorkRequest: function(workRequest) {		
		this.workRequests.push(workRequest); 
	},
		
	addResourceGroup: function(resourceGroup) {
		// this.resourceGroups[resourceGroup.getId()] = resourceGroup;	
		this.resourceGroups.push(resourceGroup);  
	},
	
	addResource: function(resource) {
		// add resource to resources	
		// this.resources[resource.getId()] = resource;		
		this.resources.push(resource); 
	},
	
	addTask: function(task) {
		this.tasks.push(task); 
	},	
	
	addEntry: function(entry) {
		this.scheduleEntries.push(entry); 
	},	
		
	addEntries: function(entries) {
		// add entries to resources
		if (entries.constructor == Array) {
			// this.scheduleEntries.concat(entries);
			for (var i=0; entries.length; i++) {
				this.addEntry(entries[i])
			}
		}
	},
 	
	addToList:  function(list, item) {
		list.push(item);
	},
	
	removeFromList: function(list, item) {
		if (list.length == 0) return;
		for (var i=0; i<list.length; i++) {
			if (item.compare(list[i])) {				
				// list[i].destroy();
				list.splice(i,1); return i; // break and return break;
			}
		}
	},
	
	getFromList: function(id) {
		if (list.length == 0) return null;
		for (var i=0; i<list.length; i++) {
			if (item.compare(list[i])) {
				return list[i]; 
			}
		}
	},
	
	removeEntry: function(entry) {
		if (this.scheduleEntries.length == 0) return;
		for (var i=0; i<this.scheduleEntries.length; i++) {
			if (entry.compare(this.scheduleEntries[i])) {
				this.scheduleEntries[i].destroy(); // we don't need it anymore
				this.scheduleEntries.splice(i,1); // remove from main list
				return i; // break and return
			}
		}
	},
	 
	
	setLayout: function(layout) {
		if (this.layout != null) this.layout.destroy();		
		this.layout = layout;
	}, 
	
	
	/**
	 * Lookup items in lists.
	 * 
	 * 
	 */
	getWorkRequest: function(id) {
		for (var i=0; i<this.workRequests.length; i++) {			
			if (this.workRequests[i].compareId(id)) {
				 return this.workRequests[i];	
			} 
		}
		return null;
	},
	
	getResource: function(id) {
		// return this.resources[id];
		for (var i=0; i<this.resources.length; i++) {			
			if (this.resources[i].compareId(id)) {
				 return this.resources[i];	
			} 
		}
		return null; 
	},
	
	getResourceGroup: function(id) {
		// return this.resourceGroups[id];
		for (var i=0; i<this.resourceGroups.length; i++) {
			if (this.resourceGroups[i].compareId(id)) {
				 return this.resourceGroups[i];	
			}  
		}
		return null; 
	}, 
	// lookup for task
	getTask: function(id) {
		for (var i=0; i<this.tasks.length; i++) { 
			if (this.tasks[i].compareId(id)) return this.tasks[i];
		}
		return null;
	},

	/**
	 * Create Entry. 
	 * 
	 *  the task can be NULL for dummy tasks
	 *  after creating an entry, the validate function should be called.
	 *  When invalid, a destroy event should be fired !
	 * 
	 * This function create a schedule entry from data references.
	 * 
	 * @param resource
	 * @param startDate
	 * @param duration
	 * @param workRequest
	 * @param task 
	 * 
	 */
	createEntry : function(resource, startDate, duration, workRequest, task) {		
		var scheduled_from_tr_id;
		if (task != null) {
			scheduled_from_tr_id = task.getProperty("wrtr.tr_id");
		} else if (resource != null) {
			scheduled_from_tr_id = resource.getProperty("cf.tr_id");
		} else {
			View.showMessage($_('resourcenotexist'));
			return null;
		}	
			 			
		var id = {
			"wrcf.wr_id": workRequest.getProperty("wr.wr_id"), 
			"wrcf.cf_id": resource.getProperty("cf.cf_id"),
			"wrcf.date_assigned": AFM.planboard.DateUtil.getIsoFormatDate(startDate), 
			"wrcf.time_assigned" : AFM.planboard.DateUtil.getIsoFormatTime(startDate) 
		};
		
		var values = {
			"wrcf.wr_id": workRequest.getProperty("wr.wr_id"), 
			"wrcf.cf_id": resource.getProperty("cf.cf_id"),
			"wrcf.date_assigned": AFM.planboard.DateUtil.getIsoFormatDate(startDate), 
			"wrcf.time_assigned" : AFM.planboard.DateUtil.getIsoFormatTime(startDate),
			"wrcf.hours_est": duration, 
			"wrcf.scheduled_from_tr_id": scheduled_from_tr_id , 
			"wrcf.work_type" : "W", "wrcf.comments" : ""
		};	
		
		// this is a new record
		var newEntry = new AFM.planboard.Assignment(id, values, true, this, workRequest, task);							
		newEntry.setData(resource, startDate, duration);	
		newEntry.updateId();  
		
		var config = {
			className: newEntry.getStatus(),
			editable: true
		}; 
		
		newEntry.setRenderer(new AFM.planboard.EntryRenderer(newEntry, config));
	 		
		return newEntry;  	
	},	

	/**
	 * Load all data when initializing the planning board.
	 */
	loadData: function() {
		this.getSupervisorAndWorkTeamRestriction();
		
		// in the right order !!!	 
		// load resources groups (trades)
		this.loadResourceGroups();		
		// 	load all craftspersons that can assign work to, for my team
		this.loadResources();		
		// load my work requests
		this.loadWorkRequests();		
		// load all entries for this period		
		this.loadEntries();		
		
		//reload tree with restrictions
		this.onReloadTree();
	},
	
	/**
	 * Refreshing the layout only renders the new loaded entries.
	 * Also the timeline is refreshed.
	 * 
	 */
	refresh: function() {
		this.layout.refresh();
	},
	/**
	 * Render the layout containers and entries.
	 */
	render: function() {  	
		this.layout.render(this.container);
	},	
	
	/**
	 * After assigning a layout, the view can be built.
	 * 
	 * @param {boolean} debug
	 * 
	 * <ul>
	 * 		<li>If debug, create the debug logger</li>
	 * 		<li>Load all data</li>
	 * 		<li>Create and Render the navigation tree</li>
	 * 		<li>Render the layout</li>
	 * </ul> 
	 * 
	 */
	build: function(debug) {
		if (debug !== undefined) {
			this.debug = debug;
			if (this.debug)
				this.logger = new YAHOO.widget.LogReader("logger"); 		
		}
		
		this.loadData();
		
		//remove the left tree.
		//this.treeView = new AFM.planboard.TreeView("tree_panel", $_('treeTitle'), this); 
		//this.treeView.render();		
		
		this.render();
		
		// resize two times ?? for IE explorer bug, scrolling frame
		this.onResize();		 
	}
	
});
YAHOO.augment(AFM.planboard.ScheduleView, YAHOO.util.EventProvider);


/**
 * The Schedule Controller only has static (class) methods
 */
AFM.planboard.ScheduleController = {  
 	
	saveRecord: function(record) {
		var result = {};
		try {
			 result = Workflow.callMethod(AFM.planboard.ScheduleController.WORKFLOW_RULE_SAVE, record.tableName, record.fieldNames, record.getFieldValuesAsStrings(), record.getOldFieldValuesAsStrings(), record.isNewRecord);
		}catch(e){
			Workflow.handleError(result);			
		}
		if (result.code == 'executed') { 			 
			record.scheduleView.fireEvent("commit", record);	 	
			record.scheduleView.fireEvent("updateTree", result.data);	
			 
		} else {
			
			record.scheduleView.fireEvent("rollback", record);	 
			record.scheduleView.fireEvent("updateTree", result.data);	
						
			var dialog = new YAHOO.widget.Dialog("confirmDialog", 
			{ 
			  width: "500px",	
			  fixedcenter:true, 
			  constraintoviewport: true,  
			  modal: true,
			  visible : false,
			  draggable: false
			 } );
		 
			dialog.setHeader($_('errorsSaveRecord'));
			// set body content
			dialog.setBody(result.message);			
			dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_ALARM);
			
			var okText = " "+ $_("validateOk")+" ";  		   
	    	dialog.cfg.queueProperty("buttons", [ { text:okText, 
					handler: {fn: this.destroyDialog, obj: dialog, scope: this} } ]); 
					
			dialog.render(document.body);
			dialog.show();	 
		}
	}, 
 
    // workaround a 'bug' in dialog destroy method 
	destroyDialog: function(e, dialog) {
		YAHOO.widget.Dialog.superclass.destroy.call(dialog);  
		 
		var panel = $("confirmDialog_c"); 
		if (panel != null ) panel.parentNode.removeChild(panel); 	
		panel = $("confirmDialog_mask"); 
		if (panel != null) panel.parentNode.removeChild(panel); 	
	}, 
	
	removeRecord: function(record) {		
		var records = [];
		records.push(record.fieldValues); // strictly only primary key, but we also send the scheduled_from_tr_id	 
		var result = {};
		try {
			 result = Workflow.callMethod(AFM.planboard.ScheduleController.WORKFLOW_RULE_DELETE, record.getTableName(), records);
		}catch(e){
			Workflow.handleError(result);
		}
		if (result.code == 'executed') {	 				
			//record.scheduleView.fireEvent("updateTree", result.data);
			record.scheduleView.fireEvent("reloadTree", result.data);
		} else {			 
			Workflow.handleError(result);		
		}
	}, 
	
	loadRecords: function(parameters) {
		var result = Workflow.runRuleAndReturnResult(AFM.planboard.ScheduleController.WORKFLOW_RULE_LOAD, parameters);
	
		if (result.code == 'executed') { 
			var data = result.data; 
			return data.records; // do not return result.data !!!
		} else {
			Workflow.handleError(result);		
		}	
	},
	
	loadHolidays:  function(site_id, year) {	
		var siteId = site_id;
		
		if (!valueExists(site_id)) {
			siteId = "0";
		}
	var result = {};
	try{
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-getHolidays", siteId,year);
		}catch(e){
			Workflow.handleError(e);
			}
	
		if (result.code == 'executed') {  
			return result.data; 
		} else {
			Workflow.handleError(result);		
		}
	
	},	
	
	loadAssignments: function(filter) {
		var result = {};
		if (filter === undefined) filter = {};
		
		try{
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-getAssignments", filter);
			}catch(e){
			Workflow.handleError(e);
			}
		if (result.code == 'executed') {  
			//return result.data;
			var records = [];
			for (var i=0; i < result.data.records.length; i++) {
				var originalRecord = result.data.records[i];
				var record = {};
				for (var name in originalRecord) {
					record[name] = originalRecord[name]['n'];
				}
				records[i] = record;
			}
			return records; 
		} else {
			Workflow.handleError(result);		
		}	
	},
	
	loadCraftspersons:  function() {
		var filter = {};
		var result = {};
		try{
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-getCraftspersons");
		}catch(e){
			Workflow.handleError(e);
			}
		if (result.code == 'executed') {  
			return result.data;
		} else {
			Workflow.handleError(result);		
		}
	
	},
	
	loadTrades:  function() {	
		var result = {};
		try{
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-getTrades");
			}catch(e){
			Workflow.handleError(e);
			}
		if (result.code == 'executed') {  
			return result.data;	 
		} else {
			Workflow.handleError(result);		
		}
	
	},
	
	loadWorkRequests: function(restriction,supervisorRestriction,workteamRestriction,scheduleRestriction) {
		var result = {};
		try{
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-filterWorkRequests", restriction,supervisorRestriction,workteamRestriction,scheduleRestriction);
	 	}catch(e){
			Workflow.handleError(e);
		}
		if (result.code == 'executed') {  
			return result.data;
		} else {
			Workflow.handleError(result);
		}		
	},
	
	loadWorkRequestDetails: function(wr_id) {
		var result = {};
		try{
			result =Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-getWorkRequestDetails",  wr_id);
		}catch(e){
			Workflow.handleError(result);		
		}
		if (result.code == 'executed') {  	 
			return result.data;
		} else {
			Workflow.handleError(result);		
		}		
	}, 
	loadSupervisorAndWorkTeam: function(){
		var result = {};
		try{
			result = Workflow.callMethod("AbBldgOpsOnDemandWork-Schedule-getSupervisorAndWorkteamForPlanning");
		} catch(e){
			Workflow.handleError(result);		
		}
		if (result.code == 'executed') {  	 
			return result.data;
		} else {
			Workflow.handleError(result);		
		}		
	},
	
	
	// ----------------------- constants ---------------------
	
	// name of the default WFR used to get records
    WORKFLOW_RULE_LOAD: 'AbCommonResources-getDataRecords',
       
    // name of the default WFR used to save the record
    WORKFLOW_RULE_SAVE: 'AbBldgOpsOnDemandWork-Schedule-saveAssignment',
    
    // name of the default WFR used to delete the current record
    WORKFLOW_RULE_DELETE: 'AbBldgOpsOnDemandWork-Schedule-removeAssignments',
    
    VIEWFILE_CF_DETAILS: 'ab-ondemand-planningboard-cf.axvw',
    
    WF_RULE_LOAD_SITES: '',
    WF_RULE_LOAD_RESOURCE_GROUPS: '',
    WF_RULE_LOAD_RESOURCES: '',
    WF_RULE_LOAD_WORK_REQUESTS: '',
    WF_RULE_LOAD_ASSIGNMENTS: '',
        
    BUTTON_SELECT_TRADES: 'selectTrades',
    BUTTON_FILTER: 'filter_button',
    FILTER_FORM: 'filter_form',
    TREE_PANEL: 'tree_panel'				

}

/**
 * These styles are used in the layout. 
 */
AFM.planboard.STYLES = {	
	EU_7_DAYS: {days: 7, intervals: 7, interval: DateMath.DAY},
	EU_5_DAYS: {days: 5, intervals: 5, interval: DateMath.DAY},
	US_7_DAYS: {days: 7, intervals: 7, interval: DateMath.DAY},
	US_5_DAYS: {days: 5, intervals: 5, interval: DateMath.DAY},
	
	MONTH_31: {start: 1, end: 31, intervals: 31, interval: DateMath.DAY},
	DAY_7H_18H: {start: 7, end: 18, intervals: 12, interval: DateMath.HOUR, placement: "absolute", appendEntries: "container"}
};





AFM.namespace('planboard');

/**
 * wrap up of a tree text node, with Web Central label text style sheets
 */
AFM.planboard.TextNode = Base.extend({		
	// non-primary key visible field label format
   	cssClassName: 'ygtvlabel',      // default to YUI label
    // primary key visible field label format
   	cssPkClassName: 'ygtvlabel_pk',    
   	
   	key: "",
   	data: "",
   	
   	contextMenu: null, // context menu reference
	
	constructor: function(key, data, parentNode, expanded) {
		// new YAHOO.widget.TextNode("Problem Type - " + prob_type, tree.getRoot(), false);			
		this.init(key, parentNode, expanded);		 
		
		  // compose the label text field using the primary keys 
        var labelText = "<span class='" + this.cssPkClassName + "'>" + key + "</span>";
        if (data != '' && data != undefined){
        	labelText = labelText + "<span class='" + this.cssClassName + "'> - " + data + "</span>";
      	}
        // set the label
        this.setUpLabel(labelText);    
         
	}, 
	
	destroy: function() {
		if (this.contextMenu != null) {
			this.contextMenu.destroy();
		}
		
		for (var k=0; k< this.children.length; k++) {
			var child = this.children[k];			 
			child.destroy();
		}	
	}
	
});

YAHOO.augment(AFM.planboard.TextNode, YAHOO.widget.TextNode);

/**
 * The work request node in the tree component.
 * 
 * The work request node receives a context menu.
 * 
 */
AFM.planboard.WorkRequestNode = AFM.planboard.TextNode.extend({	
	scheduleView: null,
	workRequest: null,
	contextMenu: null,
	
	constructor: function(key, data, parentNode, expanded, workRequest, scheduleView) {
		this.inherit(key, data, parentNode, expanded);  
		this.workRequest = workRequest;			
		this.scheduleView = scheduleView;      
	}, 
	
	draw: function() {
		this.inherit.call(this);
		
		var contextMenu = new YAHOO.widget.ContextMenu("wr-" + this.getLabelEl().id +"-cm", { trigger: this.getLabelEl()} );	
		contextMenu.addItem($_('contextmenuShowInfo'));	  
		contextMenu.addItem($_('contextmenuHighlightEntries')); 
		contextMenu.addItem($_('contextmenuClearAllHighlights')); 
	
		contextMenu.render(document.body);	
									
		contextMenu.clickEvent.subscribe(this.onContextMenuClick, this, true);	
		
		this.contextMenu = contextMenu;		
	},
	
	
	onContextMenuClick: function(p_sType, p_aArgs) {
		// alert(p_sType); shows click			 
		var task = p_aArgs[1];
		
		if (task) {
			
			switch(task.index) { 
				case 0:
					this.displayForm();	 						 
				break;
				case 1:
					this.highlightEntries();
				break;
				case 2:	
					this.clearAllHighlights();
				break; 
				case 3:	
					this.addHighlights();
				break; 	
				case 4:	
					this.removeHighlights();
				break; 		
			}							
		} // end if			
		
	},			 
	
	displayForm: function() {	
		document.forms["wr_form"].style.display = "block";
			
		/*
		var frm = AFM.view.View.getControl('', this.controlPanel);	
		var formFieldNames = frm.getFieldNames();
		
		for (var i=0; i<formFieldNames.length; i++) {
		    var key = formFieldNames[i]; 
		    if (fieldValues[key] !== undefined)
				frm.setFieldValue(key, String(fieldValues[key]), String(fieldValues[key]) );
		} 
		 */
		/*var restriction = {"wr.wr_id" : String(this.workRequest.getProperty("wr.wr_id")) };	 			
		 			
		AFM.view.View.getControl('', "panel_request").refresh( restriction, false);	
		AFM.view.View.getControl('', "panel_location").refresh( restriction, false);	
		AFM.view.View.getControl('', "panel_equipment").refresh( restriction, false);	
		AFM.view.View.getControl('', "panel_description").refresh( restriction, false);	
		AFM.view.View.getControl('', "panel_estimation").refresh( restriction, false);	*/
				 	
		this.setFieldValues("panel_request");	
		this.setFieldValues("panel_location");	
		this.setFieldValues("panel_equipment");	
		this.setFieldValues("panel_description");	
		this.setFieldValues("panel_estimation");			
	},
	
	setFieldValues: function(id) {
		var frm = AFM.view.View.getControl('', id);			
		var fieldNames = frm.getFieldNames();
		var fieldValues = this.workRequest.fieldValues;
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];            
            if (fieldName == "wr.time_escalation_response" || fieldName == "wr.time_escalation_completion") {
            	var displayValue = fieldValues[fieldName].substr(0, fieldValues[fieldName].indexOf('.'));
           		frm.setFieldValue(fieldName, displayValue, displayValue );
            } else {
            	frm.setFieldValue(fieldName, String(fieldValues[fieldName]), String(fieldValues[fieldName]));
            }            	
        }      		
	},
	
	highlightEntries: function() {			
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			if (entries[i].getProperty("wrcf.wr_id") == this.workRequest.getProperty("wr.wr_id")) {
				var el = entries[i].entryRenderer.element; 
				Dom.removeClass(el, "dimmed");
			} else {
				var el = entries[i].entryRenderer.element;
				Dom.addClass(el, "dimmed");
			}
		}
	},
	
	addHighlights: function() {
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			if (entries[i].getProperty("wrcf.wr_id") == this.workRequest.getProperty("wr.wr_id")) {
				var el = entries[i].entryRenderer.element; 
				Dom.removeClass(el, "dimmed");
			}
		}
	},	
	
	removeHighlights: function() {
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			if (entries[i].getProperty("wrcf.wr_id") == this.workRequest.getProperty("wr.wr_id")) {
				var el = entries[i].entryRenderer.element; 
				Dom.addClass(el, "dimmed");
			}
		}
	},	
	
	clearAllHighlights: function() {
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			//if (entries[i].getProperty("wrcf.wr_id") == this.workRequest.getProperty("wr.wr_id")) {
				var el = entries[i].entryRenderer.element; 
				Dom.removeClass(el, "dimmed");
			// }
		}
	}, 
	
	destroy: function() {
		if (this.contextMenu != null) {
			this.contextMenu.destroy();
		}
			 
		this.scheduleView = null;
		this.workRequest = null;		 
	}	
	
});

YAHOO.augment(AFM.planboard.TextNode, YAHOO.widget.TextNode);
 

/**
 * The task node is a HTML node with drag and drop functionalities.
 */
AFM.planboard.TaskNode = Base.extend({		
	dd: null,
	ddGroup: "default",
	maxWidth: 200, // this is the standard task width in pixels.
	scheduleView: null,
	// contextMenu: null,
	
	constructor: function(workRequest, task, parentNode, restrictGroup) {				
		// if (task === undefined) this.buildDefaultLeaf(node, workRequest);
		
		var id = "tasknode_" + AFM.planboard.TaskNode.counter++;		
		
		if (task == null) {
		 	var html = '<div id="'+ id +'" class="task NEW" title="'+$_('treeNewTask')+'">'+$_('treeNewTask')+'</div>';	 
			var data = {html: html};
 	 
 	 		this.init(data, parentNode, false, false);	
			this.initContent(data, false);					
			// create drag and drop
			this.dd = new AFM.planboard.DDDummyTask(workRequest, id, this.ddGroup);		
		} else {	
			task.nodeId = id;
			task.node = this;
			
			var hours_sched = task.getProperty("wrtr.hours_sched") == "" ? 0 : task.getProperty("wrtr.hours_sched");
			var hours_est = task.getProperty("wrtr.hours_est");
					
			var txt = task.getProperty("wrtr.tr_id") + " (" + hours_est + " h)";  
						
			var title = $_('taskTitle', task.getProperty("wrtr.tr_id"), task.duration, workRequest.getProperty("wr.site_id") );
			 		
			var className = workRequest.getProperty("wr.status"); 							 
			var width = (hours_est > hours_sched) ? parseInt(this.maxWidth * hours_sched/hours_est, 10) : this.maxWidth;
			 						 		 
			var html = '<div id="'+ id +'" class="task '+className+'" title="'+title+'">'+txt+'</div>';
			
			this.progressId = id +'_progress';
			 	
			var progress = '<div id="'+ id +'_progress" class="progress" style="width: '+width+'px;"> </div>';					
			var wrapper = '<div class="wrapper" title="'+title+'">' + html + progress + '</div>';	
	 		
	 		var data = {html: wrapper};
	 	 
			// initialize the HTML node 
			this.init(data, parentNode, false, false);	
			this.initContent(data, false);					 
				
			// create drag and drop
			this.dd = new AFM.planboard.DDTask(workRequest, task, id, this.ddGroup);
		}
		
		this.treeControl = 	parentNode.treeControl;
	},
	/**
	 * Set the progress bar width after response from the server.
	 * This indicates the percentage of the task already scheduled.
	 * 
	 */
	setProgressWidth: function(hours_est, hours_sched) {
	
		var progressEl = $(this.progressId);		
		var width = (hours_est > hours_sched) ? parseInt(this.maxWidth * hours_sched/hours_est, 10) : this.maxWidth;
	
		Dom.setStyle(progressEl, "width", width + "px");
	},
	
	destroy:  function() {
		if (this.dd != null) {
			this.dd.destroy(); 
		}
	}
	
} , {	
	counter: 0	// counter for node ids
});

YAHOO.augment(AFM.planboard.TaskNode, YAHOO.widget.HTMLNode);


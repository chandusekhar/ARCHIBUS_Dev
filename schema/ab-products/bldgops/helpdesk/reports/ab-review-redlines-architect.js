var treeConsoleRestriction = '';
var controller = View.createController("reviewRedlinesArchitectController",{
	
	labelDataSourceViewName: '',
	highlightDataSourceViewName: '',
	labelDataSourceName:'',
	highlightDataSourceName:'',
	labelsLoaded: false,
	highlightLoaded: false,
	dwgname: '',
	redlines: '',
	position:'',
	applyHLDSWithLabelDS: false,
	consoleRestriction: '',
	
	/**
	 * Add afterLoad eventListeners to hidden views for loading the label and highlight datasources
	 */
	afterViewLoad:function(){
		this.labelDSView.addEventListener('afterLoad',this.afterLabelDataSourcesLoaded.createDelegate(this));
		this.highlightDSView.addEventListener('afterLoad',this.afterHighlightDataSourcesLoaded.createDelegate(this));
		
		this.drawingPanel.appendInstruction("default", "", getMessage('selectDrawing'));
		this.drawingPanel.appendInstruction("ondwgload", "", getMessage('reviewRL'));
		
		 this.treePanel_dwgs.createRestrictionForLevel = function(parentNode, level) {
			 var consolePanel = View.panels.get("consolePanel");
			 var dateRequestedFrom = consolePanel.getFieldElement("afm_redlines.date_created.from").value;
			 var dateRequestedTo = consolePanel.getFieldElement("afm_redlines.date_created.to").value;
			 
			// validate the date range 
			if (valueExistsNotEmpty(dateRequestedFrom) && valueExistsNotEmpty(dateRequestedTo)) {
				// the compareLocalizedDates() function expects formatted (displayed) date values
				if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
					// display the error message defined in AXVW as message element
					alert(getMessage('error_date_range'));
					return;
				}
			}

			 var restriction = new Ab.view.Restriction();
			 if(level == 0){	
				 var dwg_name = consolePanel.getFieldValue('afm_redlines.dwg_name');
				 if(valueExistsNotEmpty(dwg_name)){
					 dwg_name = dwg_name.toUpperCase();
					restriction.addClause('afm_dwgs.dwg_name', "%"+dwg_name+"%", 'LIKE');
				 } else {
					 if(valueExistsNotEmpty(dateRequestedFrom) || valueExistsNotEmpty(dateRequestedTo) || valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log_hactivity_log.site_id"))
						 || valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.bl_id")) || valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.fl_id"))
						 || valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.prob_type")) || valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.activity_type"))){
						 treeConsoleRestriction = "0=0";
						 if(valueExistsNotEmpty(dateRequestedFrom)){
							 treeConsoleRestriction += " AND afm_redlines.date_created > '" +consolePanel.getFieldValue("afm_redlines.date_created.from")+"'";
							 
						 }
						 if(valueExistsNotEmpty(dateRequestedTo)){
							 treeConsoleRestriction += " AND afm_redlines.date_created < '" +consolePanel.getFieldValue("afm_redlines.date_created.to")+"'";
						 }
						 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.site_id"))){
							 treeConsoleRestriction += " AND activity_log_hactivity_log.site_id LIKE '%" +consolePanel.getFieldValue("activity_log_hactivity_log.site_id")+"%'";
						 }
						 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.bl_id"))){
							 treeConsoleRestriction += " AND activity_log_hactivity_log.bl_id LIKE '%" +consolePanel.getFieldValue("activity_log_hactivity_log.bl_id")+"%'";
						 }
						 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.fl_id"))){
							 treeConsoleRestriction += " AND activity_log_hactivity_log.fl_id LIKE '%"+consolePanel.getFieldValue('activity_log_hactivity_log.fl_id')+"%'";
						 }
						 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.prob_type"))){
							 treeConsoleRestriction += " AND activity_log_hactivity_log.prob_type LIKE '%" +consolePanel.getFieldValue("activity_log_hactivity_log.prob_type")+"%'";
						 }
						 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.activity_type"))){
							 treeConsoleRestriction += " AND activity_log_hactivity_log.activity_type LIKE '%" +consolePanel.getFieldValue("activity_log_hactivity_log.activity_type")+"%'";
						 }
						 var dwgDS = View.dataSources.get("reviewRedlinesTree_dwgsDS");
						 var records = dwgDS.getRecords(" EXISTS (SELECT dwg_name FROM afm_redlines WHERE afm_dwgs.dwg_name = afm_redlines.dwg_name AND " +
						 		" afm_redlines.activity_log_id IN (SELECT activity_log_id FROM activity_log_hactivity_log WHERE "+treeConsoleRestriction+"))");
						 if(records.length == 0){
							 restriction.addClause('afm_dwgs.dwg_name','NULL','=');
						 } else {
							 for(var i=0;i<records.length;i++){
								 restriction.addClause('afm_dwgs.dwg_name',records[i].values['afm_dwgs.dwg_name'].toUpperCase(),'=','OR');
							 }
						 }
						 
					 }
				 } 
			 } else if (level == 1){
				 restriction.addClause('afm_redlines.dwg_name', parentNode.data['afm_dwgs.dwg_name'].toUpperCase(), '=');
				 
					
				 if(valueExistsNotEmpty(dateRequestedFrom)){
					 restriction.addClause('afm_redlines.date_created',consolePanel.getFieldValue("afm_redlines.date_created.from"),'&gt;=');
				 }
				 if(valueExistsNotEmpty(dateRequestedTo)){
					 restriction.addClause('afm_redlines.date_created',consolePanel.getFieldValue("afm_redlines.date_created.to"),'&lt;=');
				 }
				 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.site_id"))){
					 restriction.addClause('activity_log_hactivity_log.site_id',"%"+consolePanel.getFieldValue('activity_log_hactivity_log.site_id')+"%",'LIKE');
				 }
				 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.bl_id"))){
					 restriction.addClause('activity_log_hactivity_log.bl_id',"%"+consolePanel.getFieldValue('activity_log_hactivity_log.bl_id')+"%",'LIKE');
				 }
				 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.fl_id"))){
					 restriction.addClause('activity_log_hactivity_log.fl_id',"%"+consolePanel.getFieldValue('activity_log_hactivity_log.fl_id')+"%",'LIKE');
				 }
				 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.prob_type"))){
					 restriction.addClause('activity_log_hactivity_log.prob_type',"%"+consolePanel.getFieldValue('activity_log_hactivity_log.prob_type')+"%",'LIKE');
				 }
				 if(valueExistsNotEmpty(consolePanel.getFieldValue("activity_log_hactivity_log.activity_type"))){
					 restriction.addClause('activity_log_hactivity_log.activity_type',"%"+consolePanel.getFieldValue('activity_log_hactivity_log.activity_type')+"%",'LIKE');
				 }
			 }
			 return restriction;
		 }
	},
	
	/**
	 * Filter tree.
	 */
	consolePanel_onShow:function(){	
		var dateRequestedFrom = this.consolePanel.getFieldElement("afm_redlines.date_created.from").value;
		var dateRequestedTo = this.consolePanel.getFieldElement("afm_redlines.date_created.to").value;
		
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			if (!compareLocalizedDates(dateRequestedFrom,dateRequestedTo)){
				alert(getMessage('error_date_range'));
				return;
			}
		}
		this.treePanel_dwgs.refresh();
	
	},
	
	/**
	 * Clear console panel
	 */
	consolePanel_onClear: function(){
		this.consolePanel.setFieldValue("activity_log_hactivity_log.site_id",'');
		this.consolePanel.setFieldValue("activity_log_hactivity_log.bl_id",'');
		this.consolePanel.setFieldValue("activity_log_hactivity_log.fl_id",'');
		this.consolePanel.setFieldValue("activity_log_hactivity_log.prob_type",'');		
		this.consolePanel.setFieldValue("afm_redlines.date_requested.from",'');	
		this.consolePanel.setFieldValue("afm_redlines.date_requested.to",'');
		this.consolePanel.setFieldValue("afm_redlines.dwgname",'');
		
		this.consolePanel_onShow();
	},
	
	/**
	 * Eventlistener called when label datasource view is loaded
	 */
	afterLabelDataSourcesLoaded: function(){
		this.drawingPanel.labelsDataSourcePanel = 'labelDSView';
		this.applyLabelDataSource();
	},
	/**
	 * Eventlistener called when highlight datasource view is loaded
	 */
	afterHighlightDataSourcesLoaded: function(){
		this.drawingPanel.highlightDataSourcePanel = 'highlightDSView';
		this.applyHighlightDataSource();	
	},
	/**
	 * Apply label datasource to drawing panel
	 */
	applyLabelDataSource:function(){
		this.drawingPanel.currentLabelsDS = this.labelDataSourceName;
		this.drawingPanel.labelsDataSource = this.labelDataSourceName;
		
		//var contentFrame = this.labelDSView.getContentFrame();
		var contentView = this.labelDSView.contentView;
		var labelDS = contentView.dataSources.get(this.labelDataSourceName);
		if(valueExists(labelDS)){
			
			var thisLabelDS = new Ab.data.DataSource(this.labelDataSourceName, labelDS.config);
			View.dataSources.add(thisLabelDS);
		}
	
		
		View.updateProgressBar(2/4);
		this.labelsLoaded = true;
		if(this.applyHLDSWithLabelDS){
		
			this.drawingPanel.highlightDataSourcePanel = 'labelDSView';
			this.applyHighlightDataSource();
	
		} else{
			this.loadHighlightDataSource();
		}
	},
	loadHighlightDataSource: function(){
		if(valueExistsNotEmpty(this.highlightDataSourceName)){
			if(valueExistsNotEmpty(this.highlightDataSourceViewName) && this.highlightDataSourceViewName != this.highlightDSView.fileName){
				this.highlightDSView.loadView(controller.highlightDataSourceViewName);
			} else {
				this.applyHighlightDataSource();
			}
		} else {
			this.drawingPanel.currentHighlightDS = null;
			this.drawingPanel.highlightDataSource = null;
			this.highlightLoaded = true;
			View.updateProgressBar(3/4);
			this.drawRedmarks();
		}
		
	},
	/**
	 * Apply highlight datasource to drawing panel
	 */
	applyHighlightDataSource:function(){
		this.drawingPanel.currentHighlightDS = this.highlightDataSourceName;
		this.drawingPanel.highlightDataSource = this.highlightDataSourceName;
		
		var contentView = null;
		if(this.applyHLDSWithLabelDS){
			contentView = this.labelDSView.contentView;
		} else {
			contentView = this.highlightDSView.contentView;
		}		
		var highlightDS = contentView.dataSources.get(this.highlightDataSourceName);
		if(valueExists(highlightDS)){
			var thisHighlightDS = new Ab.data.DataSource(this.highlightDataSourceName, highlightDS.config);
			View.dataSources.add(thisHighlightDS);
		}
		
		this.highlightLoaded = true;
		View.updateProgressBar(3/4);
		this.drawRedmarks();		
		
		
	},
	/**
	 * draw redmarks on drawing panel
	 */
	drawRedmarks: function(){
		var title = getMessage("reviewRL");
		
		if(valueExistsNotEmpty(this.highlightDataSourceName)){
			this.drawingPanel.applyDS('highlight');
			if(valueExistsNotEmpty(View.dataSources.get(this.highlightDataSourceName).title)){
				title += " - " +getMessage("highlights") + View.dataSources.get(this.highlightDataSourceName).title;
			}
		}
		if(valueExistsNotEmpty(this.labelDataSourceName)){
			this.drawingPanel.applyDS('labels');
			if(valueExistsNotEmpty(View.dataSources.get(this.labelDataSourceName).title)){
				title += " - " + getMessage("labels") + View.dataSources.get(this.labelDataSourceName).title;
			}
			
		}
		this.drawingPanel.appendInstruction("ondwgload", "", title);
		this.drawingPanel.appendInstruction("onredlinesload", "", title);
				
		var dcl = new Ab.drawing.DwgCtrlLoc(null,null,null,this.dwgname);
		var opts = new DwgOpts();
		opts.rawDwgName = this.dwgname;
    	opts.redmarks = this.redlines;    	
    	opts.position = this.position;
    	opts.multiple = false;
    	this.drawingPanel.drawRedmarks(opts);
    	View.updateProgressBar(4/4);
    	View.closeProgressBar();
	},
	
	/**
	 * Shows redlined drawing in the drawing controller
	 */
	showRedlinedDrawing: function(json){
		this.dwgname = json.dwgname.toLowerCase();
		this.redlines = json.redlines;
		this.position = json.position;
		
		
		if(valueExistsNotEmpty(json.labelds)){
			this.labelDataSourceName = json.labelds;
		} else {
			this.labelDataSourceName = null;
		}
		if(valueExistsNotEmpty(json.highlightds)){
			this.highlightDataSourceName = json.highlightds;
		} else {
			this.highlightDataSourceName = null;
		}
		if(valueExistsNotEmpty(json.labelds_view_name)){
			this.labelDataSourceViewName = json.labelds_view_name;
		} else {
			this.labelDataSourceViewName = null;
		}
		if(valueExistsNotEmpty(json.highlightds_view_name)){
			this.highlightDataSourceViewName = json.highlightds_view_name
		} else {
			this.highlightDataSourceViewName = null;
		}
				
		if(valueExistsNotEmpty(this.labelDataSourceViewName) && valueExistsNotEmpty(this.highlightDataSourceViewName) && this.labelDataSourceViewName == this.highlightDataSourceViewName){
			controller.applyHLDSWithLabelDS = true;
		} else {
			controller.applyHLDSWithLabelDS = false;
		}
		
		if(valueExistsNotEmpty(this.labelDataSourceName)){
			var labelDataSource = View.dataSources.get(this.labelDataSourceName);
			if(!valueExistsNotEmpty(labelDataSource) && valueExistsNotEmpty(this.labelDataSourceViewName)){
				
				if(this.labelDSView.fileName != this.labelDataSourceViewName){
					this.labelDSView.loadView(this.labelDataSourceViewName);
				} else {
					this.applyLabelDataSource();
				}		
			} else {
				this.applyLabelDataSource();
			}
		} else {
			this.drawingPanel.currentLabelsDS = null;
			this.drawingPanel.labelsDataSource = null;
			this.labelsLoaded = true;
			View.updateProgressBar(2/4);
			this.loadHighlightDataSource();
		}
	}
});

/**
 * Function called when leave record (activity_log - afm_redlines) is clicked in the tree
 * @param object
 */
function showRedlinedDrawing(object){
	try {
	    var rest = object.restriction;
		var clause = rest.findClause('afm_redlines.auto_number');
		var redlinesId = clause.value;
		
		View.initializeProgressBar(getMessage("msgLoadingRedlines"));
		try {
			var result = Workflow.callMethod(
	                'AbCommonResources-DrawingService-getRedmarksToDraw', parseInt(redlinesId));
		} catch (e) {
	        Workflow.handleError(e);
	    }
		var json = eval('('+result.jsonExpression+')');
		controller.showRedlinedDrawing(json);
		View.updateProgressBar(1/4);
	    
	} catch (e) {
	    View.closeProgressBar();
	}
	
}

function afterGeneratingTreeNode(treeNode){
	//XXX: treeNode has all info about tree object such as treeNode.level being Ab.tree.TreeLevel object 
	if(treeNode.depth == 0){
		var labelText = treeNode.label;
		if(valueExistsNotEmpty(treeConsoleRestriction)){
			var ds = View.dataSources.get('reviewRedlinesTree_redlinesDS');
			var records = ds.getRecords("afm_redlines.dwg_name = '"+treeNode.data['afm_dwgs.dwg_name'].toUpperCase() +"' AND " + treeConsoleRestriction);
			labelText += "<span id='ext-gen133' class='ygtvlabel'> ("+records.length+")</span>";
			
		} else {
			labelText += "<span id='ext-gen133' class='ygtvlabel'> ("+treeNode.data['afm_dwgs.nr_redlines']+")</span>";
		}
		treeNode.setUpLabel(labelText);
	}  	
}
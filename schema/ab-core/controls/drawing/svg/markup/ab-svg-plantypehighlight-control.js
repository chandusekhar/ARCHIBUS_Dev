/***
 * Plan Type Highlight Control for Redlining.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 */

var PlanTypeHighlight = Base.extend({

    
    //user define config for color picker's appearance
    config: {},
    
    // panel for background highlight
    panel: '',
    
    // div id to insert the background highlight options
    divId: '',

    // svg drawing control
    control: null,

    // plan group - default to 'Standard Space Highlights'
    planTypeGroup : 'Standard Space Highlights',
    
    // an array of pre-defined plan type JSON in format of
    // [{id: 'hl_plantype_1', title: 'Highlight By..', value: '1. Allocation'}, {}, {}]
    highlightPlanTypes: [],
    
    selectedPlanType: '',
    
    MAX_ROW: 5,
    
    /**
     * Constructor.
	 * @param divId String Id of <div/> that holds the background highlight selector panel
     * @param panelId String Id of the panel
	 * @param config configObject
     */
    constructor: function(divId, panelId, config, control) {

    	this.config = config;
    	
    	this.divId = divId,

    	this.panel = View.panels.get(panelId);
    	
    	this.control = control;
    	
        if(config && config.planTypeGroup)
        	this.planTypeGroup = config.planTypeGroup;
        
        if(config && config.selectedPlanType)
        	this.selectedPlanType = config.selectedPlanType;
        else {
        	this.selectedPlanType = 'None';
        	this.control.config.selectedPlanType = 'None';
        }
        
        if(this.highlightPlanTypes.length < 1)
        	this.populatePlanTypes();
        
        var table=document.getElementById(this.divId + "_tbl");
    	if(!table){
    		this.setup();
    		
    		this.setDefault(this.selectedPlanType);
   	   		
    		// only reload when the saved value is different from default
    		if(this.control.config.selectedPlanType != this.selectedPlanType){
    			this.control.config.selectedPlanType = this.selectedPlanType;
    			this.reloadSvgDrawing(this.control);
    		} else {
       	   		this.control.hasUnsavedChanges = false;
       	   		this.control.enableActions(true, true);
    		}
    	}
    },
    
    /**
     * dynamically create tables from the top 5 entries of plantype_groups of the specified plan typle group
     */
    setup: function(){
    	
    	// create div to contain the table.
    	var div=document.getElementById(this.divId);
    	
    	var table = this.createTable();    	
    	div.appendChild(table);
    },

    /**
     * populate the plan type entries as radio buttons group
     */
    populatePlanTypes: function(){
    	
    	this.highlightPlanTypes = [{id:'None', title: View.getLocalizedString(this.Z_PLANTYPE_NONE)}];
    	
    	var restrictions = new Ab.view.Restriction();
    	restrictions.addClause("plantype_groups.plantype_group", this.planTypeGroup);
    	restrictions.addClause("plantype_groups.active", 1);
		
		var parameters = {
				sortValues: "[{'fieldName':'plantype_groups.display_order', 'sortOrder':1}]"
		};
		
    	var records = this.control.svgData.getRecords('plantype_groups', restrictions, parameters);
    	
    	var maxRow = (records.length > this.MAX_ROW ? this.MAX_ROW : records.length);
    	for (var i = 0; i < maxRow; i++){
    		var record = records[i];
    		var planType = {};
    		planType.id = record.getValue("plantype_groups.plan_type");
    		
    		//retrieve the title from active_plantypes table
    		var planTypeRestrictions = new Ab.view.Restriction();
    		planTypeRestrictions.addClause("active_plantypes.plan_type", planType.id);

        	var recordsPlanTypes = this.control.svgData.getRecords('active_plantypes', planTypeRestrictions);
        	
        	if(recordsPlanTypes && recordsPlanTypes.length > 0)
        		planType.title = recordsPlanTypes[0].getValue("active_plantypes.title");
        	else
        		planType.title = planType.id;
        	
    		this.highlightPlanTypes.push(planType);
		}

    },
    
    /**
     * create table
     */
    createTable: function(){
    	var table = document.createElement('table');
    	table.id = this.divId + "_tbl";
    	table.style.borderSpacing = "3px";
    	
	    var tbody = document.createElement('tbody');

	    var count = 0;
	    
	    for(var i = 0; i < this.highlightPlanTypes.length; i++){
	    	var tr = document.createElement('tr');   
	    	tr.appendChild(this.createRow(this.highlightPlanTypes[i], (count==0)));
	    	tbody.appendChild(tr);
	    	count++;
	    }
	    
    	table.appendChild(tbody);
    	
    	return table;
    },
    
    /**
     * create row with radio button input
     */
    createRow: function(param, firstRow){
    	var td = document.createElement('td');
   		td.style.paddingLeft = '20px'; 
   		
   		if(firstRow)
   			td.style.paddingTop = '5px'; 
   		
   		td.appendChild(this.createInput(param.id, param.title));

   		var span =  document.createElement('span');
   		
   		span.appendChild( document.createTextNode(param.title) );
   		td.appendChild(span);
   		
    	return td;
    },
    
    /**
     * create radio button input, attach the event
     */
   	createInput: function(id, title){

   		var input = document.createElement('input');
   		input.setAttribute("type", "radio");
   		input.setAttribute("name", "highlightPlanTypes");

   		input.setAttribute("value", id);
   		
   		input.setAttribute("id", id);
   		  		
   		var highlightPlanTypes = this.highlightPlanTypes;
   		var highlightControl = this;
   		var fn = this.changePlanTypeHighlight.createDelegate(input, [highlightControl]);
   		input.addEventListener("change", fn, false);
    	
    	return input;
    	
   	},
   	

   	// called when the background highlight plan type is changed.
   	changePlanTypeHighlight: function(highlightControl){
   		if(this.value != highlightControl.config.selectedPlanType){
   			highlightControl.config.selectedPlanType = this.value;
   			highlightControl.selectedPlanType = this.value;
   	   		highlightControl.reloadSvgDrawing(highlightControl.control);
   	   		highlightControl.control.hasUnsavedChanges = true;
   	   		highlightControl.control.enableActions(true, true);
   		} else {
   			highlightControl.control.hasUnsavedChanges = false;
   			highlightControl.control.enableActions(true, true);
		}
   	},
   	
   	/**
   	 * reload SVG drawing if selected plan type changed
   	 */
   	reloadSvgDrawing: function(control){
   		
    	if(this.selectedPlanType && this.selectedPlanType != 'None'){
    		control.config['selectedPlanType'] = this.selectedPlanType;
    	}
    	
    	control.config["isReload"] = true;
    	
    	// timing issue during reload the first time, delay the reloading
    	setTimeout(function() {
        	control.load(control.divId, control.config);
   	    }, 500)
   	},
   	
   	/**
   	 * get highlight plan type in JSON for saving action
   	 */
   	getHighlightJSON: function(){
   		var highlightJson = {};
   		highlightJson['planTypeGroup'] = this.planTypeGroup;
   		highlightJson['selectedPlanType'] = this.selectedPlanType;
   		return highlightJson;
   	},
   	
   	/**
   	 * check the radio button for the selected plan type
   	 */
   	setDefault: function(selectedPlanType){
   		var input = document.getElementById(selectedPlanType);
    	if(input)
    		input.setAttribute("checked", "true");
   	},
   	
   	/**
   	 * show or hide panel
   	 */
   	show: function(visible){
   		if(this.panel)
   			this.panel.show(visible);
   	},
   	
   	// @begin_translatable
    Z_PLANTYPE_NONE: "None"
    // @end_translatable
});




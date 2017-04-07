/*
Copyright (c) 2015, ARCHIBUS Inc. All rights reserved.
Author: Emily Li
Date: April, 2015
*/

/**
 * The HtmlStack is a HTML5 stack AXVW adaptor component for WebCentral.
 * @namespace Ab.stack
 */
Ab.namespace('stack');

/**
 * The HTML5 stack is a visual component that presents building and floor information graphically.
 * It is implemented by the StackControl JavaScript class and extends the Ab.view.Component class.
 */
Ab.stack.HtmlStack = Ab.view.Component.extend({

	//the StackControl object.
    stackControl: null,
    
    // configuration object
    config: null,
    
    // data for the stack, typically gp records converted to the stack's expected structure
    data: [],
    
    // data for the rollup statistics (floor)
    statisticsData: [],
    
    // data for the profile (building)
    profileData: [],
    
    // unconverted data for the stack
    dataRaw: [],
    
    colors: [],
    
    colorMapping: {},
    
	// @begin_translatable
	AVAILABLE: 'Available',	
	UNAVAILABLE: 'UNAVAILABLE',
	VERTICAL: 'Vertical',	
	SERVICE: 'Service',	
	REMAINING: 'Remaining',
	AREA_AVAILABLE: 'available', 
	SEATS_AVAILABLE: 'headcount available', 
	ALLOCATION_RATE: 'allocated',
	ALLOC: 'Alloc', 
	AVAIL: 'Avail.',
	AVAIL_SEATS: 'Avail. Heads',
	AVAILABLE_REMAINING_AREA: 'Available - Remaining Area',
	UNALLOCATED: 'Unallocated',
	UNALLOCATED_DESCRIPTION: 'Temporary space for new requirements and existing allocations',
	// @end_translatable
		
    WORKFLOW_RULE_REFRESH: 'AbCommonResources-getDataRecords',
	
    refreshWorkflowRuleId: '',
		
    /**
     * Constructor function creates the stack control instance and sets its initial state.
     * @method constructor
     * @param {String} controlId the id for the stack control, usually the panel id.
     * @param {Object} configObject Object to hold configuration properties.
     */
    constructor: function(controlId, configObject) {

		this.inherit(controlId, 'htmlStack', configObject);	
		
		this.refreshWorkflowRuleId = this.WORKFLOW_RULE_REFRESH;
		
		// initialize the stack control
		this.stackControl = new StackControl(this.id, this.config);	
		
		// initialize the stack converter, which will be used to map data fetched from the database into the format that the stack expects
		this.stackConverter = new StackConverter(this.id, this.config);
		
		// generate a color array based on some predefined colors in StackControl.  Used across all buildings; colors are only recycled if the array runs out of colors
		this.colors = this.stackControl.areaColorAllocatedList.slice().reverse();
		
		// set translatable strings
		this.setTranslatableStrings();
    },
     
    /**
     * Returns the Building Code of the selected building
     * @return blId String
     */
    getSelectedBuilding: function() { 
    	return this.stackControl.getSelectedBuilding();
    },

    /**
     * Returns the Floor Code of the selected floor
     * @return flId String
     */
    getSelectedFloor: function() { 
    	return this.stackControl.getSelectedFloor();
    },

    /**
     * Returns the Group Code of the selected group
     * @return gpId String
     */
    getSelectedGroup: function() {
    	return this.stackControl.getSelectedGroup();   	
    },

    /**
     * Sets the Building Code of the selected building
     * @param blId String
     */
    setSelectedBuilding: function(blId) { 
    	this.stackControl.setSelectedBuilding(blId);
    },
    
    /**
     * Sets the Floor Code of the selected floor
     * @param flId String
     */
    setSelectedFloor: function(flId) { 
    	this.stackControl.setSelectedFloor(flId);
    },

    /**
     * Sets the Group Code of the selected group
     * @param gpId String
     */
    setSelectedGroup: function(gpId) {
    	this.stackControl.setSelectedGroup(gpId);   	
    },
    
    /**
     * Get records based on the view, datasource, scenario, building, and asOfDate
     * 
     * @param {String} viewName		The .axvw view file that hold the datasource, such as 'ab-ex-htmlstack.axvw'
     * @param {String} dsId			The datasource id that corresponds to viewName, such as 'abExHtmlStackDs_gp'
     * @param {String} scenarioId	The portfolio scenario id, such as 'Headquarters Baseline'
     * @param {String} blId			The building id, such as 'HQ'
     * @param {String} asOfDate 	The as of date, such as '2015-03-04'
     */    
    getRecords: function(viewName, dsId, scenarioId, blId, asOfDate, rest) {		 
		try {
			
	    	var groupDataSourceConfig = this.stackControl.getGroupDataSourceConfig();
			
	    	// create restrictions based on building, portfolio scenario, and as of date.  Apply any restrictions from refresh(restriction)    	
	    	var restriction = new Ab.view.Restriction();   	
	    	if (valueExists(rest) && valueExists(rest.clauses)) {	    			    		
	    		restriction.addClauses(rest, false, true);
	    	}

	    	restriction.addClause(groupDataSourceConfig.buildingField, blId);
			
			if (scenarioId) {
				restriction.addClause(groupDataSourceConfig.portfolioScenarioField, scenarioId);
			}

			if (asOfDate) {
				/*
				restriction.addClause('gp.date_start', asOfDate, '&lt;=');
				restriction.addClause('gp.date_end', asOfDate, '&gt;', ')AND(');
				restriction.addClause('gp.date_end', asOfDate, 'IS NULL', 'OR');
				*/
				restriction.addClause(groupDataSourceConfig.dateStartField, asOfDate, '&lt;=');
				restriction.addClause(groupDataSourceConfig.dateEndField, asOfDate, '&gt;=', ')AND(');
				restriction.addClause(groupDataSourceConfig.dateEndField, asOfDate, 'IS NULL', 'OR');
			}
		    var parameters = this.getParameters(restriction);
		    parameters.dataSourceId = dsId;
		    parameters.viewName = viewName;
		    var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);

		    return result.data.records;
		} catch (e) {
			
			//display the error dialog
			Workflow.handleError(e);
		}		
    }, 
    
	getParameters: function(restriction) {
		var parameters = {
			controlId:  this.divId,
			groupIndex: '0',
            version:     Ab.view.View.version
		};
        
        if (valueExists(restriction)) {
        	parameters.restriction = toJSON(restriction);
        }

        Ext.apply(parameters, this.parameters);

        return parameters;
	},
    
    /**
     * Add a building to the stack.
     * @param {String} blId	The building id, such as 'HQ'
     */
    addBuilding: function(blId) {
    	this.config.buildings.push(blId);

		var profileData = this.getRecords(this.config.buildingDatasourceView, this.config.buildingDatasource, this.config.portfolioScenario, blId, this.config.asOfDate)[0];
		var statisticsData = this.getRecords(this.config.floorDatasourceView, this.config.floorDatasource, this.config.portfolioScenario, blId, this.config.asOfDate);
		var stackRecords = this.getRecords(this.config.groupDatasourceView, this.config.groupDatasource, this.config.portfolioScenario, blId, this.config.asOfDate);
		var stackData = this.stackConverter.convertData(stackRecords, this.config.buildings.length, this.stackControl, this.colors, this.colorMapping, false);
		
    	this.data.push(stackData);
    	this.statisticsData.push(statisticsData);
    	this.dataRaw.push(stackRecords);
    	this.profileData.push(profileData);
    	
    	this.stackControl.build(this.config.stackOrientation, this.config.buildings.length, this.data, this.statisticsData, this.profileData, this.dataRaw);
    },

    /**
     * Remove a building from the stack.
     * @param {String} blId	The building id, such as 'HQ'
     */
    removeBuilding: function(blId) { 
    	var index = this.stackControl.getIndexForBuilding(blId);
    	if (index > -1) {
    		this.config.buildings.splice(index, 1);
        	this.data.splice(index, 1);
        	this.statisticsData.splice(index, 1);
        	this.dataRaw.splice(index, 1);
        	this.profileData.splice(index, 1);
    	}
    	
    	this.stackControl.build(this.config.stackOrientation, this.config.buildings.length, this.data, this.statisticsData, this.profileData, this.dataRaw);
    },

    /**
     * Clear all buildings in the stack.
     */
    clearAllBuildings: function() {
    	this.config.buildings = [];
    	this.data = [];
    	this.statisticsData = [];
    	this.profileData = [];
    	this.dataRaw = [];

    	this.stackControl.build(this.config.stackOrientation, this.config.buildings.length, this.data, this.statisticsData, this.profileData, this.dataRaw);
    },  
      
    /**
     * Refresh the stack, querying the data again.
     */    
    refresh: function(restriction) {
    	var buildings = this.stackControl.getBuildings();   	
    	this.data = [];
    	this.profileData = [];
    	this.statisticsData = [];  
    	this.dataRaw = [];
    	
    	for (var i=0; i< buildings.length; i++) {
    		var blId = buildings[i];
    				  		
    		//var statisticsData = this.getRecords('ab-ex-htmlstack-stats-fl.axvw', 'abExHtmlStackStatsDs_fl', 'Headquarters Baseline', 'HQ', '2015-03-04');
    		var statisticsData = this.getRecords(this.config.floorDatasourceView, this.config.floorDatasource, this.config.portfolioScenario, blId, this.config.asOfDate, restriction);
    		var profileData = this.getRecords(this.config.buildingDatasourceView, this.config.buildingDatasource, this.config.portfolioScenario, blId, this.config.asOfDate, restriction)[0];
    		var stackRecords = this.getRecords(this.config.groupDatasourceView, this.config.groupDatasource, this.config.portfolioScenario, blId, this.config.asOfDate, restriction);   		
    		//var stackData = StackConverter.convertData(stackRecords, i+1, this.stackControl, 'gp.fl_id', 'gp.sort_order', 'gp.area_manual', 'dv.hpattern_acad', 'gp.dv_id');
    		//this.colors = this.stackControl.areaColorAllocatedList.slice().reverse();
    		var stackData = this.stackConverter.convertData(stackRecords, i+1, this.stackControl, this.colors, this.colorMapping, false);
    		
        	this.data.push(stackData);
        	this.statisticsData.push(statisticsData);  
        	this.dataRaw.push(stackRecords);
        	this.profileData.push(profileData);		
    	}
    	
    	this.stackControl.build(this.config.stackOrientation, this.config.buildings.length, this.data, this.statisticsData, this.profileData, this.dataRaw);   	
    },
    
    /**
     * Build the stack, based on existing buildings. Does not fetch data from the database again, only redraws.
     */
    build: function() {
    	this.stackControl.build(this.config.stackOrientation, this.config.buildings.length, this.data, this.statisticsData, this.profileData, this.dataRaw);
    },
    
    /**
     * Set translatable strings.
     */
    setTranslatableStrings: function() {
		this.stackControl.AVAILABLE = View.getLocalizedString(this.AVAILABLE);
		this.stackControl.UNAVAILABLE = View.getLocalizedString(this.UNAVAILABLE);
		this.stackControl.AVAILABLE_REMAINING_AREA = View.getLocalizedString(this.AVAILABLE_REMAINING_AREA);
		
		this.stackControl.VERTICAL = View.getLocalizedString(this.VERTICAL),		
		this.stackControl.SERVICE = View.getLocalizedString(this.SERVICE),		
		this.stackControl.REMAINING = View.getLocalizedString(this.REMAINING),
		this.AVAILABLE_AREA = View.user.areaUnits.title + " " + View.getLocalizedString(this.AREA_AVAILABLE);
		this.stackControl.profileDataSourceConfig.statisticTitles = [this.AVAILABLE_AREA, View.getLocalizedString(this.ALLOCATION_RATE)];
		
		this.AVAIL_AREA = View.getLocalizedString(this.AVAIL) + " " + View.user.areaUnits.title;
		this.stackControl.statisticsDataSourceConfig.statisticTitles = [View.getLocalizedString(this.ALLOC), this.AVAIL_AREA, View.getLocalizedString(this.AVAIL_SEATS)];
		
		this.stackControl.UNALLOCATED = View.getLocalizedString(this.UNALLOCATED);		
		this.stackControl.UNALLOCATED_DESCRIPTION = View.getLocalizedString(this.UNALLOCATED_DESCRIPTION);
    },
    
    /**
     * Get stack's Image Bytes.  Asynchronous.
     */
    getImageBytes: function(handler) {
    	this.stackControl.getImageBytes(handler);  	
    },
    
    /**
     * Typically used in conjunction with getImageByte, within the handler.  Restores image contents on screen for interactivity.
     */
    restoreContent: function(nodesToRemove, nodesToRecover) {
    	this.stackControl.restoreContent(nodesToRemove, nodesToRecover);
    },
    
    highlightStackElement: function(id, cssClass){
    	if (!cssClass) {
    		cssClass = 'default-highlight';
    	}
    	d3.select(document.getElementById(id)).attr("class", function(d) { return d3.select(this).attr("class") + " " + cssClass; });
    }
});

View.createController('financialAnalysisConsoleSiteMap', {

    /**
     * The selected analysis code.
     */
    selectedAnalysisCode: null,

    /**
     * Array of analysis fields (finanal_analyses_flds) to use to highlight buildings on the map.
     * Only the first field is used.
     */
    analysisFields: null,

    /**
     * Array of finanal_sum records for buildings displayed in the Asset Scorecard.
     */
    analysisRecords: null,

    /**
     * The selected site id.
     */
    selectedSiteId: '',
    
    /**
     * The selected fiscal year.
     */
    selectedFiscalYear: '',
    
    /**
     * default tooltip fields
     */
    defaultTooltipFields: 'finanal_sum.bl_id;finanal_sum.pr_id;finanal_sum.fiscal_year',
    
    /**
     * SVG drawing control
     */
    svgControl: null,
    
    afterViewLoad: function(){
        this.analysisFields = [];
        this.analysisRecords = [];

        //add event listeners to the site selector
        this.on('app:rplm:sfa:selectSiteId', this.onSelectSiteId);
        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
        this.on('app:rplm:sfa:selectFiscalYear', this.onSelectFiscalYear);
        this.on('app:rplm:sfa:highlightBuildings', this.onHighlightBuildings);
        this.on('app:rplm:sfa:afterSelectMetrics', this.afterSelectMetrics);
        this.on('app:rplm:sfa:highlightBuilding', this.onHighlightBuilding);
        this.on('app:rplm:sfa:clearBuilding', this.onClearBuilding);
        this.on('app:rplm:sfa:highlightBuildingRow', this.onHighlightBuildingRow);
        this.on('app:rplm:sfa:clearBuildingRow', this.onClearBuildingRow);
    },
    
    /**
     * loads the site drawing and calls to fresh the scoreboard.
     */
    afterTabChange: function(panel, tabName) {
        //load the default site drawing
    	var index = jQuery('#controls_selectSiteId')[0].selectedIndex;
        var siteId = jQuery('#controls_selectSiteId')[0][index].value;
        
        index = jQuery('#controls_fiscalYear')[0].selectedIndex;
        var fiscalYear = jQuery('#controls_fiscalYear')[0][index].value;
        
        if(this.selectedFiscalYear !== fiscalYear){
        	this.selectedFiscalYear = fiscalYear;
        }
        
        if(this.selectedSiteId !== siteId){
        	this.selectedSiteId = siteId;
        }
    	this.onSelectSiteId([siteId, false]);
    },
    
    /**
     * Called when the user selects a site id.
     * parameters - array of two elements, first parameter is site_id and second parameters is a boolean to decide whether we should trigger select site id event.
     */
    onSelectSiteId: function(parameters) {
    	var siteId = parameters[0];
    	var triggerSelectSiteEvent = parameters[1];
    	
    	if(this.selectedSiteId !== siteId){
    		triggerSelectSiteEvent = true;
    	}
    		
    	this.loadSvg(siteId);
       	
       	var index = jQuery('#controls_selectAnalysis')[0].selectedIndex;
        var selectedAnalysis = jQuery('#controls_selectAnalysis')[0][index].value;

        var analysis = FinancialAnalysisConfiguration.getAnalysis(selectedAnalysis)
        this.onSelectAnalysis(analysis);

        if(triggerSelectSiteEvent){
        	this.trigger('app:rplm:sfa:selectSite', this.selectedSiteId);
        }
    },
    
    /**
     * load SVG drawing and retreieve the analysis fields
     */
    loadSvg: function(site_id) {
        
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'site_id':site_id};
		parameters['divId'] = "svgDiv";
		parameters['showTooltip'] = 'true';
		parameters['addOnsConfig'] = { 
				'AssetTooltip': {handlers: [{assetType: 'bl', datasource: 'analysisValuesDataSource', fields: this.getTooltipFields(), keyFields: 'finanal_sum.bl_id'}]}
		 };
		
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [
    	                                            {'eventName': 'mouseover', 'assetType' : 'bl', 'handler' : this.onMouseOverBuilding},
    	                                            {'eventName': 'mouseout', 'assetType' : 'bl', 'handler' : this.onMouseOutBuilding}
    	                                            ]);
    	
    	this.selectedSiteId = site_id;
    },
    
    /**
     * event handler when user mouse-over the building. The building and its corresponding grid row will be highlighted.
     * @param buildingId the building to highlight
     * @param drawingController reference to drawing controller
     */
    onMouseOverBuilding: function(buildingId, drawingController){
    	var controller = View.controllers.get("financialAnalysisConsoleSiteMap");
    	controller.trigger('app:rplm:sfa:highlightBuildingRow', buildingId);
    	controller.trigger('app:rplm:sfa:highlightBuilding', buildingId);
    },
    
    /**
     * event handler when user mouse-out the building. The highlighted color for building and row will be cleared.
     * @param buildingId the building to clear
     * @param drawingController reference to drawing controller
     */
    onMouseOutBuilding: function(buildingId, drawingController){
    	var controller = View.controllers.get("financialAnalysisConsoleSiteMap");
    	controller.trigger('app:rplm:sfa:clearBuildingRow', buildingId);
    	controller.trigger('app:rplm:sfa:clearBuilding', buildingId);
    },
    
    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * Loads analysis charts for selected analysis.
     * @param analysis A record from the finanal_analyses table.
     */
    onSelectAnalysis: function(analysis) {
        this.analysis = analysis;
        this.selectedAnalysisCode = analysis.getValue('finanal_analyses.analysis_code');
        this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Site Plan');
        this.refreshSitePlan();

        var mapName = analysis.getValue('finanal_analyses.map_name');
        if (mapName === 'Site') {
            this.mapTabs.selectTab('siteMap');
        }
    },

    /**
     * Sets the displayed fiscal year in the Asset Scorecard.
     * @param fiscalYear The fiscal year.
     */
    onSelectFiscalYear: function(fiscalYear) {
    	this.selectedFiscalYear = fiscalYear;
    	this.refreshSitePlan();
    },

    /**
     * Refreshes the site plan: uses analysis fields to highlight buildings.
     */
    refreshSitePlan: function() {
    	
    	if(this.mapTabs.selectedTabName !== 'siteMap')
    		return;
    	
        this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Site Plan');
        
        //reload svg
        this.loadSvg(this.selectedSiteId);
        
        this.highlightBuildings();
    },
    
    
    /**
     * add analysis fields to the string of default tooltip fields with ";".
     */
    getTooltipFields: function(){
    	var tooltipFields = this.defaultTooltipFields;
    	for(var index=0; index <this.analysisFields.length; index++){
    		tooltipFields += ";" + this.analysisFields[index].getValue('finanal_analyses_flds.analysis_table') + "." + this.analysisFields[index].getValue('finanal_analyses_flds.analysis_field');
    	}
    	return tooltipFields;
    },
    
    /**
     * Highlights buildings on the drawing.
     * @param analysisRecords Array of finanal_sum records for buildings displayed in the Asset Scorecard.
     */
    onHighlightBuildings: function(analysisRecords) {
        this.analysisRecords = analysisRecords;
        this.highlightBuildings();
    },

    /**
     * Highlights buildings on the drawing.
     */
    highlightBuildings: function() {
        if (this.analysisFields.length > 0 && this.svgControl && this.svgControl.control.getDrawingController().getAddOn("AssetTooltip")) {
	
        	
        		var clientRestriction = new Ab.view.Restriction();
        		clientRestriction.addClause("finanal_sum.fiscal_year", this.selectedFiscalYear, "=", true);
        	
        		this.svgControl.control.getDrawingController().getAddOn("AssetTooltip").updateDatasource("bl", "analysisValuesDataSource", this.getTooltipFields(), 'finanal_sum.bl_id', clientRestriction);
        		
	            //set formmatter for analyses fields
	        	for(var index=0; index <this.analysisFields.length; index++){
	        		this.svgControl.control.getDrawingController().getAddOn("AssetTooltip").setFormatter(this.analysisFields[index].getValue('finanal_analyses_flds.analysis_table') + "." + this.analysisFields[index].getValue('finanal_analyses_flds.analysis_field'), this.formatAnaysisField, true);
	        	}

	        	// display only the first metric field
	            var analysisTableName = this.analysisFields[0].getValue('finanal_analyses_flds.analysis_table');
	            var analysisFieldName = this.analysisFields[0].getValue('finanal_analyses_flds.analysis_field');


	            // get the function that returns stoplight color for the metric value
	            var trendDirection = FinancialAnalysisConfiguration.getMetricTrendDirection(analysisFieldName);
	            var selectedSiteId = this.selectedSiteId;

	            if (trendDirection) {
	            	var assetsToHighlight = {};
	                // for each building visible in the Asset Scorecard
	                _.each(this.analysisRecords, function(analysisRecord) {
	                    var bl_id = analysisRecord.getValue('finanal_sum.bl_id');

	                    //check whether the building is visible on the Site Map
	                    var site_id = analysisRecord.getValue('finanal_sum.site_id');
	                    var fiscal_year = analysisRecord.getValue('finanal_sum.fiscal_year');
	                    if(bl_id && site_id && site_id === selectedSiteId){
		                    var metricValue = analysisRecord.getValue(analysisTableName + '.' + analysisFieldName);
		                    var highlightColor = trendDirection(metricValue);
		                    
		                    // store the buildings to highlight with its color
		                    assetsToHighlight[bl_id] = {color: highlightColor, persistFill: true, overwriteFill: true};
	                    }
	                });
	                
	                //highlight the buildings with the specified color
	                this.svgControl.control.getDrawingController().getController("HighlightController").highlightAssets(assetsToHighlight);
	            }
        	}
    },

    /**
     * formatter for analysis field tooltips.
     * 
     */
    formatAnaysisField: function(ananlysisField, value){
    	return FinancialAnalysisConfiguration.formatMetricValue(ananlysisField, value);
    },

    /**
     * Highlight the specified building
     * @param buildingId the building to highlight
     */
    onHighlightBuilding: function(bl_id){
    	if(this.svgControl && this.svgControl.control.getDrawingController().getController("HighlightController")){
    		this.svgControl.control.getDrawingController().getController("HighlightController").highlightAsset(bl_id, {color: '#ffeac6', persistFill: false, overwriteFill: true});
    	}
    },
    
    /**
     * Clear Highlight for the specified building
     * @param buildingId the building to highlight
     */
    onClearBuilding: function(bl_id){
    	if(this.svgControl && this.svgControl.control.getDrawingController().getController("HighlightController")){
    		this.svgControl.control.getDrawingController().getController("HighlightController").clearAsset(bl_id);
    	}
    },
   
    /**
     * Updates the panel after the user changes the metrics.
     */
    afterSelectMetrics: function(panelName) {
        if (panelName == 'Site Plan') {
            this.refreshSitePlan();
        }
    }
})


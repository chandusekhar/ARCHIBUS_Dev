
View.createController('financialAnalysisConsoleAnalysisScorecard', {
	
	divId: 'scorecardDiv',
	
    /**
     * Registers event listeners.
     */
    afterViewLoad: function() {
        this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
		this.on('app:rplm:sfa:refreshAnalysis', this.onRefreshAnalysis);
		this.on('app:rplm:sfa:selectAnalysisFields', this.selectAnalysisFields);
        this.on('app:rplm:sfa:highlightAnalysisGroup', this.onHighlightAnalysisGroup);
        this.on('app:rplm:sfa:unhighlightAnalysisGroup', this.onUnhighlightAnalysisGroup);
		this.on('app:rplm:sfa:afterSelectMetrics', this.afterSelectMetrics);
    },

    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * Loads analysis charts for selected analysis.
     * @param analysis A record from the finanal_analyses table.
     */
    onSelectAnalysis: function(analysis) {
		this.analysis = analysis;
		this.analysisSuperGroup = analysis.getValue('finanal_analyses.analysis_super_group');

		// get analysis group names (a.k.a. business regions): e.g. Americas, APAC, EMEA
		this.analysisGroupNames = FinancialAnalysisConfiguration.getAnalysisGroupNames(
				this.analysisSuperGroup);

		// get analysis fields (a.k.a. metrics) to display
		this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(
				this.analysis.getValue('finanal_analyses.analysis_code'),
				'Analysis Scorecard');

		this.onRefreshAnalysis();
		
        // for testing: display analysis totals as a grid - remove after implementing the charts;
        // use analysisValuesTotalsDataSource to get data values for charts
        // this.analysisScorecard.addParameter('analysisSuperGroup', this.analysisSuperGroup);
        // this.analysisScorecard.refresh();
    },

	/**
	 * Refreshes the scorecard.
	 */
	onRefreshAnalysis: function() {
		this.displayScorecardForAnalysisFields();
	},

	/**
	 * Displays analysisFields specified by the capital and expense matrix drill-down.
	 * @param boxId The finanal_matrix_flds.box_id value.
     */
	selectAnalysisFields: function(boxId, selected) {
		if (selected) {
			this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFieldsForBox(boxId, 'Analysis Scorecard');
		} else {
			this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(
				this.analysis.getValue('finanal_analyses.analysis_code'),
				'Analysis Scorecard');
		}
    	this.displayScorecardForAnalysisFields();
	},

    /**
     *  API that updates the scorecard with specified metrics.
     */
    displayScorecardForAnalysisFields: function(){

    	var controller = this;
    	var rowLabels = [];
    	var rowSubLabels = [];
    	
        // trend direction functions by analysis field name
        var trendDirections = {};
        
        // initalize scorecard
        this.scorecardControl = this.initializeScorecard(this.analysisFields.length, this.analysisGroupNames.length);
        
        // set column labels: e.g. Americas, APAC, EMEA
    	this.scorecardControl.setColumnLabels(this.analysisGroupNames);
    	
    	// set column colors
    	this.scorecardControl.setColumnColors(colorbrewer.AbSet1[this.analysisGroupNames.length]);
    	
    	// get data
    	var data = this.getData('ab-finanal-console-data.axvw', 'analysisValuesTotalsDataSource', this.analysisSuperGroup);
		if (!data) {
			return;
		}

		// sort data records to match analysis group names order
		data.records = _.sortBy(data.records, function(record) {
			return record['finanal_sum.analysis_group'].toUpperCase();
		});

		// for each metric, display a row of charts
        _.each(this.analysisFields, function(analysisField, i) {

            // get the metric definition used to format the chart
        	var analysisTableName = analysisField.getValue('finanal_analyses_flds.analysis_table');
        	var analysisFieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');
            var metricDefinition = FinancialAnalysisConfiguration.getMetricDefinition(analysisFieldName);		// "ops_fci_pct"
            
            // trend directions
            var trendDirection = FinancialAnalysisConfiguration.getMetricTrendDirection(analysisFieldName);
            if (trendDirection) {
                trendDirections[analysisFieldName] = trendDirection;
            }
            
            // if no metric definition, print out table name and field name
            if (!metricDefinition) {
            	rowLabels.push('(' + analysisTableName + '.' + analysisFieldName + ')');
            	rowSubLabels.push('');
            	return; 
            }
            
            rowLabels.push(metricDefinition.getValue('afm_metric_definitions.metric_title'));
            
            var type = metricDefinition.getValue('afm_metric_definitions.analysis_display_chart');				// DONUT;Donut;PIE;Pie Chart;PIEPCT;Pie Chart - Percent;BAR;Bar Chart;BARPCT;Bar Chart - Percent
            var displayColor = metricDefinition.getValue('afm_metric_definitions.analysis_display_color');		// "0xCCCCCC"
            var aggregate = metricDefinition.getValue('afm_metric_definitions.report_aggregate_as');			// "SUM", "AVG", "NONE"
            var decimals = controller.getPrecision(metricDefinition.getValue('afm_metric_definitions.value_disp_decimals'));				// "2"           
            var format = metricDefinition.getValue('afm_metric_definitions.value_disp_format');					// ""
            var formatM = metricDefinition.getValue('afm_metric_definitions.value_disp_format_m');				// ""
            var labelDisplayFormat =  (View.user.displayUnits == 'imperial') ? format: formatM;					// whether to use imperial or metric
            var numeric = metricDefinition.getValue('afm_metric_definitions.value_disp_numeric');				// "P"
            var labelPrefix = (numeric === 'B')  ? View.project.budgetCurrency.symbol: '';
                               
            _.each(controller.analysisGroupNames, function(analysisGroupName, j) {
            	
				// display a chart for metric and analysis group
				var record = data.records[j];
            	if(record['finanal_sum.analysis_group'] === analysisGroupName) {
            		var analysisGroupField = 'finanal_sum.analysis_group';
            		var fullFieldName = analysisTableName + '.' + analysisFieldName;
            		var fullFieldNameRaw = analysisTableName + '.' + analysisFieldName + '.raw';
            		var value = (record[fullFieldNameRaw]) ? record[fullFieldNameRaw] : record[fullFieldName];
            		var valueField = (record[fullFieldNameRaw]) ? fullFieldNameRaw : fullFieldName;
            		var totalField = data.totals[analysisTableName + '.sum_' + analysisFieldName];
            		var total = (totalField) ? totalField.n: null;
					if (numeric === 'P' && type === 'PIEPCT') {
						total = total * 100;
					}
            		
            		// handle decimal and number formatting for total values in row sub labels. use aggregate to determine 'SUM', 'AVG', or 'NONE'
            		if (j==0 ) {
            			var subLabelRaw = total;
            			var subLabel = '';
            			
            			if (aggregate !== 'NONE') {
            				if (aggregate === 'AVG') {
                				subLabelRaw /= data.records.length;
                			}
                			
            				var suffix = (type ==='BARPCT' || type === 'PIEPCT') ? '%' : '';
							if (type ==='BARPCT' || type === 'PIEPCT') {
								subLabel = Math.round(subLabelRaw) + '%';
							} else {
								subLabel = (subLabelRaw) ? labelPrefix + '' + controller.getFormattedLabel(subLabelRaw, decimals, labelDisplayFormat) + suffix : '';
							}
            			} 
            			rowSubLabels.push(subLabel);
            		}
          		
            		var rowNum = i + 1;
            		var colNum = j + 1;
            		var id = controller.divId + "_row" + rowNum + "_col" + colNum;

            		//var type = 'BAR';
            		if (type === 'BARPCT') {
            			controller.scorecardControl.setChart( {"id": id,  "type": type,  'percent': Math.round(value) } );
 
            		} else if (type === 'BAR') {
            			
                        var watermarkFile = controller.getWaterMark( metricDefinition.getValue('afm_metric_definitions.analysis_display_icon') );		// N;Do Not Display;  C;Currency;  B;Building;  P;People
            			record['totalField'] = total;
            			controller.scorecardControl.setChart( {"id": id,  "type": type,  "valueField": valueField, "totalField": 'totalField', "categoryField": analysisGroupField, "dataProvider": [record], "selectedIndex": j, "watermarkFile": watermarkFile, 'precision': decimals, 'labelPrefix' : labelPrefix, 'labelDisplayFormat': labelDisplayFormat} );            			
 
            		} else if (type === 'PIE') { 
            			
            			controller.scorecardControl.setChart( {"id": id,  "type": type,  "valueField": valueField, "titleField": analysisGroupField, "dataProvider": data.records, "selectedIndex": j, 'precision': decimals, 'labelPrefix' : labelPrefix, 'labelDisplayFormat': labelDisplayFormat} );           			

            		} else if (type === 'DONUT') {  
            			            			                                            
                        data.records[j].color = controller.getStopLightColor(trendDirections, analysisFieldName, value);
            			controller.scorecardControl.setChart( {"id": id,  "type": type,  "valueField": valueField, "titleField": analysisGroupField, "colorField": "color", 'dataProvider': data.records, 'selectedIndex': j, 'precision': decimals, 'labelPrefix' : labelPrefix, 'labelDisplayFormat': labelDisplayFormat} );           			
 
            		} else if (type === 'PIEPCT') {
            			if (numeric === 'P') {
							value = value * 100;
						}
            			controller.scorecardControl.setChart( {"id": id,  "type": type,  "percent": value} );
            		}
            	}
            });
        });
    	
    	// set row labels: e.g. metric types
    	this.scorecardControl.setRowLabels(rowLabels);
    	this.scorecardControl.setRowSubLabels(rowSubLabels);
    },
    
    /**
     * Draws scorecard layout with empty cells.
     * @param numRows  The number of rows in the scorecard table.
     * @param numCols  The number of columns in the scorecard table.
     */
    initializeScorecard: function(numRows, numCols) {
    	var controller = this;
    	
        // scorecard control
    	var config = new Ab.view.ConfigObject({
    		'rows': numRows,
    		'columns': numCols,
    		'mouseoverHandler': function(analysisGroupName) {
    								controller.trigger('app:rplm:sfa:highlightMapAnalysisGroup', analysisGroupName);
    							},
    		'mouseoutHandler':  function() {
    								controller.trigger('app:rplm:sfa:clearMapAnalysisGroupHighlight');
    							}						
    	});
        return new ScorecardControl("scorecardDiv", "scorecardPanel", config);    	
    },
    
    /**
     * Get the data based on the following:
     * @param viewName  Name of the .axvw containing the data (e.g. 'ab-finanal-console-data.axvw')
     * @param dsId		Datasource id  (e.g. 'analysisValuesTotalsDataSource')
     * @param analysisSuperGroup	(e.g. 'finanal_analyses.analysis_super_group' value)
     * @param rest		Ab.view.Restriction
     */
    getData: function(viewName, dsId, analysisSuperGroup, rest) {
		try {			
	    	// create restrictions based on building, portfolio scenario, and as of date.  Apply any restrictions from refresh(restriction)    	
	    	var restriction = new Ab.view.Restriction();  	    	
	    	if (valueExists(rest) && valueExists(rest.clauses)) {	    			    		
	    		restriction.addClauses(rest, false, true);
	    	}
	    	
			var parameters = {
					controlId:  this.divId,
					showTotals: true,
					groupIndex: '0',
		            version:     Ab.view.View.version,
		            dataSourceId: dsId,
		            analysisSuperGroup: analysisSuperGroup,
		            viewName: viewName
				};
			
			if (valueExists(restriction)) {
				parameters.restriction = toJSON(restriction);
			}

		    var result = Workflow.call('AbCommonResources-getDataRecords', parameters, 120);

		    return result.data;
		} catch (e) {
			
			//display the error dialog
			Workflow.handleError(e);
		}
    },
    
    getPrecision: function(metricDecimals) {
    	return (isNaN(metricDecimals)) ?  2 : metricDecimals;
    },
    
    getWaterMark: function(icon){
    	var watermark = '';
		switch (icon) {
	    case 'B':
	    	watermark = 'graph-building.png';
	        break;
	    case 'P':
	    	watermark = 'graph-people.png';
	        break;
	    case 'C':
	    	watermark = 'graph-currency.png';
	        break;
	    default:
	    	watermark = '';
	    }
		
		return watermark;	   	
    },

    getStopLightColor: function(trendDirections, analysisFieldName, value) {
        var trendDirection = trendDirections[analysisFieldName];

        var color = 'gray';
        if (trendDirection) {
            var color = trendDirection(value);

            if (color === 'red') {
                color = '#ff0000';
            } else if (color === 'yellow') {
                color = '#ffff00';
            } else if (color === 'green') {
                color = '#00ff00';
            }                      	
        }  
        
        return color;
    },
    
	getFormattedLabel: function(labelValue, precision, labelDisplayFormat) {
		
		var labelFormatted = labelValue;		
		if (precision !== '' && precision > -1) {
			labelFormatted = parseFloat(labelValue).toFixed(precision); 
		}
		
		var chart = new AmCharts.AmSerialChart();
		var decimalSeparator = (typeof strDecimalSeparator !== 'undefined') ? strDecimalSeparator : '.';
		var numberFormatter = {precision: precision, decimalSeparator: decimalSeparator};
		var prefixesOfBigNumbers = [{"number":1e+3,"prefix":" k"},{"number":1e+6,"prefix":" M"},{"number":1e+9,"prefix":" G"},{"number":1e+12,"prefix":" T"},{"number":1e+15,"prefix":" P"},{"number":1e+18,"prefix":" E"},{"number":1e+21,"prefix":" Z"},{"number":1e+24,"prefix":" Y"}];
				
		if (Number(labelFormatted) > 0) {
			labelFormatted = AmCharts.addPrefix(labelFormatted, prefixesOfBigNumbers, chart.prefixesOfSmallNumbers, numberFormatter);		   						
		}				
				
		if (labelDisplayFormat != null && labelDisplayFormat !== '') {
			labelFormatted = labelDisplayFormat.replace('{0}', labelFormatted);
		}
		
		return labelFormatted;
	},  

    /**
     * Called when the user moves the mouse over a country that belongs to an analysis group.
     * Highlights the chart column for selected analysis group.
     * @param analysisGroupName The finanal_loc_group.analysis_group value.
     */
    onHighlightAnalysisGroup: function(analysisGroupName) {
        // use analysis group name (a.k.a. business region) to highlight the corresponding column
    	var index = this.analysisGroupNames.indexOf(analysisGroupName);
    	this.scorecardControl.highlightByColumn(index + 1);
    },

    /**
     * Called when the user moves the mouse outside of any country.
     * Unhighlights the chart column.
     */
    onUnhighlightAnalysisGroup: function() {
        // remove column highlight
    	this.scorecardControl.unHighlightAll();
    },

	/**
	 * Updates the panel after the user changes the metrics.
	 */
	afterSelectMetrics: function(panelName) {
		if (panelName == 'Analysis Scorecard') {
			this.onSelectAnalysis(this.analysis);
		}
	}
});
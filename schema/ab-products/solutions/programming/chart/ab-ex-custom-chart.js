/**
 * This example uses experimental YUI Chart component: 
 * http://developer.yahoo.com/yui/charts/
 * 
 * It requires Flash Player version 9.
 */

var chartExampleController = View.createController('chartExample', {

    /**
     * Set URL to YUI charts SWF file.
     */
    afterViewLoad: function() {
        YAHOO.widget.Chart.SWFURL = View.contextPath + "/schema/ab-core/libraries/yui/assets/charts.swf";
    },
    
    /**
     * Display initial chart without restriction.
     */
    afterInitialDataFetch: function() {
        this.customChart_dpGrid_onUpdateChart();
    },
    
    /**
     * Update chart by calling a custom WFR to get 1D data set.
     */
    customChart_dpGrid_onUpdateChart: function() {
        try {
            var restriction = toJSON(this.customChart_dpGrid.getPrimaryKeysForSelectedRows());
            
            var result = Workflow.callMethod('AbSolutionsLogicAddIns-LogicExamples-getWorkRequestChartData', restriction);
            
            var chart = new YAHOO.widget.LineChart(
                'customChart_chart', // ID of the HTML DIV element that will display the chart 
                this.createChartDataSource(result.dataSet, 'dp', ['wr.total_requests', 'wr.total_cost']),
                {
                    xField: 'dp', 
                    series: [
                        {displayName: getMessage('message_total_requests'), yField: 'wr.total_requests'},
                        {displayName: getMessage('message_total_cost'), yField: 'wr.total_cost'}
                    ]
                }); 
            chart.addListener('itemClickEvent', this.customChart_chart_onItemClick.createDelegate(this));
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    /**
     * Chart event handler. Displays work requests for selected floor.
     */
    customChart_chart_onItemClick: function(e) {
        var record = e.item.record;
        View.showMessage('You clicked on item [' + record.getFieldValue('wr.fl_id') + ']');
    },
    
    /**
     * Helper function that creates YUI chart-compatible data source object from ARCHIBUS data set.
     */
    createChartDataSource: function(dataSet, labelFieldName, fieldNames) {
        // create chart data records
        var chartData = [];
        for (var r = 0; r < dataSet.rowValues.length; r++) {
            var rowValue = dataSet.rowValues[r];
            var record = dataSet.records[r];
            
            var chartRecord = {};
            chartRecord[labelFieldName] = rowValue.l;
            chartRecord.record = record;
            for (var i = 0; i < fieldNames.length; i++) {
                chartRecord[fieldNames[i]] = record.getValue(fieldNames[i]);
            }
            chartData.push(chartRecord);
        }
        
        // create array of field names, including the label field name, matching chart data records
        var chartFieldNames = [labelFieldName];
        for (var i = 0; i < fieldNames.length; i++) {
            chartFieldNames.push(fieldNames[i]);
        }
        
        // create data source
        var chartDs = new YAHOO.util.DataSource(chartData);
        chartDs.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
        chartDs.responseSchema = {fields: chartFieldNames};
        return chartDs;
    }

});
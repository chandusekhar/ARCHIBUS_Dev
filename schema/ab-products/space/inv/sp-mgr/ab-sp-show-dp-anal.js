/**
 * @author Guo
 */
var controller = View.createController('spDpAnalysisController', {

    //----------------event handle--------------------
    spShowGpDpAnalysisFlGrid_afterRefresh: function(){
        var rows = this.spShowGpDpAnalysisFlGrid.rows;
        if (rows.length > 0) {
            var blId = rows[0]['fl.bl_id'];
            var flId = rows[0]['fl.fl_id'];
            this.spShowGpDpAnalysisChart.config.title = String.format(getMessage('chartPanelTitle'), blId + '-' + flId);
            refreshAnalysisPanel(blId, flId);
        }
    },
    
    /**
     * add this method for kb 3039293 
     * When no data is available for the chart the view shows the legend and a empty record with 1 count
     */
    spShowGpDpAnalysisSummaryGrid_afterRefresh: function(){
    	var grid = this.spShowGpDpAnalysisSummaryGrid;
        for (var j = 0; j < grid.rows.length; j++) {
            var row = grid.rows[j];
            if(row["gp.sum_area"] == 0 && row["gp.total_count"] == 1){
            	grid.removeRows(j);
            	grid.update();
            }
        }
    }
});

function onSelectFl(){
    var flPanel = View.panels.get('spShowGpDpAnalysisFlGrid');
    var selectedRow = flPanel.rows[flPanel.selectedRowIndex];
    var blId = selectedRow['fl.bl_id'];
    var flId = selectedRow['fl.fl_id'];
    refreshAnalysisPanel(blId, flId);
}

function onPieChartClick(obj){
    var blAndFl = View.panels.get('spShowGpDpAnalysisChart').blAndFl;
    var dvAndDp = obj.selectedChartData['gp.dv_dp'];
    var detailPanel = View.panels.get('spShowGpDpAnalysisGpDetailGrid');
    detailPanel.addParameter('blAndFl', blAndFl);
    if (dvAndDp == 'N/A') {
        detailPanel.addParameter('dvAndDp', " IS NULL");
    }
    else {
        detailPanel.addParameter('dvAndDp', "= '" + dvAndDp + "'");
    }
    detailPanel.refresh();
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 600,
        height: 400,
        title: getMessage('details'),
        closeButton: true
    });
}

/**
 * refresh the two panels of the 'detailsPosition' layout and reset the panel name
 */
function refreshAnalysisPanel(blId, flId){
    var chartPanel = View.panels.get('spShowGpDpAnalysisChart');
    var summaryPanel = View.panels.get('spShowGpDpAnalysisSummaryGrid');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('gp.bl_id', blId, '=');
    restriction.addClause('gp.fl_id', flId, '=');
    chartPanel.refresh(restriction);
    chartPanel.blAndFl = blId + '-' + flId;
    summaryPanel.refresh(restriction);
    summaryPanel.setTitle(String.format(getMessage('summaryPanelTitle'), chartPanel.blAndFl));
    chartPanel.setTitle(String.format(getMessage('chartPanelTitle'), chartPanel.blAndFl));
}

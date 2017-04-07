/**
 * Controller of the Status of Tools Report
 * @author Guo Jiangtao
 */
var abBldgOpsReportTlStatusController = View.createController('abBldgOpsReportTlStatusController', {


    // ----------------------- event handlers -----------------------------------------------------
    
    abBldgOpsReportTlStatusToolGrid_afterRefresh: function(){
    
        // If a tool on the left panel is associated with a work request, then the record will appear bold
        this.abBldgOpsReportTlStatusToolGrid.gridRows.each(function(row){
            // get work requests counts of the every tool 
            var wrCounts = row.getRecord().getValue('tl.wr_counts');
            if (wrCounts > 0) {
                row.cells.each(function(cell){
                    //get <td> element that displays the text as 'bold'
                    Ext.get(cell.dom).setStyle('font-weight', 'bold');
                });
            }
        });
    }
});

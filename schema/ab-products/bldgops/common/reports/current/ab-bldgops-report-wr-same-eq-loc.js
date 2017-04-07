/**
 * Controller of the Work Requests for Same Equipment or Location Report
 * @author Guo Jiangtao
 */
var abBldgOpsReportWrSameEqLocController = View.createController('abBldgOpsReportWrSameEqLocController', {


    // ----------------------- event handlers -----------------------------------------------------
    
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    
        //set the group option to 'E'
        $('groupOpts').value = 'E';
        
        // hidden both equipment grid and location grid
        this.abBldgOpsReportWrSameEqLocEquipmentGrid.show(false);
        this.abBldgOpsReportWrSameEqLocLocationGrid.show(false);
        
    },
    
    /**
     * on_click event handler for 'Show' action
     */
    abBldgOpsReportWrSameEqLocConsole_onShow: function(){
    
        //get the console group options --- 'E'|'L'
        var groupOpts = $('groupOpts').value;
        
        if (groupOpts == 'E') {
        
            //group by equipment and show equipment grid and hidden the loction grid
            this.abBldgOpsReportWrSameEqLocEquipmentGrid.refresh();
            this.abBldgOpsReportWrSameEqLocLocationGrid.show(false);
            
        }
        else {
        
            //group by equipment and show equipment grid and hidden the loction grid
            this.abBldgOpsReportWrSameEqLocLocationGrid.refresh();
            this.abBldgOpsReportWrSameEqLocEquipmentGrid.show(false);
            
        }
    },
    
    /**
     * on_click event handler for 'Clear' action
     */
    abBldgOpsReportWrSameEqLocConsole_onClear: function(){
    
        //Initializing    
        this.afterInitialDataFetch();
        
    }
});

/**
 * on_click event handler for row link action in equipment grid panel
 */
function onEquipmentGridRowClick(){

    //get the selected eq_id
    var grid = abBldgOpsReportWrSameEqLocController.abBldgOpsReportWrSameEqLocEquipmentGrid;
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var eqId = selectedRow["wr.eq_id"];
    
    //create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wr.eq_id", eqId, "=");
    
    //refresh and show details panel as pop-up
    var detailsGrid = abBldgOpsReportWrSameEqLocController.abBldgOpsReportWrSameEqLocDetailsGrid;
    detailsGrid.refresh(restriction);
    detailsGrid.showInWindow({
        width: 1200,
        height: 400
    });
    
}

/**
 * on_click event handler for row link action in location grid panel
 */
function onLocationGridRowClick(){

    //get the selected location
    var grid = abBldgOpsReportWrSameEqLocController.abBldgOpsReportWrSameEqLocLocationGrid;
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var blId = selectedRow["wr.bl_id"];
    var flId = selectedRow["wr.fl_id"];
    var rmId = selectedRow["wr.rm_id"];
    
    //create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wr.bl_id", blId, "=");
    restriction.addClause("wr.fl_id", flId, "=");
    restriction.addClause("wr.rm_id", rmId, "=");
    
    //refresh and show details panel as pop-up
    var detailsGrid = abBldgOpsReportWrSameEqLocController.abBldgOpsReportWrSameEqLocDetailsGrid;
    detailsGrid.refresh(restriction);
    detailsGrid.showInWindow({
        width: 1200,
        height: 400
    });
    
}

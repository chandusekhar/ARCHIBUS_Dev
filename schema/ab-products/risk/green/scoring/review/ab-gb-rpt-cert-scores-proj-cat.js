/**
 * @author Guo
 */
var abGbRptCertScoresProjCatController = View.createController('abGbRptCertScoresProjCatController', {


    // ----------------------- event handlers -------------------------
    
    afterInitialDataFetch: function(){
		this.abGbRptCertScoresProjCatConsole_onShow();
    },

    /**
     * This event handler is called when user click "DOC" button in title bar of Top console
     */
    abGbRptCertScoresProjCatConsole_onDoc: function(){
    
        // Construct a restriction from console fields
        // According to radio button  value, choose to open the paginated report view "ab-gb-rpt-cert-scores-proj-paginate.axvw" or "ab-gb-rpt-cert-scores-cat-paginate.axvw" by passing restriction to datasource of paginated panel. 
        
        var groupBy = geGroupByOptionValue();
        var parameters = {'printRestriction':true};
        var restriction = this.abGbRptCertScoresProjCatConsole.getFieldRestriction();
        if (groupBy == 1) {
        	restriction.removeClause("gb_cert_scores.cert_cat");
            View.openPaginatedReportDialog("ab-gb-rpt-cert-scores-proj-paginate.axvw", {
                'abGbRptCertScoresProjPaginatedDS': restriction
            },parameters);
        }
        else {
        	restriction.removeClause("gb_cert_scores.cert_cat");
        	var certCatValue = this.abGbRptCertScoresProjCatConsole.getFieldMultipleValues("gb_cert_scores.cert_cat");
			if(certCatValue && certCatValue[0]){
				restriction.removeClause("gb_cert_cat.cert_cat");
				restriction.addClause("gb_cert_cat.cert_cat", certCatValue,"IN");
			}
            View.openPaginatedReportDialog("ab-gb-rpt-cert-scores-cat-paginate.axvw", {
                'abGbRptCertScoresCatPaginatedDS': restriction
            },parameters);
        }
    },
    
    /**
     * This event handler is called when user click "Show" button in title bar of Top console
     */
    abGbRptCertScoresProjCatConsole_onShow: function(){
    
        // Construct a restriction from console fields 
        // According to radio button value, choose to show and refresh panel Bottom Scores - Group by Project grid or Bottom Scores - Group by Category grid by applying above restriction
        var groupBy = geGroupByOptionValue();
        var restriction = this.abGbRptCertScoresProjCatConsole.getFieldRestriction();
        if (groupBy == 1) {
			restriction.removeClause("gb_cert_scores.cert_cat");
            this.abGbRptCertScoresCatGrid.show(false);
            this.abGbRptCertScoresProjGrid.refresh(restriction);
        }
        else {
			restriction.removeClause("gb_cert_scores.cert_cat");

			var certCatValue = this.abGbRptCertScoresProjCatConsole.getFieldMultipleValues("gb_cert_scores.cert_cat");
			if(certCatValue && certCatValue[0]){
				restriction.removeClause("gb_cert_cat.cert_cat");
				restriction.addClause("gb_cert_cat.cert_cat", certCatValue,"IN");
			}
            this.abGbRptCertScoresProjGrid.show(false);
            this.abGbRptCertScoresCatGrid.refresh(restriction);
        }
    },
	
    /**
     * This event handler is called when user click 'Update Totals' button in title bar of project grid panel
     */
    abGbRptCertScoresProjGrid_onUpdateProjTotalScore: function(){
        //Call  scoring project wfr
        try {
            var result = Workflow.callMethod("AbRiskGreenBuilding-ScoringService-calculateProjectScores");
            View.showMessage(getMessage("msgUpdateTotalsComplete"));
            // refresh all visible panels
            View.panels.each(function(panel){
            	if (panel.visible && (panel.type == 'grid' || panel.type == 'form' || panel.type == 'columnReport')) {
            		var selectedRowIndex = -1;
            		if (panel.type == 'grid') {
            			selectedRowIndex = panel.selectedRowIndex;
            		}
            		panel.refresh(panel.restriction);
            		if (selectedRowIndex != -1 && panel.type == 'grid') {
            			panel.selectRow(selectedRowIndex);
            		}
            		
            	}
            });
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
    
});



/**
 * get group by option value.
 */
function geGroupByOptionValue(){
    //for "Project"return 1, for "Category ID" return 2
    var options = document.getElementsByName("groupBy");
    if (options[0].checked) {
        return 1;
    }
    else {
        return 2;
    }
}

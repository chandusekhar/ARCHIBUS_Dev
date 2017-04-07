
View.createController('parametersWithExpressions', {

    /**
     * Restrict using parameter.
     */
    parametersWithExpressionsGrid_onFilter: function() {
        // the sql.currentData expression cannot be evaluated on the client - send it to the server
        this.parametersWithExpressionsGrid.addParameter('clientRestriction', 'AND wr.date_requested = ${sql.currentDate}');
        this.parametersWithExpressionsGrid.refresh();
        
        if (this.parametersWithExpressionsGrid.gridRows.getCount() == 0) {
            View.showMessage('There are no new requests today');
        }
    },
    
    /**
     * Clear restriction parameter and refresh.
     */
    parametersWithExpressionsGrid_onClear: function() {
        // previously added parameter value must be cleared
        this.parametersWithExpressionsGrid.addParameter('clientRestriction', '');
        this.parametersWithExpressionsGrid.refresh();
    }
});
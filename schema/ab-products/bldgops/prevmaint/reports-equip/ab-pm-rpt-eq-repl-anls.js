var eqReplaceAnalyzeController = View.createController('eqReplaceAnalyzeController', {
    afterInitialDataFetch: function(){
        this.eq_repl_anls_eq_info.show(true);
    },
    eq_repl_anls_eq_list_onSelectEqId: function(row, action){
        this.showReplacementAnalysis(row, action);
    },
    eq_repl_anls_eq_list_afterRefresh: function(){
        var rows = this.eq_repl_anls_eq_list.rows;
        if (rows.length > 0) {
            var eqId = rows[0]['eq.eq_id'];
            this.refreshReport(eqId);
        }
    },
    //----------------Logic function start--------------------
    
    showReplacementAnalysis: function(row, action){
        var record = row.getRecord();
        var eqId = record.getValue('eq.eq_id');
        this.refreshReport(eqId);
    },
    refreshReport: function(eqId){
        var eqInfoRes = new Ab.view.Restriction();
        eqInfoRes.addClause("eq.eq_id", eqId, "=");
        this.eq_repl_anls_eq_info.refresh(eqInfoRes);
        
        var eqReplaceRes = new Ab.view.Restriction();
        eqReplaceRes.addClause("hwr.eq_id", eqId, "=");
        var title = getMessage('reportTitle') + " " + eqId;
        setPanelTitle('eq_repl_anls_repl_report', title);
        this.eq_repl_anls_repl_report.refresh(eqReplaceRes);
    }
});

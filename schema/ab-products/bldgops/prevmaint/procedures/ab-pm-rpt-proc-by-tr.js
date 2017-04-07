/**
 * @author keven.xi
 */
View.createController('viewPmByTr', {

    afterInitialDataFetch: function(){
        this.filterTradePanel_onShow();
    },
    
    filterTradePanel_onShow: function(){
        var restriction = new Ab.view.Restriction();
        var console = View.panels.get('filterTradePanel');
        
        var tr_id = console.getFieldValue('pmp.tr_id');
        if (tr_id != '') {
            restriction.addClause('pmp.tr_id', tr_id, '=');
        }
        
        var description = console.getFieldValue('tr.description');
        if (description != '') {
            restriction.addClause('tr.description', '%' + description + '%', 'LIKE');
        }
        
        // apply restriction to the tradeGrid
        var tradeGrid = View.panels.get('trade_grid');
        tradeGrid.refresh(restriction);
    },
    
    trade_grid_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmp.pmp_id", "-1", "=");
        this.procedure_report.refresh(restriction);
        setPanelTitle('procedure_report', getMessage("procsFor"));
    }
    
});

function onTradeClick(){
    //1 set the title of procedure_report panel
    var grid = View.panels.get('trade_grid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var tradeID = selectedRow["pmp.tr_id"];
    var title = getMessage("procsFor") + " " + tradeID;
    setPanelTitle('procedure_report', title);
    
    //refresh procedure_report 
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pmp.tr_id", tradeID, "=");
    var report = View.panels.get('procedure_report');
    report.refresh(restriction);
}

var PanelId = '', Title = '', Type = '';
function openDialog(){
    if (Type == "tr") {
        View.selectValue(PanelId, Title, ['pmp.tr_id'], 'tr', ['tr.tr_id'], ['tr.tr_id','tr.description'], null, null, null, null, null, 800, 500, null, null, null);
    }
}

function InitialPara(panelid, title, type){
    PanelId = panelid;
    Title = title;
    Type = type;
    
}
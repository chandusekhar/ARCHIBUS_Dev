//JLL 2017.03 - UCALAUP-57 - onChartClick() -update restriction to resolve Ambiguous column error
var ucOnDemandRequestByZone =  View.createController("ucOnDemandRequestByZone",{
    consoleRest: null,

    afterViewLoad: function() {
        this.inherit();

        View.setToolbarButtonVisible('printButton', false);
        View.setToolbarButtonVisible('emailButton', false);
        View.setToolbarButtonVisible('alterButton', false);
        View.setToolbarButtonVisible('favoritesButton', false);

    },

    afterInitialDataFetch: function(){
        //ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
        this.userTrade = getUserTrade();
        this.requestConsole.setFieldValue('cf.tr_id', this.userTrade);
    }
});

function onChartClick(obj){
    var clickedData = obj.selectedChartData;
    var consoleRest = ucOnDemandRequestByZone.consoleRest;
    var restriction = "";

    // build restriction
    var status = clickedData['wrhwr.status_e'];
    restriction += "wrhwr.status = "+restLiteral(status); //JLL 2017.03 - UCALAUP-57 - onChartClick() -update restriction to resolve Ambiguous column error


    var zone = clickedData['bl.zone_id'];
    restriction += " AND bl.zone_id = "+restLiteral(zone);

    restriction = restriction + " " + consoleRest;

    View.openDialog("uc-chart-request-by-zone-details.axvw", restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = "";

    var date_from = console.getFieldValue('wrhwr.date_requested.from');
    var dateFromObj = new Date(date_from);
    if (date_from != '') {
        restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
    }

    var date_to = console.getFieldValue('wrhwr.date_requested.to');
    var dateToObj;
    if (date_to != '') {
        restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
        dateToObj = new Date(date_to);
    }

    var tr_id = console.getFieldValue('wrhwr.tr_id');
    if (tr_id != '') {
        restriction += " AND wrhwr.tr_id = "+restLiteral(tr_id);
    }

    ucOnDemandRequestByZone.consoleRest = restriction;

    var reportView = View.panels.get("requestByZone_chart");
    reportView.addParameter("dateRest", restriction);
    reportView.refresh();
}

function restLiteral(value) {
    return "'"+value.replace(/'/g, "'")+"'";
}

function getUserTrade() {
    var tr_id = null;
    var email = View.user.email;
    if (email != "") {
        tr_id = UC.Data.getDataValue('cf', 'tr_id', "email="+restLiteral(email));
    }
    return tr_id;
}
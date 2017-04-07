
var viewPMResForecastChartController = View.createController('viewPMResForecastChartController', {

    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('viewPMResForecast');
        var selectedDate = openerController.selectedDate;
        var curGridPanelID = openerController.curGridPanelID;
        var resType = "";
        switch (curGridPanelID) {
            case 'byLaborGrid':
                resType = getMessage("labor");
                break;
            case 'byPartsGrid':
                resType = getMessage("parts");
                break;
            case 'byToolsGrid':
                resType = getMessage("toolType");
                break;
        }
        var title = getMessage('title') + " " + resType + "-" + selectedDate;
        this.hourByResTypeChart.setTitle(title);
    }
});

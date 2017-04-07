var cfAvailController = View.createController('wrOverdueDashController', {

	afterInitialDataFetch: function(){
        this.abPmRptOverdueWr_chart.addParameter('one_day_text', getMessage('one_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('two_day_text', getMessage('two_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('three_day_text', getMessage('three_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('four_day_text', getMessage('four_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('five_day_text', getMessage('five_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('six_day_text', getMessage('six_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('seven_day_text', getMessage('seven_day_text'));
        this.abPmRptOverdueWr_chart.addParameter('greate_week_text', getMessage('greate_week_text'));
        this.abPmRptOverdueWr_chart.addParameter('greate_month_text', getMessage('greate_month_text'));
               
        this.abPmRptOverdueWr_chart.refresh();
    }
});

	
function showDetail(obj){
    var grid = View.panels.get('abPmRptOverdueWr_grid');
    grid.addParameter('one_day_text', getMessage('one_day_text'));
    grid.addParameter('two_day_text', getMessage('two_day_text'));
    grid.addParameter('three_day_text', getMessage('three_day_text'));
    grid.addParameter('four_day_text', getMessage('four_day_text'));
    grid.addParameter('five_day_text', getMessage('five_day_text'));
    grid.addParameter('six_day_text', getMessage('six_day_text'));
    grid.addParameter('seven_day_text', getMessage('seven_day_text'));
    grid.addParameter('greate_week_text', getMessage('greate_week_text'));
    grid.addParameter('greate_month_text', getMessage('greate_month_text'));

	grid.refresh(obj.restriction);
    grid.showInWindow({
        width: 800,
        height: 500
    });
    
    var instructions = getMessage("legend");
    instructions += "<br /><span style='background-color:#FC6'>" + getMessage("escalatedResponse") + "</span>";
    instructions += "<br /><span style='background-color:#F66'>" + getMessage("escalatedCompletion") + "</span>";
    grid.setInstructions(instructions);

}


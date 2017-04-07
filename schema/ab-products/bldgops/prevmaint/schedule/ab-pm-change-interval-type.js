View.createController('changeIntervalType', {

    afterInitialDataFetch: function(){
        var pmpType = this.change_interval.record.getValue("pmp.pmp_type");
        if (pmpType == 'HK') {
            updateIntervalTypeOptions();
        }
    }
})

function refreshParentView(){
    var parentView = View.getOpenerView();
    parentView.panels.get("pms_select").refresh();
    
}

function updateIntervalTypeOptions(){
    var intervalType = View.panels.get("change_interval").getFieldElement("pms.interval_type");
    var options = intervalType.options;
    intervalType.remove(getIndexofValue("i", options));
    intervalType.remove(getIndexofValue("h", options));
    intervalType.remove(getIndexofValue("e", options));
}

function getIndexofValue(value, options){
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == value) {
            return i;
        }
    }
    return -1;
}

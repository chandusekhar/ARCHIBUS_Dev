confinedSpaceReportController = View.createController('confinedSpaceReportController', {
    csrConsole_onDoFilter: function() {
        var restriction = new Ab.view.Restriction();
        
        for(var i in this.csrConsole.fields.keys) {
            var filterField = this.csrConsole.fields.keys[i];
            var value = this.csrConsole.getFieldValue(filterField);
            if(value != null && value != '') {
                var enumList = this.csrConsole.fields.get(filterField).config.enumValues;
                if(enumList) {
                    for(var enumValue in enumList) {
                        if(enumList[enumValue] == value) {
                            value = enumValue;
                            break;
                        }
                    }
                }
                
                restriction.addClause(filterField, value);
            }
        }
        
        this.csrGrid.refresh(restriction);
    }
});
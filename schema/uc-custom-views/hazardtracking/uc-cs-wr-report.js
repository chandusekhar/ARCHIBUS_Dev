confinedSpaceWorkRequestController = View.createController('confinedSpaceWorkRequestController', {
    cswrConsole_onDoFilter: function() {
        var restriction = new Ab.view.Restriction();
        
        for(var i in this.cswrConsole.fields.keys) {
            var filterField = this.cswrConsole.fields.keys[i];
            var value = this.cswrConsole.getFieldValue(filterField);
            if(value != null && value != '') {
                var enumList = this.cswrConsole.fields.get(filterField).config.enumValues;
                if(enumList) {
                    for(var enumValue in enumList) {
                        if(enumList[enumValue] == value) {
                            value = enumValue;
                            break;
                        }
                    }
                }
                
                if(filterField == 'date_req_from')
                    restriction.addClause('wr.date_requested', value, '>=');
                else if(filterField == 'date_req_to')
                    restriction.addClause('wr.date_requested', value, '<=');
                else                
                    restriction.addClause(filterField, value);
            }
        }
        
        this.cswrGrid.refresh(restriction);
    }
});
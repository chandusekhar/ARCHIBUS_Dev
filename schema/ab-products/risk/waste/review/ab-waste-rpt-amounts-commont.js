/**
 * @author Song
 */
/**
 * get field restriction
 */
function getFieldRes(fieldName,value, isNumber){
    var restriction = "";
    if (valueExistsNotEmpty(value)) {
        if (isMultiSelect(value)) {
            restriction = fieldName + " IN " + toSqlArray(value, isNumber);
        }
        else {
            if (isNumber) {
                restriction = fieldName + " = " + value;
            }
            else {
                restriction = fieldName + " = '" + value + "'";
            }
        }
    }
    
    return restriction;
}

/**
 * convert array to sql string
 */
function toSqlArray(string, isNumber){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var result = '';
    if (isNumber) {
        result = "(" + values[0];
    }
    else {
        result = "('" + values[0] + "'";
    }
    
    for (i = 1; i < values.length; i++) {
        if (isNumber) {
            result += " ," + values[i];
        }
        else {
            result += " ,'" + values[i] + "'";
        }
    }
    
    result += ")"
    
    return result;
}
function isMultiSelect(consoleFieldValue){
    return (consoleFieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0);
}
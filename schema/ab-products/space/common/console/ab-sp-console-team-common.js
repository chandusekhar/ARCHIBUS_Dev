/**
 * attach angle bracket on string VARIES
 * @param str a string need to be added angle brackets
 * @return <str>
 */
function attachAngleBracket(str){
	return '<'+str+'>';
}

/**
 * transform the values in filter
 * @param fieldId  the left operand
 * @param fieldValue the right operand
 * @return conditional expression used in sql 
 */
function getFieldRestrictionById(fieldId, fieldValue){
	if ( fieldValue.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0 ) {
		return fieldId+" in " + stringToSqlArray(fieldValue);
	} else {
		return fieldId+" = '" + fieldValue+"'";
	}
}

/**
 * transform the values in filter
 * @param string
 * @return resultedString  string used for sql's IN statement 
 */
function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")";
    
    return resultedString;
}

var ConstantClass = function(){
	var constants = {
			earlyDate: '1900-01-01',
			lateDate: '2900-01-01'
	};
	
	return function(){
		this.getConstants = function(name){
			return constants[name];
		};
	};
}();

var constantClass = new ConstantClass();
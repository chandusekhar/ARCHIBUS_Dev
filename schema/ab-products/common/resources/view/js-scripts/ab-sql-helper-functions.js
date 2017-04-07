/**
 * Returns valid values for SQL
 * @param value object
 * @returns object
 */
function makeSafeSqlValue(value)
{
	if (isArray(value)) {
		// if is an array we need to format all values
		for(var i=0; i < value.length; i++){
			value[i] = makeSafeSqlString(value[i]);
		}
	} else {
		value = makeSafeSqlString(value);
	}
	
	return value;
}

function isArray(value){
	return ('isArray' in Array) ? 
	        Array.isArray(value) : 
	                Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * Make safe string for sql.
 * @param value string
 * @returns string
 */
function makeSafeSqlString(value){
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}

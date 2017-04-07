// Stacked Bar Graph
// showing values in the configured value fields of the retrieved records.
//
// 

/**
 * Main function that goes through the high-level steps:
 *
 * - Find the div element using the CSS class name and loop over each instance;
 * - Get the parameters from the div's attributes;
 * - Get data from the server;
 * - Process the data (e.g., sort, localize, etc.). In this case, find max value;
 * - Construct the markup implementing the control: HTML or SVG;
 * - Attach the constructed control markup to the containing div element.
 *
 */
function loadStackedBarCharts() {
    $(".stackedBarChart").each( function(n) {
		// element ids and bucket dimensions
        var config = setConfigProperties($(this));
		if (!config) {
			console.log('Configuration of stackedBarChart ' + n + ' is missing required properties.');
			return false;
		}
		//alert('stop');

        var data = getDataRecords(config);
        config.maxValue = getMaximumValue(config, data.records);

        var controlHTML = formHtmlTable(config, data.records);
        $(this).append(controlHTML);
    });

}

/**
 * Get the configuration parameters from the containing div's attributes.
 * Construct and return a configuration object.
 */
function setConfigProperties(elContainer) {
	var wrapperId = elContainer.parents(".bucket-wrapper").attr("id");
    // var bucketId = elContainer.parents(".bucket-process").attr("id");

    var config = {
        'elementId': wrapperId,
        'bucketWidth': parseFloat($("#" + wrapperId).css('width')),
        'recordLimit': '5',
        'subTitle': '',
        'labelPrefix': '',
        'valueSuffix': ''
    };

    // required parameters
    if (elContainer.attr("viewName")) {
        config.viewName = elContainer.attr("viewName");
    }
    if (elContainer.attr("dataSource")) {
        config.dataSourceId = elContainer.attr("dataSource");
    }
    if (elContainer.attr("labelField")) {
        config.labelField = elContainer.attr("labelField");
    }
    if (elContainer.attr("valueFields")) {
        config.valueFields = elContainer.attr("valueFields").split(',');
    }
	if (!config.viewName || !config.dataSourceId || !config.labelField || !config.valueFields) {
		return false;
	}

	// optional parameters
    if (elContainer.attr("restriction")) {
        config.restriction = elContainer.attr("restriction");
    }
    if (elContainer.attr("subTitle")) {
        config.subTitle = elContainer.attr("subTitle");
    }
    if (elContainer.attr("labelPrefix")) {
        config.labelPrefix = elContainer.attr("labelPrefix") + " ";
    }
    if (elContainer.attr("valueSuffix")) {
        config.valueSuffix = " " + elContainer.attr("valueSuffix") ;
    }
    if (elContainer.attr("recordLimit")) {
        config.recordLimit = elContainer.attr("recordLimit");
    }

    return config;
}

/**
 * Construct and return the markup implementing the control.
 * In this case a collection of table elements optionally preceeded by a subtitle.
 */
function formHtmlTable(config, data) {
    var tableHtml = '';

    if (config.subTitle) {
        tableHtml += '<h3>' + config.subTitle + '</h3>';
    }
	//alert('stop');
    var colorValues = ['white', 'darkseagreen','grey'];
    var barScale = config.bucketWidth/ config.maxValue;
    var padding = parseFloat($('#' + config.elementId).css('padding-left'));

    for (var row = 0; row < data.length; row++) {
        var maxInRow = data[row][config.valueFields[config.valueFields.length - 1]];
        tableHtml += '<table class="stacked-bar-graph" style="width:' + Math.floor((maxInRow * barScale) - padding) + 'px">';

        // first a row with the record label field
        var label = config.labelPrefix +  data[row][config.labelField];
        tableHtml += '<tr class="lbl">';
        tableHtml += '<td class="lbl" style="text-align:left;">' + label + '</td>';
        tableHtml += '</tr>';

        tableHtml += '<tr class="data">';
        var previousValue = 0;
        for (var j = 0; j < config.valueFields.length; j++) {
            var value =  data[row][config.valueFields[j]];

            tableHtml += '<td class="data" style="background-color:' + colorValues[j] + ';width:' + Math.floor( (value - previousValue) * barScale) + 'px;" ';
            tableHtml += 'title="' + data[row][config.valueFields[j]] + '">';
            tableHtml += '</td>';
            previousValue = value;
        }

        tableHtml += '</tr>';
        tableHtml += '</table>';
    }

    return tableHtml;
}

/**
 * Return the maximum value of the records.
 * The config.valueFields are in ascending order, 
 * so only check the last field of each record.
 */
function getMaximumValue(config, records) {
    var maxValue = 0;
    var valueFields = config.valueFields;
    for (var i = 0; i < records.length; i++) {
        for (var j = 0; j < valueFields.length; j++) {
            if (records[i][valueFields[j]] > maxValue) {
                maxValue = records[i][valueFields[j]];
            }
        }
    }

    return maxValue;
}


/**
 * execution of the script once its loaded
 */
loadStackedBarCharts();

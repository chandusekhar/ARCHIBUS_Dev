/**
 * JavaScript loading and handling events for the app-specifc buckets.
 *
 * Core Runtime controls includes horizontal bar chart; process metrics table; alerts; and my favorites.
 *
 * Custom controls can be plugged in by loading files via WebCentral\schema\ab-products\common\views\page-navigation\javascript\ab-pgnav-custom-code-plugin.js.
 *
 * @author Dave Wallace
 * @author Steven Meyer
 * @author Greg Knight
 * @since V 21.1
 */

/**
 * Construct the app-specific controls,
 * runtime-injected html for app-specific buckets.
 *
 */
function constructRuntimeBuckets() {
    // loadMapControls() is conditionally called depending on whether there is a map control in the page.
    // include support files first to give time for the files to be loaded.
    //var includesMapControl = includeMapControlRuntimes();

    loadHorizontalBarCharts();

    loadProcessMetricsControls();

    loadAlertsBuckets();

    loadFavoritesBuckets();

    PageNavReportingConfig.bucketMapHash = loadMapControls();


    loadCustomCodeFiles();
}

//- Horizontal Bar Chart Control
/**
 * Main process method for the the horizontal bar chart control.
 *
 */
function loadHorizontalBarCharts() {
    //- Loop thru each bucket having class horizontalBarChart
    $(".horizontalBarChart").each( function(n) {
        var parentContainer = $(this);
        var elBucket = parentContainer.parents(".bucket-process").attr("id");
        var elPlot = elBucket + '_plot' + n;
        var config = getHorizontalBarChartConfig(parentContainer, elBucket, n);
        if (!config.elementId) { return; }

        getDataAndConstructBarChart(config, elPlot, parentContainer);
    });
}

/**
 * Retrieve Bar Chart data and construct the chart, appending it to the parent container.
 *
 * Reused for process metrics control drill down dialog.
 *
 * @param config
 * @param elPlot
 * @param parentContainer
 */
function getDataAndConstructBarChart(config, elPlot, parentContainer) {
    var plotData = getPlotData(config, elPlot);
    if (!plotData || plotData.length === 0) { return; }

    plotData = preprocessBarChartData(config, plotData);
    var chartMarkup = horizontalBarChartBucket_Plot(config, elPlot, plotData);
    parentContainer.append(chartMarkup);
    bindDrilldownBarHover();
}

/**
 * Return the configuration object
 * containing default values augmented by attributes from the DOM's container element.
 *
 * @param container
 * @param elBucket
 * @param index
 * @returns object
 */
function getHorizontalBarChartConfig(container, elBucket, index) {
	var config = {
        'elementId': elBucket,
        'bucketWidth': $("#"+elBucket).width(),
        'sortOrder': 'desc',
        'valueOnTop': 'largest',
        'abbreviateValues': 'true',
        'recordLimit': '5',
        // do not change
        'useStoplightColors': 'false',
        'subtitle': '',
        controlIndex: index
    };

    //- parameters required by process metrics charting:
    if (container.attr("metricName")) { config.metricName = container.attr("metricName");}
    if (container.attr("granularity")) { config.granularity = container.attr("granularity");}
    if (container.attr("sortOrder")) { config.sortOrder = container.attr("sortOrder");}
    if (container.attr("scorecard")) { config.scorecard = container.attr("scorecard");}
    if (container.attr("useStoplightColors")) { config.useStoplightColors = container.attr("useStoplightColors") === "true" ? "true" : "false";}

    //- common parameters:
    if (container.attr("recordLimit")) { config.recordLimit = container.attr("recordLimit");}
    if (container.attr("valueOnTop")) { config.valueOnTop = container.attr("valueOnTop");}
    if (container.attr("subtitle")) { config.subtitle = container.attr("subtitle");}
    if (container.attr("abbreviateValues")) { config.abbreviateValues = container.attr("abbreviateValues");}

    //- parameters required by adhoc charting:
    if (container.attr("viewName")) { config.viewName = container.attr("viewName");}
    if (container.attr("dataSourceId")) { config.dataSourceId = container.attr("dataSourceId");}
    if (container.attr("valueField")) { config.valueField = container.attr("valueField");}
    if (container.attr("labelField")) { config.labelField = container.attr("labelField");}

    return config;
}

/**
 * Return the data for the chart.
 *
 * @param config
 * @param elPlot
 * @returns {Array}
 */
function getPlotData(config, elPlot) {
    var plotData = [];
    try {
        if (valueExists(dwr.engine._scriptSessionId)) {
            var result;
            var records;
            if (config.metricName) {
                result = Ab.workflow.Workflow.callMethod('AbCommonResources-MetricsService-getTrendValuesForMetric',  config.metricName, config.granularity, config.sortOrder);
                records = result.data;
            } else {
                var parameters = { viewName: config.viewName, dataSourceId: config.dataSourceId, restriction: config.restriction };
                result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
                records = result.data.records;
                var valueField = config.valueField;
                var labelField = config.labelField;
            }

            if (Ab.workflow.Workflow.sessionTimeoutDetected) {
                plotData = false;
            }
            else if (!records || records.length === 0) {
                chartBucketErrorMessage(config, elPlot, 'nodata');
                plotData = false;
            }
            else {
                if (records.length < config.recordLimit) {
                    config.recordLimit = records.length;
                }

                var recordLimit = config.recordLimit;
                for (var i = 0; i < recordLimit; i++) {
                    var record = records[i];
                    if (!record) { break; }

                    var rawval = 0;
                    var value = 'N/A';
                    var barLabel = 'None';
                    var drillDownView = '';
                    if (config.metricName) {
                        rawval = record.metricValueRaw;
                        value = record.metricValue;

                        if (typeof(record.granularityValue) !== 'undefined' && config.granularity !== 'all') {
                            barLabel = record.granularityValue;
                        }
                        else {
                            barLabel = getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_ALL);
                        }
                        drillDownView = record.drillDownView;
                    } else {
                        value = record[valueField];
                        rawval = record[valueField + ".raw"];
                        if (!rawval) {
                            rawval = value;
                        }
                        barLabel = record[labelField];
                    }

                    var processedRecord = {
                        //- pass as string in case of commas
                        value: convertValue(rawval.toString()),
                        formattedValue: value,
                        barLabel: barLabel,
                        pointLabel: (config.abbreviateValues === "true" && !config.metricName) ?
                            abbreviateValue(rawval.toString(), 2, 1) :
                            value,
                        //(config.abbreviateValues === "true") ? abbreviateValue(rawval.toString(), 2, 1) : rawval,
                        barClass: getBarClass(config.useStoplightColors, record.stoplightColor, rawval),
                        drillDownView: drillDownView
                    };
                    plotData.push(processedRecord);
                }

                if (isReOrderDataNeeded(config, plotData)) {
                    plotData.reverse();
                }
            }
        }
        else {
            console.log("Get plot data No DWR sessionId !");
        }
    }
    catch (e) {
        chartBucketErrorMessage(config, elPlot, 'wfrerror');
        plotData = false;
        ///Workflow.handleError(e);
    }

    return plotData;
}

/**
 * True when the order of the data is desscending and the configuration calls for smallest on top,
 * or vice versa.
 *
 * @param config
 * @param data
 * @returns {boolean}
 */
function isReOrderDataNeeded(config, data) {
    var reorderNeeded = false;

    // determine sort direction of the recordset (non metrics charts are [should be] sorted in the dataSource)
    var firstValue = data[0].value;
    var lastValue = data[data.length - 1].value;

    var arrSortDir = (firstValue >= lastValue) ? 'desc' : 'asc';
    if ((arrSortDir === 'desc' && config.valueOnTop === 'smallest') || (arrSortDir === 'asc' && config.valueOnTop === 'largest')) {
        reorderNeeded = true;
    }

    return reorderNeeded;
}

/**
 * Return the CSS class to be used in styling the graph bar.
 *
 * @param useStoplightColors
 * @param stoplightColor
 * @param rawValue
 * @returns {string}
 */
function getBarClass(useStoplightColors, stoplightColor, rawValue) {
    var barClass = 'pos';

    if (useStoplightColors && useStoplightColors === 'true') {
        barClass = stoplightColor;
    } else if (rawValue < 0) {
        barClass = 'neg';
    }

    return barClass;
}

/**
 * Process the data before using in chart construction.
 * Set value to absolute value & normalizing barLength to proportion of available width.
 *
 * @param config
 * @param data
 * @returns {*}
 */
function preprocessBarChartData(config, data) {
    //- sets space for point label. Increase as required if wrapping occurs
    var maxBarLength = config.bucketWidth - 75;
    var maxValue = getMaxRecordValue(data);
    var dataCount = data.length;

    for (var i = 0; i < dataCount; i++) {
        if (data[i].value < 0) {
            data[i].value = data[i].value * -1;
        }

        data[i].barLength = (data[i].value === 0) ? 1 : (data[i].value * maxBarLength) / maxValue;
    }

    return data;
}

/**
 * Return the HTML that implements the Horizontal Bar Chart.
 *
 * @param config
 * @param elPlot
 * @param data
 * @returns {string}
 */
function horizontalBarChartBucket_Plot(config, elPlot, data) {
    //- sets the background style of the bucket
    var elemId = config.elementId;
    $("#"+elemId).addClass("bar-metrics");

    var chartHtml = '';
    if (elPlot !== 'modal-drilldown') {
        chartHtml += '<div id="' + elPlot + '" class="hchart">';
    } else {
        chartHtml += '<div class="jsscroll hchart">';
    }


    if (config.subtitle && config.subtitle.length > 0) {
        if (config.subtitle === 'hidden') {
            config.subtitle = '&nbsp;';
        }
        chartHtml += '<div class="hchart-title">' + config.subtitle + '</div>';
    }

    var dataCount = data.length;
    for (var i = 0; i < dataCount; i++) {
        var record = data[i];

		//- set the replaceable URL parameters in the drill down view, if they exist
        var drillDownViewInstance = record.drillDownView;
        var drillDownSnippet = '';
        var drillDownClass = '';
        if (drillDownViewInstance && drillDownViewInstance.length > 0) {
            var valueList = record.barLabel.split(";");
            var valueCount = valueList.length;
            for (var j = 0; j < valueCount; j++) {
                drillDownViewInstance = drillDownViewInstance.replace("{" + j + "}", valueList[j]);
            }
            drillDownSnippet = ' rel="' + drillDownViewInstance + '" onMouseUp="openAlertDrilldown(this, event);"';
            drillDownClass = 'ellipses';
        }

        chartHtml += '<div class="bar-row"><span class="bar-title">' + record.barLabel + '</span><div class="bar ' + record.barClass + ' ' + drillDownClass +
            '" style="width:' + record.barLength + 'px;"' + drillDownSnippet + '>&nbsp;</div><div class="bar-point">' + record.pointLabel + '</div></div>';
    }
    chartHtml += '</div>';

    return chartHtml;
}

/**
 * Return the largest record value.
 *
 * @param records
 * @returns {number}
 */
function getMaxRecordValue(records) {
    var maxValue = 0;
    var recordCount = records.length;
    for (var i = 0; i < recordCount; i++) {
        var recordValue = Math.abs(records[i].value)
        if (recordValue > maxValue) {
            maxValue = recordValue;
        }
    }

    return maxValue;
}

/**
 * Bind the drill down function.
 *
 */
function bindDrilldownBarHover() {
	$(".ellipses").hover( function () {
            $(this).html('...');
        },
        function () {
            $(this).html('&nbsp;');
        }
	);
}

/**
 * Return the value, abbreviated to the given decomal places and using the provided suffix.
 *
 * @param num
 * @param decPlaces
 * @param suffix
 * @returns {XML|string|void}
 */
function abbreviateValue(num, decPlaces, suffix) {
    var abbrev = [ "K", "M", "B", "T" ];
	var negSign = '';
	var number = num ? num.replace(/,/g, '') : 0;
    // in case of negative values
	if (number < 0) {
        number = Math.abs(number);
        negSign = '-';
    }

    if ( number >= 1000) {
	    for (var i = abbrev.length - 1; i >= 0; i--) {
            var size = Math.pow(10, ( i + 1) * 3);
            if (size <= number) {
                number = Math.round(number * Math.pow(10, decPlaces) / size) / Math.pow(10, decPlaces);
                if ((number === 1000) && (i < abbrev.length - 1)) {
                    number = 1;
                    i++;
                }
                number = number.toLocaleString(PageNavUserInfo.locale.replace(/_/g, '-'), { minimumFractionDigits: decPlaces });
                number = (suffix === 1) ? negSign + number + abbrev[i] : negSign + number;
                break;
            }
	    }
	}
    else {
        number = parseFloat(number).toLocaleString(PageNavUserInfo.locale.replace(/_/g, '-'), { minimumFractionDigits: decPlaces });
    }

    return number;
}

/**
 * Return the value, removing commas and converted to thousands.
 * @param num
 * @returns {number}
 */
function convertValue(num) {
    var number = num ? num.replace(/,/g, '') : 0;
    return number / 1000;
}

//===========================================================

/**
 * Main method for the process metrics control.
 *
 */
function loadProcessMetricsControls() {
    //- Loop thru each bucket having class processMetrics
    // KB 3051379 <table/> element also uses class="processMetrics" (?)
    // so specify the element name to prevent duplicate table and excess recursion
    jQuery("div.processMetrics").each( function(n) {
        var parentContainer = jQuery(this);
        var elBucket = parentContainer.parents(".bucket-process").attr("id");
        var elPlot = elBucket + '_prmetric_' + n;
        var config = getProcessMetricsConfig(parentContainer, elBucket, n);

        if ( valueExists(dwr.engine._scriptSessionId) ) {
            var plotData = getProcessMetricData(config, elPlot);
            if (plotData) {
                var markup = constructProcessMetricsMarkup(config, elPlot, plotData);
                parentContainer.append(markup);
                percentCompleteCharts(config.useStoplightColors);
                sparklineCharts(plotData, n);
                bindAssumptions();
                bindProcessMetricDrilldown();
            }
        }
    });
}

/**
 * Return a configuration object containing default and DOM container-derived properties.
 *
 * @param container
 * @param elBucket
 * @param index
 * @returns {{elementId: *, bucketWidth: (*|jQuery), useStoplightColors: string}}
 */
function getProcessMetricsConfig(container, elBucket, index) {
    var config = {
        'elementId': elBucket,
        'bucketWidth': jQuery("#" + elBucket).width(),
        'useStoplightColors': 'false',
        controlIndex: index
    };

    if (container.attr("granularity")) {
        config.granularity = container.attr("granularity");
    }

    if (container.attr("scorecard")) {
        config.scorecard = container.attr("scorecard");
    }

    if (container.attr("useStoplightColors")) {
        config.useStoplightColors = container.attr("useStoplightColors");
    }

    return config;
}

/**
 * Return the data for a process metrics control.
 *
 * @param config
 * @param elPlot
 * @returns plotData
 */
function getProcessMetricData(config, elPlot) {
    var plotData = null;

    try {
        var result = Ab.workflow.Workflow.callMethod('AbCommonResources-MetricsService-getTrendValuesForScorecard', config.scorecard, config.granularity);
        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
            plotData = false;
        }
        else {
            plotData = [];
            var dataCount = result.data.length;
            for (var i = 0; result.data && i < dataCount; i++) {
                var record = result.data[i];

                var processedRecord = {
                    metricName: '',
                    metricTitle: encodeURIComponent(record.metricTitle),
                    metricValue: 0,
                    metricValueRaw: 0,
                    metricPreviousValues: 0,
                    metricValueChange:  0,
                    metricValueChangePerYear: 0,
                    reportLimitTarget: -1,
                    reportTrendDir: 0,
                    barClass: '',
                    description: '',
                    assumptions: '',
                    businessImplication: '',
                    recurrence: ''
                };

                // KB 3048852 when record.metricValue is undefined, we still need to set metricName, assumptions, etc.
                if (record.metricName) {
                    processedRecord.metricName = encodeURIComponent(record.metricName);
                }
                if (record.assumptions) {
                    //- replace Line breaks
                    processedRecord.assumptions = encodeURIComponent(record.assumptions)
                        .replace(/%0D%0A/g,'<br/>');
                }
                if (record.description) {
                    processedRecord.description = encodeURIComponent(record.description)
                        .replace(/%0D%0A/g, '<br/>');
                }
                if (record.businessImplication) {
                    processedRecord.businessImplication = encodeURIComponent(record.businessImplication)
                        .replace(/%0D%0A/g,'<br/>');
                }
                if (record.recurrence) {
                    processedRecord.recurrence = encodeURIComponent(record.recurrence);
                }

                if (record.metricValue) {
                    processedRecord.metricValue = record.metricValue;
                    processedRecord.metricValueRaw = record.metricValueRaw;
                    processedRecord.reportLimitTarget = record.reportLimitTarget;
                    processedRecord.metricValueChange = record.metricValueChange;
                    processedRecord.metricValueChangePerYear = record.metricValueChangePerYear;
                    processedRecord.reportTrendDir = record.reportTrendDir;
                    processedRecord.metricPreviousValues = record.metricPreviousValues + ';' + record.metricValueRaw;
                    processedRecord.metricPreviousValues = processedRecord.metricPreviousValues.replace(/,/g, '').replace(/;/g, ',');
                    if (config.useStoplightColors && config.useStoplightColors === 'true') {
                        processedRecord.barClass = record.stoplightColor;
                    }
                }

                plotData.push(processedRecord);
            }
        }
    }
    catch (e) {
        chartBucketErrorMessage(config, elPlot, 'wfrerror');
        plotData = false;
        /// Workflow.handleError(e);
    }

    return plotData;
}

/**
 * Return the markup implementing the process metrics control.
 * The percentComplete, and sparkline are transformed after this markup is appended to the DOM.
 *
 * @param config
 * @param elPlot
 * @param data
 * @returns {string}
 */
function constructProcessMetricsMarkup(config, elPlot, data) {
    var markup = '';
    if (!config.elementId) { return markup; }

    var changeHeaderTitle = getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_CHANGE);

    markup += '<table id="' + elPlot + '" class="process-metrics" style="width: ' + config.bucketWidth + 'px">';
    markup += '<thead><tr><th class="mtitle">' + getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_METRIC) +
        '</th><th class="value">' + getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_CURRENT) +
        '</th><th class="value">' + changeHeaderTitle +
        '</th><th class="value">' + changeHeaderTitle + '<br>' + getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_PER_YEAR) +
        '</th><th class="chart">' + getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_TARGET_PERCENT) +
        '</th><th class="spark">' + getLocalizedString(pageNavStrings.z_PAGENAV_METRICS_TREND) + '</th></tr></thead>';

    var dataCount = data.length;
    for (var rowIndex = 0; rowIndex < dataCount; rowIndex++) {
        var record = data[rowIndex];
        var pmValueCurrent = record.metricValue;
        var pmValueTarget = record.reportLimitTarget;
        var rowClass = (rowIndex % 2 === 0) ? 'even' : 'odd';
        var barClass = (config.useStoplightColors === 'true') ? record.barClass : '';
        var pChartClass = (record.reportTrendDir != 3) ? 'pchart' : '';
        var currentValue = getPmCurrentValue(pmValueCurrent, pmValueTarget, record.metricValueRaw);
        var valueType = getCurrentValueType(pmValueTarget);

        markup += '<tr class="' + rowClass + '">' +
            '<td class="pmtitle" data-description="' + record.description + '" data-assumptions="'+ record.assumptions + '" data-business-implication="' + record.businessImplication +
            '" data-recurrence="' + record.recurrence + '">' +
            '<span>' + decodeURIComponent(record.metricTitle) + '</span></td>' +
            '<td class="value">' + pmValueCurrent + '</td><td class="value ' + barClass + '">' + record.metricValueChange + '</td>' +
            '<td class="value ' + barClass + '">' + record.metricValueChangePerYear + '</td>' +
            '<td style="padding-left: 15px" class="' + pChartClass + ' processMetricDrilldown" data-metric-name="'+ record.metricName + '" data-bar-class="' + barClass + '"' +
            ' data-current-value="' + currentValue + '" data-value-type="' + valueType + '">' +
            '<div class="target"></div></td>' +
            '<td id="sparkline_' + config.controlIndex + '_' + rowIndex + '" class="sparkline">' + record.metricPreviousValues + '</td></tr>';

    }
    markup += '</table>';

    return markup;
}

/**
 * Return the current value based on the target:
 * either a percentage of target, current value or -1,
 *
 * @param pmValueCurrent
 * @param pmValueTarget
 * @param metricValueRaw
 * @returns {number}
 */
function getPmCurrentValue(pmValueCurrent, pmValueTarget, metricValueRaw) {
    var value = -1;

    if (pmValueTarget > 0) {
        value = ((metricValueRaw / pmValueTarget) * 100).toFixed(0);
    } else if (pmValueTarget === 0) {
        value = pmValueCurrent;
    }

    return value;
}

/**
 * Return the value type based on the target code:
 * either percentage, integer or none,
 *
 * @param pmValueTarget
 * @returns {string}
 */
function getCurrentValueType(pmValueTarget) {
    var valueType = 'none';

    if (pmValueTarget > 0) {
        valueType = 'pct';
    } else if (pmValueTarget === 0) {
        valueType = 'int';
    }

    return valueType;
}

/**
 * Construct a sparkline graph within the already constructed table,
 * transforming the numerical data in the table cell.
 *
 * @param data
 * @param controlIndex
 */
function sparklineCharts(data, controlIndex) {
    var dataCount = data.length;
    for (var rowIndex = 0; rowIndex < dataCount; rowIndex++) {
        var record = data[rowIndex];
        var pmValueTarget = record.reportLimitTarget;
        // KB 3051792 temporary solution for 23.1ML, change to use of velocity context decimalMark in Bali 6.
        var lang = PageNavUserInfo.locale.substr(0,2);
        var decimalMark = lang === 'en' || lang === 'zh'  || lang === 'ja'  || lang === 'ko' ? '.' : ',';
        var digitGroupSeparator = decimalMark === '.' ? ',' : '.';
        var sparklineOptions = {width: '70px', normalRangeMin: pmValueTarget, normalRangeMax: pmValueTarget,
            numberDecimalMark: decimalMark, numberDigitGroupSep: digitGroupSeparator};
        var test = jQuery("#sparkline_" + controlIndex + '_' + rowIndex);
        if (test) {
        jQuery("#sparkline_" + controlIndex + '_' + rowIndex).sparkline('html', sparklineOptions);
        }
    }
}

/**
 * Construct the Percent of Target column bar graph.
 * Do this within the already appended HTML so that the cell width can be known.
 *
 * @param useStoplightColors
 */
function percentCompleteCharts(useStoplightColors) {
	jQuery('.pchart').each( function() {
		var cellWidth = jQuery(this).width();
        var dataSet = this.dataset;
        if (!dataSet) {
            dataSet = {
                currentValue: jQuery(this).attr("data-current-value"),
                valueType: jQuery(this).attr("data-value-type")
            };
        }
		var currentValue = dataSet.currentValue;
		var valueType = dataSet.valueType;
        //- add 1px to show a bar for 0 value
		var barLength = (valueType === 'pct') ? ((cellWidth * currentValue)/100)+1 : cellWidth;
		if (barLength > cellWidth) {barLength = cellWidth;}
		var cval_display = (valueType === 'pct') ? currentValue + '%' : currentValue;
		if (valueType !== 'none') {
			var cellClass = 'bar100';
			if (useStoplightColors === 'true') {
				cellClass = jQuery(this).attr("data-bar-class");
			} else {
				if (currentValue >= 0 && currentValue <= 25) { cellClass = 'bar25'; }
					else if (currentValue > 25 && currentValue <= 50) { cellClass = 'bar50'; }
					else if (currentValue > 50 && currentValue <= 75) {	cellClass = 'bar75'; }
			}
			jQuery(this).html('<div class="target" style="width: ' + cellWidth + 'px"><div class="current ' + cellClass + '" style="width:' + barLength + 'px">' +
						 '</div></div><span class="' + cellClass + '">' + cval_display + '</span>');
		}
	});
}

/**
 * Append an error message into the bucket when data is not retrieved correctly.
 *
 * @param config
 * @param elPlot
 * @param data
 */
function chartBucketErrorMessage(config, elPlot, data) {
    if (!config.elementId) { return; }
	var error_msg = (data === 'wfrerror') ?
        getLocalizedString(pageNavStrings.z_PAGENAV_BUCKET_DEF_ERROR) :
        getLocalizedString(pageNavStrings.z_PAGENAV_NO_DATA_AVAILABLE);
	if (elPlot === 'modal-drilldown') {
		jQuery("#modal-drilldown").html(error_msg);
	} else {
	    var elemId = config.elementId;
        var chartElement = jQuery("#"+elemId);
	    jQuery("#"+elPlot).remove();
        chartElement.addClass("bar-metrics");
        chartElement.append('<div id="' + elPlot + '" class="hchart error"><span class="error">'+error_msg+'</span></div>');
	}
}

/**
 * Bind the left-click context menu for dilling down to supporting views to the
 * column content for the cell with the class 'processMetricDrilldown'.
 */
function bindProcessMetricDrilldown() {
    jQuery.contextMenu({
        selector: '.processMetricDrilldown',
        trigger: 'left',
        build: function(jQuerytrigger, e) {
            var metricName = jQuery(e.currentTarget).attr('data-metric-name');
            var metricTitle = jQuery(e.currentTarget).prevAll('.pmtitle').children().html();
            var metricName_restriction = "afm_metric_grans.metric_name='" + metricName + "'";
		    try {
				var parameters = { viewName: 'ab-metric-drilldown-granularities', dataSourceId: 'metricDrilldownData_ds', restriction: metricName_restriction };
				var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);

				var records = result.data.records;
		        if (Ab.workflow.Workflow.sessionTimeoutDetected) {
		            return {'name': "timeout", 'role': "timeout"};
		        }
		        else if (records && records.length > 0) {
					var drilldownItems = {};
                    var recordCount = records.length;
                    for (var i = 0; i < recordCount; i++) {
		        		var record = records[i];
		        		var gran = record['afm_metric_gran_defs.collect_group_by'];
                        var granTitle = record['afm_metric_gran_defs.granularity_title'];
						var newitem = {};
						newitem[gran] = {
							name: granTitle,
							icon: "chart",
							callback: function(key, opt) { popupBarchart(metricName, metricTitle, key);}
						};
						jQuery.extend(drilldownItems,newitem);
                        // check if gran is mapabble
                        if (gran.indexOf("bl_id") >= 0 || gran.indexOf("site_id") >= 0){
                            var newitem = {};
                            newitem[gran + ' Location'] = {
                                name: granTitle + ' Location',
                                icon: "map",
                                callback: function(key, opt) { popupMap(metricName, metricTitle, key);}
                            };
                            jQuery.extend(drilldownItems,newitem);
                        }
                        // check if gran is mappable
			        }
					return {
                        callback: function(key, options) {
                            var m = "clicked: " + key;
                            window.console && console.log(m);
                        },
                        items: drilldownItems
                    };
				}
				return false;
		    }
		    catch (e) {
		        Workflow.handleError(e);
		    }
		}
   });
}

/**
 * Display a horizontal bar chart in a dialog to show the drilldown data.
 *
 * @param metricName
 * @param metricTitle
 * @param granularity
 * @returns {boolean}
 */
function popupBarchart(metricName, metricTitle, granularity) {
	var newDialog = '<div id="modal-drilldown" style="padding:12px 8px"></div>';
	var drilldown =  jQuery( newDialog ).dialog({
  		title: metricTitle,
 		autoOpen: false,
 		height: 400,
 		width: 280,
 		resizable: false,
 		modal: true,
		open:  function() {	jQuery(".ui-dialog-titlebar-close").show(); },
 		close: function() {	jQuery("#modal-drilldown").remove(); }
 	});

    var config = {
    	'elementId': 'modal-drilldown',
        'bucketWidth': 260,
        'sortOrder': 'desc',
        'valueOnTop': 'largest',
        'recordLimit': '200',
        'useStoplightColors': 'true',
        'abbreviateValues': 'true',
        'subtitle': '',
        'metricName': metricName,
        'granularity': granularity
	};

	drilldown.dialog('open');
    getDataAndConstructBarChart(config, 'modal-drilldown', jQuery('#modal-drilldown') );
	Ab.view.Scroller(jQuery('.jsscroll'));

	return false;
}

/**
 * Display a map in a dialog to show the drilldown data.
 *
 * @param metricName
 * @param metricTitle
 * @param granularity
 * @returns {boolean}
 */
function popupMap(metricName, metricTitle, granularity) {
    var newDialog = '<div id="modal-drilldown" style="padding:12px 8px"></div>';
    var drilldown =  jQuery( newDialog ).dialog({
        title: metricTitle,
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        resizable: false,
        modal: true,
        open:  function() { jQuery(".ui-dialog-titlebar-close").show(); },
        close: function() { jQuery("#modal-drilldown").remove(); }
    });

    // remove ' Location' string that we added to granularity drilldown
    if (granularity.indexOf(" Location") >= 0) {
        granularity = granularity.replace(' Location', '');
    }

    // get location table for granularity
    var granularityLocation;
    if (granularity.indexOf('bl_id') >= 0 ) {
       granularityLocation = 'bl';
    } else if (granularity.indexOf('site_id') >= 0 ) {
        granularityLocation = 'site';
    }

    var config = {
        'elementId': 'modal-drilldown',
        'bucketWidth': 550,
        'sortOrder': 'desc',
        'valueOnTop': 'largest',
        'recordLimit': '200',
        'useStoplightColors': 'true',
        'abbreviateValues': 'true',
        'subtitle': '',
        'metricName': metricName,
        'granularity': granularity,
        'granularityLocation': granularityLocation,
        'mapImplementation' : 'ESRI',
        'basemapLayer' : 'World Light Gray Canvas',
        'markerRadius': '5',
        'popupMap': true
    };

    drilldown.dialog('open');
    getDataAndConstructMap(config, 'modal-drilldown', jQuery('#modal-drilldown') );
    Ab.view.Scroller(jQuery('.jsscroll'));

    return false;
}

/**
 * Bind a click handler to open a dialog with the metrics assumptions.
 */
function bindAssumptions() {
	jQuery(".pmtitle").click( function () {
        var dataSet = this.dataset;
        if (!dataSet) {
            dataSet = {
                description: jQuery(this).attr("data-description"),
                assumptions: jQuery(this).attr("data-assumptions"),
                businessImplication: jQuery(this).attr("data-business-implication"),
                recurrence: jQuery(this).attr("data-recurrence")
            };
        }
		var dialogTitle = jQuery(this).children("span").html().replace(/&amp;/g, '&');
		popupAssumptions(dataSet.description, dataSet.assumptions, dataSet.businessImplication, dataSet.recurrence, dialogTitle);
	});
}

/**
 * The assumptions dialog.
 *
 * @param desc
 * @param asmp
 * @param bimp
 * @param rcur
 * @param dlgtitle
 * @returns {boolean}
 */
function popupAssumptions(desc, asmp, bimp, rcur, dlgtitle) {

	if (document.activeElement.className === "ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close ui-state-focus"
    ) return;    
    //
    // OR if (document.activeElement.attributes.length === 4) return;
    //
	
    var newDialog = '<div id="modal-otherdata" style="padding:16px"></div>';
    var otherdata = jQuery(newDialog).dialog({
        title: dlgtitle,
        autoOpen: false,
        height: 350,
        width: 500,
        resizable: false,
        modal: true,
        open: function () {
            jQuery(".ui-dialog-titlebar-close").show();
        },
        close: function () {
            jQuery("#modal-otherdata").remove();
        }
    });
    var content = '<div class="jsscroll" style="padding: 16px">';
    content += '<div style="font-weight: bold">' + getLocalizedString(pageNavStrings.Z_PAGENAV_METRICS_ASSUMPTIONS_DESCRIPTION) + ':</div>';
    content += '<div style="margin-bottom: 8px">' + decodeURIComponent(desc) + '</div>';
    content += '<div style="font-weight: bold">' + getLocalizedString(pageNavStrings.Z_PAGENAV_METRICS_ASSUMPTIONS) + ':</div>';
    content += '<div style="margin-bottom: 8px">' + decodeURIComponent(asmp) + '</div>';
    content += '<div style="font-weight: bold">' + getLocalizedString(pageNavStrings.Z_PAGENAV_METRICS_ASSUMPTIONS_BSN_IMPL) + ':</div>';
    content += '<div style="margin-bottom: 8px">' + decodeURIComponent(bimp) + '</div>';
    content += '<div style="font-weight: bold">' + getLocalizedString(pageNavStrings.Z_PAGENAV_METRICS_ASSUMPTIONS_RECURRENCE) + ':</div>';
    content += '<div style="margin-bottom: 8px">' + decodeURIComponent(rcur) + '</div>';
    content += '</div>';
    otherdata.dialog('open').html(content);
    Ab.view.Scroller(jQuery('.jsscroll'));

    return false;
}

/**
 * True when the page includes a map control div.
 * Load the Leaflet control CSS and JavaScript
 * when there is a map control div and the files have not already been loaded.
 *
 * @returns {boolean}
 */
function includeMapControlRuntimes() {
    var usesMapPanel = false;

    var mapPanels = jQuery("#homeTabView").find('div.pgnav-map');
    if (mapPanels && mapPanels.length > 0) {
        usesMapPanel = true;
        if (typeof loadMapControls !== 'function') {
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/vendor/leaflet.js");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/css/vendor/leaflet.css");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/css/ab-pgnav-map.css");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/css/MarkerCluster.Default.css");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/css/MarkerCluster.css");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/vendor/esri-leaflet.js");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/vendor/google-maps-api.js");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/leaflet-google.js");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/ab-pgnav-map.js");
            dynamicallyLoadCodeFile(PageNavUserInfo.webAppContextPath + "schema/ab-core/page-navigation/js/leaflet-markercluster.js");
        }
    }

    return usesMapPanel;
}

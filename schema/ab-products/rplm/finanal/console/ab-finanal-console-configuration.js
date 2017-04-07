
View.createController('financialAnalysisConfiguration', {
    afterViewLoad: function() {
        // KB 3053776: use non-localized Analysis Title to match analyses, analysis fields, and panels.
        // FinancialAnalysisConfiguration.analyses = this.analysesDataSource.getRecords();
        var parameters = {
            viewName: "ab-finanal-console", 
            dataSourceId: "analysesDataSource"
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        FinancialAnalysisConfiguration.analyses = [];
        for (var i = 0; i < result.dataSet.records.length; i++) {
            var record = this.analysesDataSource.processInboundRecord(result.dataSet.records[i]);

            var analysisCode = result.data.records[i]['finanal_analyses.analysis_title.key'];
            if (!analysisCode) {
                analysisCode = result.data.records[i]['finanal_analyses.analysis_title'];
            }
            record.setValue('finanal_analyses.analysis_code', analysisCode);

            FinancialAnalysisConfiguration.analyses.push(record);
        }

        FinancialAnalysisConfiguration.analysisGroups = this.analysisGroupsDataSource.getRecords();
        FinancialAnalysisConfiguration.analysisFields = this.analysisFieldsDataSource.getRecords();
        FinancialAnalysisConfiguration.metricDefinitions = this.metricDefinitionsDataSource.getRecords();
        FinancialAnalysisConfiguration.capitalExpenseMatrixFields = this.capitalExpenseMatrixFieldsDataSource.getRecords();
    }
});

FinancialAnalysisConfiguration = new (Base.extend({
    /**
     * Returns a finaanal_analyses record specified by analysis code.
     * @param analysisCode The analysis code.
     */
    getAnalysis: function(analysisCode) {
        return _.find(this.analyses, function(analysis) {
            return analysisCode === analysis.getValue('finanal_analyses.analysis_code');
        });
    },

    /**
     * Returns finanal_loc_groups records that match specified analysis super group.
     * @param analysisSuperGroup The analysis super group.
     */
    getAnalysisGroups: function(analysisSuperGroup) {
        return _.filter(this.analysisGroups, function(analysisGroup) {
            return analysisSuperGroup === analysisGroup.getValue('finanal_loc_group.analysis_super_group');
        });
    },

    /**
     * Returns finanal_loc_groups names that match specified analysis super group.
     * @param analysisSuperGroup The analysis super group.
     */
    getAnalysisGroupNames: function(analysisSuperGroup) {
        var analysisGroupNames = _.filter(this.analysisGroups, function(analysisGroup) {
            return analysisSuperGroup === analysisGroup.getValue('finanal_loc_group.analysis_super_group');
        }).map(function(analysisGroup) {
            return analysisGroup.getValue('finanal_loc_group.analysis_group');
        });

        analysisGroupNames = _.sortBy(analysisGroupNames, function(analysisGroupName) {
            return analysisGroupName.toUpperCase();
        });

        return _.uniq(analysisGroupNames, true);
    },

    /**
     * Returns finanal_loc_group record that is included into specified analysis super group, and contains specified country
     * @param countryCode
     */
    getAnalysisGroupForCountry: function(analysisSuperGroup, countryCode) {
        return _.find(this.analysisGroups, function(record) {
            return analysisSuperGroup === record.getValue('finanal_loc_group.analysis_super_group')
                && countryCode === record.getValue('finanal_loc_group.ctry_id');
        });
    },

    /**
     * Returns countries included into specified analysis group.
     * @param analysisSuperGroup The analysis super group.
     * @param analysisGroup The analysis group.
     */
    getCountriesForAnalysisGroup: function(analysisSuperGroup, analysisGroup) {
        var countries = _.filter(this.analysisGroups, function(record) {
            return analysisSuperGroup === record.getValue('finanal_loc_group.analysis_super_group')
                && analysisGroup === record.getValue('finanal_loc_group.analysis_group');
        }).map(function(record) {
            return record.getValue('finanal_loc_group.ctry_id');
        });

        return _.uniq(countries, true);
    },

    /**
     * Returns finanal_analyses_fields records for specified analysis and panel.
     * @param analysisCode The analysis code.
     * @param panel The panel name: Analysis Scorecard;Asset Scorecard;Asset Map;Site Map;Lifecycle Analysis;Trend Analysis;
     */
    getAnalysisFields: function(analysisCode, panel) {
        var fields = _.filter(this.analysisFields, function(analysisField) {
            return analysisCode === analysisField.getValue('finanal_analyses_flds.analysis_title')
                && panel === analysisField.getValue('finanal_analyses_flds.analysis_console_panel');
        });

        return _.sortBy(fields, function(analysisField) {
            return analysisField.getValue('finanal_analyses_flds.display_order');
        });
    },

    /**
     * Returns finanal_analyses_fields records for specified capital and expense matrix box and panel.
     * @param boxId The matrix box ID.
     * @param panel The panel name: Analysis Scorecard;Asset Scorecard;Asset Map;Site Map;Lifecycle Analysis;Trend Analysis;
     */
    getAnalysisFieldsForBox: function(boxId, panel) {
        var fields = _.filter(this.capitalExpenseMatrixFields, function(analysisField) {
            return boxId === analysisField.getValue('finanal_matrix_flds.box_id')
                && panel === analysisField.getValue('finanal_matrix_flds.analysis_console_panel');
        });

        fields = _.sortBy(fields, function(analysisField) {
            return analysisField.getValue('finanal_matrix_flds.display_order');
        });

        _.each(fields, function(field) {
            field.setValue('finanal_analyses_flds.analysis_table', field.getValue('finanal_matrix_flds.analysis_table'));
            field.setValue('finanal_analyses_flds.analysis_field', field.getValue('finanal_matrix_flds.analysis_field'));
            field.setValue('finanal_analyses_flds.display_order', field.getValue('finanal_matrix_flds.display_order'));
        });

        return fields;
    },

    /**
     * Updates finanal_analyses_fields records for specified analysis and panel.
     * @param analysisCode The analysis code.
     * @param panel The panel name: Analysis Scorecard;Asset Scorecard;Asset Map;Site Map;Lifecycle Analysis;Trend Analysis;
     * @param newAnalysisFields The list of analysis field records - same format as returned from getAnalysisFields.
     * @param andSave If true, also saves updated records to the database.
     */
    updateAnalysisFields: function(analysisCode, panel, newAnalysisFields, andSave) {
        // previous set of analysis field
        var oldAnalysisFields = this.getAnalysisFields(analysisCode, panel);

        // find which fields to delete or add
        var fieldsToDelete = _.difference(oldAnalysisFields, newAnalysisFields);
        var fieldsToAdd = _.difference(newAnalysisFields, oldAnalysisFields);

        // update cached analysis fields
        this.analysisFields = _.difference(this.analysisFields, fieldsToDelete);
        this.analysisFields = _.union(this.analysisFields, fieldsToAdd);

        // update the database
        if (andSave) {
            var dataSource = View.dataSources.get('analysisFieldsDataSource');
            var addRecords = 0;
            var deletedRecords = 0;
            try {
                _.each(fieldsToDelete, function (analysisField) {
                    dataSource.deleteRecord(analysisField);
                    deletedRecords++;
                });
                _.each(fieldsToAdd, function (analysisField) {
                    dataSource.saveRecord(analysisField);
                    addRecords++;
                });
                // View.alert(getMessage('updateSuccessful'));
            } catch (e) {
                View.alert(getMessage('updatedFailed'));
            }
        }
    },

    /**
     * Returns a metric definition for specified analysis field.
     * @param analysisField The analysis field name (afm_metric_definitions.analysis_result_field).
     */
    getMetricDefinition: function(analysisField) {
    	var fieldName = analysisField;
        return _.find(this.metricDefinitions, function(metricDefinition, tableName, fieldName) {
            return analysisField === metricDefinition.getValue('afm_metric_definitions.analysis_result_field');
        });
    },

    /**
     * Returns an object that represents the trend direction for specified analysis field.
     * @param analysisField The analysis field name (afm_metric_definitions.analysis_result_field).
     */
    getMetricTrendDirection: function(analysisField) {
        var smallerIsBetter = function(reportLimitHighCritical, reportLimitHighWarning, value) {
            var color = 'green';

            if (reportLimitHighCritical && value >= reportLimitHighCritical) {
                color = 'red';
            } else if (reportLimitHighWarning && value >= reportLimitHighWarning) {
                color = 'yellow';
            }

            return color;
        }

        var largerIsBetter = function(reportLimitLowCritical, reportLimitLowWarning, value) {
            var color = 'green';

            if (reportLimitLowCritical && value <= reportLimitLowCritical) {
                color = 'red';
            } else if (reportLimitLowWarning && value <= reportLimitLowWarning) {
                color = 'yellow';
            }

            return color;
        }

        var onTargetIsBetter = function(reportLimitHighCritical, reportLimitHighWarning, reportLimitLowCritical, reportLimitLowWarning, value) {
            var color = 'green';

            var smallerIsBetterResult = smallerIsBetter(reportLimitHighCritical, reportLimitHighWarning, value);
            var largerIsBetterResult = largerIsBetter(reportLimitLowCritical, reportLimitLowWarning, value);

            if (color !== smallerIsBetterResult) {
                color = smallerIsBetterResult;
            } else if (color !== largerIsBetterResult) {
                color = largerIsBetterResult;
            }

            return color;
        }

        var trendDirection = null;

        var metric = this.getMetricDefinition(analysisField);
        if (metric) {
            var reportTrendDir = metric.getValue('afm_metric_definitions.report_trend_dir');
            var reportLimitHighCritical = metric.getValue('afm_metric_definitions.report_limit_high_crit');
            var reportLimitHighWarning = metric.getValue('afm_metric_definitions.report_limit_high_warn');
            var reportLimitLowCritical = metric.getValue('afm_metric_definitions.report_limit_low_crit');
            var reportLimitLowWarning = metric.getValue('afm_metric_definitions.report_limit_low_warn');

            if (reportTrendDir === '0') {
                trendDirection = function(value) {
                    return smallerIsBetter(reportLimitHighCritical, reportLimitHighWarning, value);
                }
            } else if (reportTrendDir === '1') {
                trendDirection = function(value) {
                    return largerIsBetter(reportLimitLowCritical, reportLimitLowWarning, value);
                }
            } else if (reportTrendDir === '2') {
                trendDirection = function(value) {
                    return onTargetIsBetter(reportLimitHighCritical, reportLimitHighWarning, reportLimitLowCritical, reportLimitLowWarning, value);
                }
            }
        }

        return trendDirection;
    },

    /**
     * Formats specified analysis field based on metric definition.
     * @param analysisField The analysis field name (afm_metric_definitions.analysis_result_field).
     * @param value The original value.
     * @return The formatted value.
     */
    formatMetricValue: function(analysisField, value) {
        var formattedValue = value;

        var metric = this.getMetricDefinition(analysisField);
        if (metric) {
            var displayFormat =  View.user.displayUnits == 'imperial' ?
                metric.getValue('afm_metric_definitions.value_disp_format') :
                metric.getValue('afm_metric_definitions.value_disp_format_m');
            var decimals = metric.getValue('afm_metric_definitions.value_disp_decimals');
            if (isNaN(decimals)) {
                decimals = -1;
            }

            var numeric = metric.getValue('afm_metric_definitions.value_disp_numeric');
            if (numeric === 'P') {
                value = value * 100;
            }

            if (decimals !== '' && decimals > -1) {
                formattedValue = parseFloat(value).toFixed(decimals);
            }

            var decimalSeparator = (typeof strDecimalSeparator !== 'undefined') ? strDecimalSeparator : '.';
            var numberFormatter = {precision: decimals, decimalSeparator: decimalSeparator};
            var prefixesOfBigNumbers = [
                {"number":1e+3,"prefix":" k"},
                {"number":1e+6,"prefix":" M"},
                {"number":1e+9,"prefix":" G"},
                {"number":1e+12,"prefix":" T"},
                {"number":1e+15,"prefix":" P"},
                {"number":1e+18,"prefix":" E"},
                {"number":1e+21,"prefix":" Z"},
                {"number":1e+24,"prefix":" Y"}
            ];
            if (Number(formattedValue) > 0) {
                formattedValue = AmCharts.addPrefix(formattedValue, prefixesOfBigNumbers, [], numberFormatter);
            }

            if (displayFormat != null && displayFormat !== '') {
                formattedValue = displayFormat.replace('{0}', formattedValue);
            }

            if (numeric === 'B') {
                formattedValue = View.project.budgetCurrency.symbol + formattedValue;
            } else if (numeric === 'P') {
                formattedValue = formattedValue + '%';
            }
        }

        return formattedValue;
    },

    /**
     * Returns numeric format for the metric.
     * @param analysisField The analysis field name (afm_metric_definitions.analysis_result_field).
     * @return The numeric format, e.g. 'N' for numeric values, 'P' for percent values, B' for budget currency values.
     */
    getMetricDisplayFormat: function(analysisField) {
        var displayFormat = 'N';

        var metric = this.getMetricDefinition(analysisField);
        if (metric) {
            displayFormat = metric.getValue('afm_metric_definitions.value_disp_numeric');
        }

        return displayFormat;
    },

    /**
     * Returns current fiscal year.
     */
    getCurrentFiscalYear: function() {
        var schemaPreferencesDataSource = Ab.data.createDataSourceForFields({
            id : 'schemaPreferencesDataSource',
            tableNames: ['afm_scmpref'],
            fieldNames: ['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth']
        });
        var schemaPreferences = schemaPreferencesDataSource.getRecord();
        var fiscalYearStartDay = schemaPreferences.getValue('afm_scmpref.fiscalyear_startday'); // 1 based
        var fiscalYearStartMonth = schemaPreferences.getValue('afm_scmpref.fiscalyear_startmonth'); // 1 based

        var today = new Date();
        var todayMonth = today.getMonth(); // 0 based
        var todayDate = today.getDate(); // 1 based

        var fiscalYear = today.getFullYear();
        if ((todayMonth === fiscalYearStartMonth - 1 && todayDate >= fiscalYearStartDay) || todayMonth > fiscalYearStartMonth) {
            fiscalYear++;
        }

        return fiscalYear;
    }
}));
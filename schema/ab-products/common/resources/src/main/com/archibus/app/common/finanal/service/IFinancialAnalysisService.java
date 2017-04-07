package com.archibus.app.common.finanal.service;

import java.util.*;

import com.archibus.datasource.data.DataRecord;

/**
 * Provides methods for Financial Analysis Service.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public interface IFinancialAnalysisService {

    /**
     * Aggregate operating cost for specified period.
     *
     * @param type what to aggregate (all, workrequest, servicerequest)
     * @param startFrom start date
     * @param endTo end date
     */
    void aggregateOperatingCosts(final String type, final Date startFrom, final Date endTo);

    /**
     * Forecast capital costs for selected cost categories and create scheduled costs.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param record finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategParam object containing cost type and cost category
     */
    void forecastCapitalCosts(final String assetType, final DataRecord record,
            final String frequency, final Map<String, String> costCategParam);

    /**
     * Estimate income and expenses costs and create recurring costs.
     *
     * @param parameters object containing values for asset type, asset code, frequency and
     *            finanal_params.auto_number value
     * @param costCategParam object containing cost category code and cost type ("income" or
     *            "expense")
     * @param costValuesParam object containing cost category code and value from form
     * @param startDate estimation start date
     * @param endDate estimation end date
     *
     */
    void estimateIncomeExpensesCosts(final Map<String, Object> parameters,
            final Map<String, String> costCategParam, final Map<String, String> costValuesParam,
            final Date startDate, final Date endDate);
}

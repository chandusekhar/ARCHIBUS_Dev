package com.archibus.app.common.finanal.impl;

import static com.archibus.app.common.finanal.impl.Constants.*;

import java.util.*;

import com.archibus.app.common.finanal.service.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;

/**
 * Implementation of Financial Analysis Service.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialAnalysisService extends JobBase implements IFinancialAnalysisService {

    @Override
    public void aggregateOperatingCosts(final String type, final Date startFrom, final Date endTo) {
        final FinancialAnalysisScheduledJob aggregateOperatingCostsJob =
                new FinancialAnalysisScheduledJob();
        aggregateOperatingCostsJob.setJobStatus(this.status);
        aggregateOperatingCostsJob.setDateStart(startFrom);
        aggregateOperatingCostsJob.setDateEnd(endTo);
        if ("all".equals(type)) {
            aggregateOperatingCostsJob.aggregateOperatingCosts();
        } else if ("workrequest".equals(type)) {
            aggregateOperatingCostsJob.aggregateWorkRequestCosts();
        } else if ("servicerequest".equals(type)) {
            aggregateOperatingCostsJob.aggreagetServiceRequestCosts();
        }
    }

    @Override
    public void forecastCapitalCosts(final String assetType, final DataRecord mainLoanRecord,
            final String frequency, final Map<String, String> costCategParam) {
        final ForecastCapitalCosts forecastCapitalCosts = new ForecastCapitalCosts();

        if (costCategParam.containsKey(PRINCIPAL_COST_TYPE)) {
            forecastCapitalCosts.calculatePrincipalCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(PRINCIPAL_COST_TYPE));
        }

        if (costCategParam.containsKey(INTEREST_COST_TYPE)) {
            forecastCapitalCosts.calculateInterestCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(INTEREST_COST_TYPE));
        }

        if (costCategParam.containsKey(CAPITAL_COST_TYPE)) {
            forecastCapitalCosts.calculateCapitalCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(CAPITAL_COST_TYPE));
        }

        if (costCategParam.containsKey(DEPRECIATION_COST_TYPE)) {
            forecastCapitalCosts.calculateDepreciationCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(DEPRECIATION_COST_TYPE));
        }

        if (costCategParam.containsKey(APPRECIATION_COST_TYPE)) {
            forecastCapitalCosts.calculateAppreciationCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(APPRECIATION_COST_TYPE));
        }

        if (costCategParam.containsKey(DISPOSITION_COST_TYPE)) {
            forecastCapitalCosts.calculateDispositionCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(DISPOSITION_COST_TYPE));
        }

        if (costCategParam.containsKey(SALVAGE_COST_TYPE)) {
            forecastCapitalCosts.calculateSalvageCosts(assetType, mainLoanRecord, frequency,
                costCategParam.get(SALVAGE_COST_TYPE));
        }

        // get record of subloans
        forecastCapitalCostsForSubloans(assetType, mainLoanRecord, frequency, costCategParam);
    }

    /**
     * Forecast capital costs for selected cost categories and create scheduled costs for subloan
     * records.
     *
     * @param assetType 'bl', 'pr', 'proj' or 'eq'
     * @param mainLoanRecord finanal_params record from the form
     * @param frequency 'YEAR' or 'MONTH'
     * @param costCategParam object containing cost type and cost category
     */
    private void forecastCapitalCostsForSubloans(final String assetType,
            final DataRecord mainLoanRecord, final String frequency,
            final Map<String, String> costCategParam) {
        final ForecastCapitalCosts forecastCapitalCosts = new ForecastCapitalCosts();

        final List<DataRecord> records =
                forecastCapitalCosts.getSubloanRecords(assetType, mainLoanRecord);
        for (int i = 0; i < records.size(); i++) {
            final DataRecord record = records.get(i);

            // Calculate only for financing cost categories
            if (costCategParam.containsKey(PRINCIPAL_COST_TYPE)) {
                forecastCapitalCosts.calculatePrincipalCosts(assetType, record, frequency,
                    costCategParam.get(PRINCIPAL_COST_TYPE));
            }

            if (costCategParam.containsKey(INTEREST_COST_TYPE)) {
                forecastCapitalCosts.calculateInterestCosts(assetType, record, frequency,
                    costCategParam.get(INTEREST_COST_TYPE));
            }

            if (costCategParam.containsKey(CAPITAL_COST_TYPE)) {
                forecastCapitalCosts.calculateCapitalCosts(assetType, record, frequency,
                    costCategParam.get(CAPITAL_COST_TYPE));
            }

        }
    }

    @Override
    public void estimateIncomeExpensesCosts(final Map<String, Object> parameters,
            final Map<String, String> costCategParam, final Map<String, String> costValuesParam,
            final Date startDate, final Date endDate) {

        final EstimateIncomeExpensesCosts estimateIncomeExpensesCosts =
                new EstimateIncomeExpensesCosts();

        final Iterator<String> iterator = costCategParam.keySet().iterator();
        while (iterator.hasNext()) {
            final String costCategId = iterator.next();
            final String costType = costCategParam.get(costCategId);
            final String value = costValuesParam.get(costCategId);

            estimateIncomeExpensesCosts.createIncomeExpenseCost(parameters, costType, costCategId,
                Double.parseDouble(value), startDate, endDate);
        }
    }
}

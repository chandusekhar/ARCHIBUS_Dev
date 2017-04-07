package com.archibus.app.common.finanal.service;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.finanal.dao.*;
import com.archibus.app.common.finanal.dao.datasource.*;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.model.config.Currency;

/**
 * SFA Aggregating operating costs job. Run as scheduled job.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialAnalysisScheduledJob extends JobBase {
    /**
     * Logger for this class.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Start date.
     */
    private Date dateStart = new Date();

    /**
     * End date.
     */
    private Date dateEnd = new Date();

    /**
     * Job status.
     */
    private JobStatus jobStatus;

    /**
     * Setter for the dateStart property.
     *
     * @see dateStart
     * @param dateStart the dateStart to set
     */

    public void setDateStart(final Date dateStart) {
        this.dateStart = dateStart;
    }

    /**
     * Setter for the dateEnd property.
     *
     * @see dateEnd
     * @param dateEnd the dateEnd to set
     */

    public void setDateEnd(final Date dateEnd) {
        this.dateEnd = dateEnd;
    }

    /**
     * Setter for the jobStatus property.
     *
     * @see jobStatus
     * @param jobStatus the jobStatus to set
     */

    public void setJobStatus(final JobStatus jobStatus) {
        this.jobStatus = jobStatus;
    }

    /**
     * Run aggregate operating costs in scheduled mode.
     *
     */
    public void aggregateOperatingCosts() {
        initPerRequestState();
        final AggregateOperatingCostsHelper aggregateOperatingCostsHelper =
                new AggregateOperatingCostsHelper();

        final Map<String, Object> queryVariables =
                aggregateOperatingCostsHelper.getQueryVariables();
        final List<Date> aggregationDates =
                DateUtils.calculateAggregationDates(this.dateStart, this.dateEnd);

        final String messageTemplate = "Aggregate Operating Cost: %s";
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "Started");
            this.logger.info(message);
        }

        this.jobStatus.setTotalNumber(aggregationDates.size());

        for (final Date currentStartDate : aggregationDates) {
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }

            this.jobStatus.incrementCurrentNumber();

            final Date currentEndDate =
                    DateUtils.incrementDate(currentStartDate, Calendar.MONTH, 1);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_START, currentStartDate);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_END, currentEndDate);

            aggregateOperatingCostsHelper.deleteAggregatedCosts(queryVariables);

            final String localizedDescriptionWr =
                    Messages.getLocalizedMessage(Messages.AGGREGATE_OPERATING_COSTS_DESCRIPTION);
            queryVariables.put(Constants.VARIABLE_KEY_DESCRIPTION, localizedDescriptionWr);
            aggregateOperatingCostsHelper.aggregateWorkRequestCosts(queryVariables);

            final String localizedDescriptionSrActual = Messages
                .getLocalizedMessage(Messages.ACTUAL_COST_AGGREGATE_OPERATING_COSTS_DESCRIPTION);
            queryVariables.put(Constants.VARIABLE_KEY_DESCRIPTION, localizedDescriptionSrActual);
            aggregateOperatingCostsHelper.aggregateActualServiceRequestCosts(queryVariables);

            final String localizedDescriptionSrEstimated = Messages
                .getLocalizedMessage(Messages.ESTIMATED_COST_AGGREGATE_OPERATING_COSTS_DESCRIPTION);
            queryVariables.put(Constants.VARIABLE_KEY_DESCRIPTION, localizedDescriptionSrEstimated);
            aggregateOperatingCostsHelper.aggregateEstimatedServiceRequestCosts(queryVariables);

        }

        closeJobProgressWhenIsZero();

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "End");
            this.logger.info(message);
        }
    }

    /**
     * Aggregate work request costs between start date and end date.
     *
     */
    public void aggregateWorkRequestCosts() {
        initPerRequestState();
        final AggregateOperatingCostsHelper aggregateOperatingCostsHelper =
                new AggregateOperatingCostsHelper();
        final Map<String, Object> queryVariables =
                aggregateOperatingCostsHelper.getQueryVariables();
        final List<Date> aggregationDates =
                DateUtils.calculateAggregationDates(this.dateStart, this.dateEnd);

        final String messageTemplate = "Aggregate Operating Cost %s";
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "for Work Request: Started");
            this.logger.info(message);
        }

        this.jobStatus.setTotalNumber(aggregationDates.size());

        for (final Date currentStartDate : aggregationDates) {
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            this.jobStatus.incrementCurrentNumber();

            final Date currentEndDate =
                    DateUtils.incrementDate(currentStartDate, Calendar.MONTH, 1);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_START, currentStartDate);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_END, currentEndDate);

            aggregateOperatingCostsHelper.aggregateWorkRequestCosts(queryVariables);

        }

        closeJobProgressWhenIsZero();

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "for Work Request: End");
            this.logger.info(message);
        }
    }

    /**
     * Aggregate service request costs between start date and end date.
     *
     */
    public void aggreagetServiceRequestCosts() {
        initPerRequestState();
        final AggregateOperatingCostsHelper aggregateOperatingCostsHelper =
                new AggregateOperatingCostsHelper();
        final Map<String, Object> queryVariables =
                aggregateOperatingCostsHelper.getQueryVariables();
        final List<Date> aggregationDates =
                DateUtils.calculateAggregationDates(this.dateStart, this.dateEnd);

        final String messageTemplate = "Aggregate Operating Cost  %s";
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "for Service Request: Started");
            this.logger.info(message);
        }

        this.jobStatus.setTotalNumber(aggregationDates.size());

        for (final Date currentStartDate : aggregationDates) {
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }

            this.jobStatus.incrementCurrentNumber();

            final Date currentEndDate =
                    DateUtils.incrementDate(currentStartDate, Calendar.MONTH, 1);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_START, currentStartDate);
            queryVariables.put(Constants.VARIABLE_KEY_DATE_END, currentEndDate);

            aggregateOperatingCostsHelper.aggregateActualServiceRequestCosts(queryVariables);

        }

        closeJobProgressWhenIsZero();

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(messageTemplate, "for Service Request: End");
            this.logger.info(message);
        }
    }

    /**
     * Run update analysis metrics in scheduled mode.
     *
     */
    public void updateAnalysisMetrics() {
        initPerRequestState();
        final IFinancialMetricDao<FinancialMetric> finMetricDao = new FinancialMetricDataSource();
        final List<FinancialMetric> activeMetrics = finMetricDao.getActiveMetrics();

        if (this.logger.isInfoEnabled()) {
            final String message =
                    String.format("Update Analysis Metrics Started at %s ", new Date().toString());
            this.logger.info(message);
        }
        this.jobStatus.setMessage(
            Messages.getLocalizedMessage(Messages.SCHEDULED_JOB_UPDATE_ANALYSIS_METRICS));
        this.jobStatus.setTotalNumber(activeMetrics.size());

        final AnalysisMetricsProcessor metricsProcessor = new AnalysisMetricsProcessor();
        final Date fiscalYearStart = DateUtils.getCurrentFiscalYearStartDate();
        final Date fiscalYearEnd = DateUtils.getCurrentFiscalYearEndDate();
        // delete all sample data
        metricsProcessor.deleteSampleData();

        final Iterator<FinancialMetric> itActiveMetrics = activeMetrics.iterator();
        while (itActiveMetrics.hasNext()) {
            final FinancialMetric metric = itActiveMetrics.next();
            if (this.jobStatus.isStopRequested()) {
                this.jobStatus.setCode(JobStatus.JOB_STOPPED);
                break;
            }

            final String jobStatusMessage = String.format(
                Messages.getLocalizedMessage(Messages.SCHEDULED_JOB_PROCESSING_METRICS),
                metric.getTitle());
            this.jobStatus.setMessage(jobStatusMessage);
            this.jobStatus.incrementCurrentNumber();

            if (this.logger.isInfoEnabled()) {
                final String message =
                        String.format(Messages.SCHEDULED_JOB_PROCESSING_METRICS, metric.getTitle());
                this.logger.info(message);
            }
            // TODO check collect dates
            metricsProcessor.processMetric(metric, fiscalYearStart, fiscalYearEnd);

            // force commit after metric is processed
            SqlUtils.commit();
        }

        // update capital and expense matrix fields.
        updateCapitalAndExpenseMatrix();

        closeJobProgressWhenIsZero();

        if (this.logger.isInfoEnabled()) {
            final String message =
                    String.format("Update Analysis Metrics End at %s ", new Date().toString());
            this.logger.info(message);
        }

    }

    /**
     * Update capital and expense matrix values. Calculate and update values from finanal_matrix
     * table.
     *
     */
    public void updateCapitalAndExpenseMatrix() {
        final IFinancialMatrixDao<FinancialMatrix> financialMatrixDao =
                new FinancialMatrixDataSource();
        initPerRequestState();
        final List<FinancialMatrix> valueMatrixFields = financialMatrixDao.getMatrixFields(
            Restrictions.isNotNull(DbConstants.FINANAL_MATRIX_TABLE, DbConstants.VALUE_CALC));
        final Locale locale = ContextStore.get().getUserAccount().getLocale();
        final Currency budgetCurrency = ContextStore.get().getProject().getBudgetCurrency();

        for (final FinancialMatrix matrixField : valueMatrixFields) {
            final double value = financialMatrixDao.calculateFieldValue(matrixField);
            matrixField.setValue(value);
            matrixField.formatCalculatedValues(locale, budgetCurrency);
            financialMatrixDao.update(matrixField);
        }

        final List<FinancialMatrix> valueMarketMatrixFields =
                financialMatrixDao.getMatrixFields(Restrictions
                    .isNotNull(DbConstants.FINANAL_MATRIX_TABLE, DbConstants.VALUE_CALC_MARKET));
        for (final FinancialMatrix matrixField : valueMarketMatrixFields) {
            final double valueMarket = financialMatrixDao.calculateMarketFieldValue(matrixField);
            matrixField.setValueMarket(valueMarket);
            matrixField.formatCalculatedValues(locale, budgetCurrency);
            financialMatrixDao.update(matrixField);
        }
    }

    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        if (this.jobStatus == null) {
            this.jobStatus = this.status;
        }
    }

    /**
     * Used to update progress bar when there is now data to process (current number and total
     * number are zero).
     *
     */
    private void closeJobProgressWhenIsZero() {
        if (this.jobStatus.getTotalNumber() == 0 && this.jobStatus.getCurrentNumber() == 0) {
            this.jobStatus.setTotalNumber(1);
            this.jobStatus.incrementCurrentNumber();
        }
    }

}

package com.archibus.eventhandler.rplm;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.cost.*;
import com.archibus.utility.*;

/**
 *
 * YS: refactor LeaseAdministrationHandlers and add XLS reporting functions
 *
 */
public class LeaseAdministrationHandlers extends JobBase {
    /**
     * Constant: VAT amount balance report file name.
     */
    private final String VAT_AMOUNT_BALANCE_REPORT = "ab-rplm-cost-mgmt-vat-bal.axvw";

    /**
     * Export Straight line rent to XLS.
     *
     * @param viewName view name
     * @param title report title
     * @param groupByFields group by fields
     * @param calculatedFields calculated fields
     * @param requestParam request parameters
     */
    public void getStraightLineRentXlsReport(final String viewName, final String title,
            final List<Map<String, String>> groupByFields,
            final List<Map<String, Object>> calculatedFields, final Map<String, String> requestParam) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);

            final CostReportingService costReportingService =
                    (CostReportingService) ContextStore.get().getEventHandler(
                            "CostReportingService");
            final Map<String, String> reqParamClone = new HashMap<String, String>();
            reqParamClone.putAll(requestParam);
            final DataSet dataSet =
                    costReportingService.getStraightLineRentProjection(reqParamClone);
            this.status.setCurrentNumber(50);
            final RequestParameters parameters = new RequestParameters(requestParam);
            // customized XLS builder
            final XLSReport xlsReportBuilder = new XLSReport();
            xlsReportBuilder.setStraightLineRentReport(true);

            final String calculationType = parameters.getCostTypeOf();
            final String projectionType = parameters.getCostAssocWith();
            final String period = parameters.getPeriod();
            final boolean isGroupByCostcategory = parameters.getBooleanValue("group_by_cost_categ");

            xlsReportBuilder.setProjectionType(projectionType);
            xlsReportBuilder.setCalculationType(calculationType);
            xlsReportBuilder.setStripMinus(CostProjection.CALCTYPE_EXPENSE.equals(calculationType));
            xlsReportBuilder.setGroupByCostCategory(isGroupByCostcategory);
            if (StringUtil.notNull(period).equals("MONTH")) {
                xlsReportBuilder.setMonthFormat(true);
            } else if (StringUtil.notNull(period).equals("QUARTER")) {
                xlsReportBuilder.setQuarterFormat(true);
                xlsReportBuilder.setQuarters(parameters.getDateStart(), parameters.getDateEnd());
            }
            xlsReportBuilder.setFileName(xlsReportBuilder.createFileName(viewName));
            this.status.setCurrentNumber(70);
            xlsReportBuilder.build(dataSet, title, groupByFields, calculatedFields);

            final String fileName = xlsReportBuilder.getFileName();
            final String url = xlsReportBuilder.getURL();
            final JobResult result = new JobResult(title, fileName, url);
            this.status.setResult(result);
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);

        } catch (final Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", viewName), e);
        }
    }

    /**
     * Export cash flow to XLS.
     *
     * @param viewName view name
     * @param title report title
     * @param groupByFields group by fields
     * @param calculatedFields calculated fields
     * @param requestParam report request parameters
     */
    public void getCashFlowProjectionXLSReport(final String viewName, final String title,
            final List<Map<String, String>> groupByFields,
            final List<Map<String, Object>> calculatedFields, final Map<String, String> requestParam) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);

            final CostReportingService costReportingService =
                    (CostReportingService) ContextStore.get().getEventHandler(
                            "CostReportingService");
            final DataSet dataSet = costReportingService.getCashFlowProjection(requestParam);
            this.status.setCurrentNumber(50);
            final RequestParameters parameters = new RequestParameters(requestParam);
            // customized XLS builder
            final XLSReport xlsReportBuilder = new XLSReport();
            xlsReportBuilder.setVATCashFlowReport(this.VAT_AMOUNT_BALANCE_REPORT.equals(viewName));

            final String calculationType = parameters.getCostTypeOf();
            final String projectionType = parameters.getCostAssocWith();
            final String period = parameters.getPeriod();

            xlsReportBuilder.setProjectionType(projectionType);
            xlsReportBuilder.setCalculationType(calculationType);
            xlsReportBuilder.setStripMinus(CostProjection.CALCTYPE_EXPENSE.equals(calculationType));
            if (StringUtil.notNull(period).equals("MONTH")) {
                xlsReportBuilder.setMonthFormat(true);
            } else if (StringUtil.notNull(period).equals("QUARTER")) {
                xlsReportBuilder.setQuarterFormat(true);
                xlsReportBuilder.setQuarters(parameters.getDateStart(), parameters.getDateEnd());
            }
            xlsReportBuilder.setFileName(xlsReportBuilder.createFileName(viewName));
            this.status.setCurrentNumber(70);
            xlsReportBuilder.build(dataSet, title, groupByFields, calculatedFields);

            final String fileName = xlsReportBuilder.getFileName();
            final String url = xlsReportBuilder.getURL();
            final JobResult result = new JobResult(title, fileName, url);
            this.status.setResult(result);
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (final Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", viewName), e);
        }
    }

    /**
     * Get summarized asset costs based on MC and VAT user request parameters.
     *
     * @param parameters
     * @return records dataset
     */
    public DataSet getAssetCostFields(final Map<String, Object> parameters) {
        final String reportParametersKey = "customReportParameters";
        final DataSet records = null;
        // get report parameters
        Map<String, Object> reportParameters = new HashMap<String, Object>();
        if (parameters.containsKey(reportParametersKey)) {
            reportParameters = (Map<String, Object>) parameters.get(reportParametersKey);
        }

        reportParameters.get("currencyVatParams");

        return records;
    }

    /**
     * WFR - called to export XLS report
     *
     * @param reportViewName
     * @param dataSourceId
     * @param reportTitle
     * @param visibleFieldDefs
     * @param restriction
     * @param parameters
     */
    public void generateGridXLSReport(final String reportViewName, final String dataSourceId,
            final String reportTitle, final List<Map<String, Object>> visibleFieldDefs,
            final String restriction, final Map<String, Object> parameters) {
        try {
            this.status.setTotalNumber(100);
            this.status.setCurrentNumber(0);

            final DataSource dataSource =
                    DataSourceFactory.loadDataSourceFromFile(reportViewName, dataSourceId);
            if (parameters != null) {
                ReportUtility.handleParameters(dataSource, parameters);
            }
            final List<DataRecord> records = dataSource.getRecords(restriction);

            this.status.setCurrentNumber(50);
            final RepmGridXLSBuilder reportBuilder = new RepmGridXLSBuilder();
            /*
             * IOAN 12/07/2010 set report file name, created from view name
             */
            reportBuilder.setFileName(reportBuilder.createFileName(reportViewName));

            reportBuilder.build(records, reportTitle, visibleFieldDefs);

            final String fileName = reportBuilder.getFileName();
            final String url = reportBuilder.getURL();
            final JobResult result = new JobResult(reportTitle, fileName, url);
            this.status.setResult(result);

            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.status.setCurrentNumber(100);
        } catch (final Exception e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(String.format(
                "Fail to export a XLS report with a view name [%s]", reportViewName), e);
        }
    }

    /**
     * Insert new records for all Cost Categories that don�t exist already for selected country with
     * new VAT percent value.
     *
     * @param ctryId selected country
     * @param vatPercentValue VAT percent value
     */
    public void copyCostCategories(final String ctryId, final String vatPercentValue) {
        int vatVal = 0;
        double vatValD = 0.0;
        try {
            vatVal = Integer.parseInt(vatPercentValue);
        } catch (final NumberFormatException nfe) {
            try {
                vatValD = Double.parseDouble(vatPercentValue);

            } catch (final NumberFormatException e) {
                throw new ExceptionBase(e.getLocalizedMessage());
            }
        }

        final String[] costFields = { "cost_cat_id" };
        final DataSource dsCost =
                DataSourceFactory.createDataSourceForFields("cost_cat", costFields);
        final String[] vatFields = { "ctry_id", "cost_cat_id", "vat_percent_value" };

        final List<DataRecord> costCategories = dsCost.getRecords();
        final Iterator<DataRecord> itCost = costCategories.iterator();

        while (itCost.hasNext()) {
            final String costId = itCost.next().getString("cost_cat.cost_cat_id");
            final DataSource dsVat =
                    DataSourceFactory.createDataSourceForFields("vat_percent", vatFields);
            dsVat.addRestriction(Restrictions.eq("vat_percent", "ctry_id", ctryId));
            dsVat.addRestriction(Restrictions.eq("vat_percent", "cost_cat_id", costId));
            if (dsVat.getRecords().isEmpty()) {
                // insert new record
                final DataRecord record = dsVat.createRecord();
                record.setNew(true);
                record.setValue("vat_percent.ctry_id", ctryId);
                record.setValue("vat_percent.cost_cat_id", costId);
                record.setValue("vat_percent.vat_percent_value", (vatVal == 0) ? vatValD : vatVal);
                dsVat.saveRecord(record);
            }
        }
    }

    /**
     * Update VAT percent values for selected country and selected cost categories with the new VAT
     * percent value.
     *
     * @param ctryId selected country
     * @param vatPercentValue VAT percent value
     * @param costCategories selected cost categories
     */
    public void assignVatPercent(final String ctryId, final String vatPercentValue,
            final List<String> costCategories) {
        int vatVal = 0;
        double vatValD = 0.0;
        try {
            vatVal = Integer.parseInt(vatPercentValue);
        } catch (final NumberFormatException nfe) {
            try {
                vatValD = Double.parseDouble(vatPercentValue);

            } catch (final NumberFormatException e) {
                throw new ExceptionBase(e.getLocalizedMessage());
            }
        }

        final String[] vatFields = { "ctry_id", "cost_cat_id", "vat_percent_value" };

        final Iterator<String> itCost = costCategories.iterator();

        while (itCost.hasNext()) {
            final String costId = itCost.next();
            final DataSource dsVat =
                    DataSourceFactory.createDataSourceForFields("vat_percent", vatFields);
            dsVat.addRestriction(Restrictions.eq("vat_percent", "ctry_id", ctryId));
            dsVat.addRestriction(Restrictions.eq("vat_percent", "cost_cat_id", costId));
            if (!dsVat.getRecords().isEmpty()) {
                // update record
                final DataRecord record = dsVat.getRecord();
                record.setNew(false);
                record.setValue("vat_percent.ctry_id", ctryId);
                record.setValue("vat_percent.cost_cat_id", costId);
                record.setValue("vat_percent.vat_percent_value", (vatVal == 0) ? vatValD : vatVal);
                dsVat.saveRecord(record);
            }
        }
    }
}

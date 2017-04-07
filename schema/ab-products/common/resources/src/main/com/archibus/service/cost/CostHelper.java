package com.archibus.service.cost;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.Period;
import com.archibus.service.cost.SummarizeCosts.SummaryType;
import com.archibus.utility.StringUtil;

/**
 * Cost service helper class.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public final class CostHelper {

    /**
     * Constant.
     */
    private static final String PERCENT_OP = "%";

    /**
     * Constant.
     */
    private static final String ROW_DIMENSION = "row";

    /**
     * Constant.
     */
    private static final String COL_DIMENSION = "column";

    /**
     * Constant.
     */
    private static final String MEASURE = "measure";

    /**
     * Constant.
     */
    private static final String IS_NOT_NULL_OPERATOR = " IS NOT NULL ";

    /**
     * Constant.
     */
    private static final String AND_OPERATOR = " AND ";

    /**
     * Constant.
     */
    private static final String OR_OPERATOR = " OR ";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CostHelper() {

    }

    /**
     * Get field double value from map object.
     *
     * @param field field name
     * @param values fields values
     * @param defaultValue value used if field is not defined
     * @return field value or default
     */
    public static Double getDoubleValue(final String field, final Map<String, String> values,
            final Double defaultValue) {
        Double result = defaultValue;
        if (values.containsKey(field) && StringUtil.notNullOrEmpty(values.get(field))) {
            result = Double.valueOf(values.get(field));
        }
        return result;
    }

    /**
     * Get field double value from map object.
     *
     * @param field field name
     * @param values field values
     * @return field value or null
     */
    public static Double getDoubleValue(final String field, final Map<String, String> values) {
        return getDoubleValue(field, values, null);
    }

    /**
     * Read all cost id's from specified cost table based on user options.
     *
     * @param costTable cost table
     * @param updateAll if all cost must be updated
     * @param isNewCost if only new cost must be updated
     * @param date reference date
     * @param costIds cost id's list
     * @param costType cost type list
     */
    public static void getCostIdsFromTable(final String costTable, final boolean updateAll,
            final boolean isNewCost, final Date date, final List<Integer> costIds,
            final List<String> costType) {
        String pkeyFieldName = null;
        String dateDueFieldName = null;
        if (DbConstants.COST_TRAN_TABLE.equals(costTable)) {
            pkeyFieldName = DbConstants.COST_TRAN_ID;
            dateDueFieldName = DbConstants.DATE_DUE;
        } else if (DbConstants.COST_TRAN_RECUR_TABLE.equals(costTable)) {
            pkeyFieldName = DbConstants.COST_TRAN_RECUR_ID;
            dateDueFieldName = DbConstants.DATE_END;
        } else if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costTable)) {
            pkeyFieldName = DbConstants.COST_TRAN_SCHED_ID;
            dateDueFieldName = DbConstants.DATE_DUE;
        }
        String sqlRestriction = "1 = 1";
        if (!updateAll && StringUtil.notNullOrEmpty(date)) {
            sqlRestriction +=
                    AND_OPERATOR + dateDueFieldName + " > " + SqlUtils.formatValueForSql(date);
        }
        if (isNewCost) {
            sqlRestriction += " AND (amount_income = 0 AND amount_expense = 0 ) ";
        }

        final String sqlQuery =
                "SELECT " + pkeyFieldName + " FROM " + costTable + " WHERE " + sqlRestriction;

        final List<DataRecord> records =
                SqlUtils.executeQuery(costTable, new String[] { pkeyFieldName }, sqlQuery);
        for (final DataRecord record : records) {
            costIds.add(record.getInt(costTable + "." + pkeyFieldName));
            costType.add(costTable);
        }
    }

    /**
     * Return id's list in sql string format.
     *
     * @param ids id's
     * @return string
     */
    public static String getSqlString(final List<Integer> ids) {
        String result = "";
        for (int i = 0; i < ids.size(); i++) {
            result += (result.length() == 0 ? "" : ",") + ids.get(i).toString();
        }
        return result;
    }

    /**
     * Get cost date due. Applicable only for scheduled and actual costs.
     *
     * @param cost cost object
     * @param costType cost type
     * @param date current date
     * @return date
     */
    public static Date getConvertDateFromCost(final Cost cost, final String costType,
            final Date date) {
        Date dateDue = date;
        if (DbConstants.COST_TRAN_SCHED_TABLE.equals(costType)) {
            dateDue = ((ScheduledCost) cost).getDateDue();
        } else if (DbConstants.COST_TRAN_TABLE.equals(costType)) {
            dateDue = ((ActualCost) cost).getDateDue();
        }
        return dateDue;
    }

    /**
     * Calculate CAM Reconciliation report data.
     *
     * @param leaseId lease code
     * @param isMcAndVatEnabled if multi currency and vat is enabled
     * @param requestParameters report request parameters
     * @param jobStatus job status
     */
    public static void calculateCamReconciliationData(final String leaseId,
            final boolean isMcAndVatEnabled, final RequestParameters requestParameters,
            final JobStatus jobStatus) {
        boolean continueJob = true;
        JobStatusUtil.initializeJob(jobStatus, Constants.ONE_HUNDRED, 0);

        // get cost projection for lease and selected date range
        final CostProjection projection =
                new CostProjection(DbConstants.LS_ID, requestParameters.getDateStart(),
                    requestParameters.getDateEnd(), requestParameters.getPeriod());
        final List<CostPeriod> costPeriods = projection.createPeriodsForAsset(leaseId);

        final SummarizeCosts summarizeCostsHandler =
                new SummarizeCosts(SummaryType.CAM_RECONCILIATION.toString());

        final SimpleDateFormat simpleDateFormat = new SimpleDateFormat();
        simpleDateFormat.applyPattern("yyyy-MM-dd");

        JobStatusUtil.incrementJobCurrentNo(jobStatus, Long.valueOf("5"));
        continueJob = JobStatusUtil.checkJobStatus(jobStatus);
        final Double jobIncrement = Double
            .valueOf((Constants.ONE_HUNDRED - Double.valueOf("10")) / (costPeriods.size() + 1));
        // clear buffer table for logged user
        clearBufferTable(ContextStore.get().getUser().getName(),
            SummaryType.CAM_RECONCILIATION.toString());
        for (int index = 0; continueJob && index < costPeriods.size(); index++) {
            final CostPeriod period = costPeriods.get(index);
            // update date start and date end
            requestParameters.setParameterValue(DbConstants.DATE_START,
                simpleDateFormat.format(period.getDateStart()));
            requestParameters.setParameterValue(DbConstants.DATE_END,
                simpleDateFormat.format(period.getDateEnd()));

            continueJob = summarizeCostsHandler.calculateCamReconciliation(leaseId,
                requestParameters, isMcAndVatEnabled, jobStatus);
            JobStatusUtil.incrementJobCurrentNo(jobStatus, jobIncrement.longValue());
        }

        if (continueJob) {
            JobStatusUtil.completeJob(jobStatus);
        }
    }

    /**
     * Create default (empty) cost projection.
     *
     * @param dataSource data source object
     * @param parameters request parameters
     * @param defaultStartDate default start date
     * @param defaultEndDate default end date
     * @return {@link CostProjection}
     */
    public static CostProjection createEmptyProjection(final ICostDao<RecurringCost> dataSource,
            final RequestParameters parameters, final Date defaultStartDate,
            final Date defaultEndDate) {
        Date startDate = parameters.getDateStart();
        Date endDate = parameters.getDateEnd();
        String period = parameters.getPeriod();
        String projectionType = parameters.getCostAssocWith();
        if (startDate == null) {
            startDate = defaultStartDate;
        }

        if (endDate == null) {
            endDate = defaultEndDate;
        }

        if (period == null) {
            period = Period.MONTH;
        }

        if (Constants.LEASES_FOR_BUILDINGS.equals(projectionType)
                || Constants.LEASES_FOR_PROPERTIES.equals(projectionType)) {
            projectionType = Constants.LEASES_ALL;
        }
        final CreateCostProjection creator = new CreateCostProjection(dataSource);
        return creator.createDefaultCostProjection(projectionType, startDate, endDate, period);
    }

    /**
     * Calculate cash flow projection.
     *
     * @param dataSource data source
     * @param parameters request parameters
     * @param defaultStartDate default start date
     * @param defaultEndDate default end date
     * @param jobStatus job status
     * @return CostProjection
     */
    public static CostProjection calculateCashFlowProjection(
            final ICostDao<RecurringCost> dataSource, final RequestParameters parameters,
            final Date defaultStartDate, final Date defaultEndDate, final JobStatus jobStatus) {
        Date startDate = parameters.getDateStart();
        Date endDate = parameters.getDateEnd();
        String period = parameters.getPeriod();
        String calculationType = parameters.getCostTypeOf();
        String projectionType = parameters.getCostAssocWith();

        if (startDate == null) {
            startDate = defaultStartDate;
        }

        if (endDate == null) {
            endDate = defaultEndDate;
        }

        if (period == null) {
            period = Period.MONTH;
        }

        if (calculationType == null) {
            calculationType = CostProjection.CALCTYPE_NETINCOME;
        }

        if (Constants.LEASES_FOR_BUILDINGS.equals(projectionType)
                || Constants.LEASES_FOR_PROPERTIES.equals(projectionType)) {
            projectionType = Constants.LEASES_ALL;
        }
        // Get restrictions for cost tables
        final String actualCostRestriction =
                getCashFlowRestrictionForTable(DbConstants.COST_TRAN_TABLE, parameters);
        final String schedCostRestriction =
                getCashFlowRestrictionForTable(DbConstants.COST_TRAN_SCHED_TABLE, parameters);
        final String recurCostRestriction =
                getCashFlowRestrictionForTable(DbConstants.COST_TRAN_RECUR_TABLE, parameters);

        final CreateCostProjection creator = new CreateCostProjection(dataSource);
        final boolean isGroupByCostCategory = parameters.getBooleanValue("group_by_cost_categ");

        creator.setEnhancedFeatureParameters(parameters.isMcAndVatEnabled(),
            parameters.isBudgetCurrency(), parameters.getCurrencyCode(),
            ExchangeRateType.fromString(parameters.getExchangeRateType()),
            parameters.getVatCostType());

        return creator.calculateCashFlowProjection(projectionType, startDate, endDate, period,
            calculationType, isGroupByCostCategory, parameters.isFromActual(),
            parameters.isFromScheduled(), parameters.isFromRecurring(), recurCostRestriction,
            schedCostRestriction, actualCostRestriction, jobStatus);
    }

    /**
     * Create an empty data set.
     *
     * @param projection projection object
     * @return data set
     */
    public static DataSet2D createEmptyDataSet(final CostProjection projection) {
        final String rowDimension = DbConstants.getFieldFullName(DbConstants.COST_TRAN_RECUR_TABLE,
            projection.getAssetKey());
        final String colDimension = DbConstants.getFieldFullName(DbConstants.COST_TRAN_RECUR_TABLE,
            DbConstants.DATE_START);
        return new DataSet2D(rowDimension, colDimension);
    }

    /**
     * Creates DataSet from cost projection.
     *
     * @param projection cost projection
     * @param dataSource data source object
     * @param isGroupByCostCategory if are grouped by cost category
     * @param showAllCosts if zero cost should be displayed or not
     * @param multipleValueSeparator separator for multiple values
     * @return DataSet2D
     */
    public static DataSet projectionToDataSet(final CostProjection projection,
            final DataSource dataSource, final boolean isGroupByCostCategory,
            final boolean showAllCosts, final String multipleValueSeparator) {

        final Map<String, String> dimension = new HashMap<String, String>();
        dimension.put(ROW_DIMENSION, DbConstants.getFieldFullName(DbConstants.COST_TRAN_RECUR_TABLE,
            projection.getAssetKey()));
        dimension.put(COL_DIMENSION, DbConstants.getFieldFullName(DbConstants.COST_TRAN_RECUR_TABLE,
            DbConstants.DATE_START));
        dimension.put(MEASURE, DbConstants.getFieldFullName(DbConstants.COST_TRAN_RECUR_TABLE,
            DbConstants.AMOUNT_INCOME));

        final List<DataRecord> records = new ArrayList<DataRecord>();
        for (final String assetId : projection.getAssetIds()) {
            if (isGroupByCostCategory) {
                final List<String> costCategories = projection.getCostCategories(assetId);
                for (final String costCategory : costCategories) {
                    if (!costCategory.endsWith(CostProjection.DEFAULT_COST_CATEGORY)) {
                        final List<CostPeriod> periods =
                                projection.getPeriodsForAssetAndCostCategory(assetId, costCategory);
                        addRecords(dataSource, dimension, assetId, costCategory, periods, records,
                            showAllCosts, multipleValueSeparator);
                    }
                }
            } else {
                final List<CostPeriod> periods = projection.getPeriodsForAsset(assetId);
                addRecords(dataSource, dimension, assetId, null, periods, records, showAllCosts,
                    multipleValueSeparator);
            }
        }

        final DataSet2D dataSet = createEmptyDataSet(projection);
        dataSet.addRecords(records);
        return dataSet;
    }

    /**
     * Creates records from projection cost periods for specified asset and cost category.
     *
     * Disable Checkstyle: Number of parameters JUSTIFICATION: Multiple value separator was changed
     * and the old one is still used in cash flow WFR when is grouped by cost category and this is
     * passed as parameter
     *
     * @param dataSource data source
     * @param dimensions projection dimensions definition
     * @param assetId asset id
     * @param costCategory cost category
     * @param periods periods
     * @param records records
     * @param isDisplayAll keep zero values
     * @param multipleValueSeparator separator for multiple values
     */
    // CHECKSTYLE:OFF
    public static void addRecords(final DataSource dataSource, final Map<String, String> dimensions,
            final String assetId, final String costCategory, final List<CostPeriod> periods,
            final List<DataRecord> records, final boolean isDisplayAll,
            final String multipleValueSeparator) {

        if (verifyPeriodsHaveCosts(periods) || isDisplayAll) {
            String rowDimensionValue = assetId;
            if (costCategory != null) {
                rowDimensionValue += multipleValueSeparator + costCategory;
            }
            for (final CostPeriod period : periods) {
                final DataRecord periodRecord = dataSource.createRecord();
                periodRecord.setValue(dimensions.get(ROW_DIMENSION), rowDimensionValue);
                periodRecord.setValue(dimensions.get(COL_DIMENSION), period.getDateStart());
                periodRecord.setValue(dimensions.get(MEASURE), period.getCost());

                records.add(periodRecord);
            }
        }
    }

    // CHECKSTYLE:ON

    /**
     * Verify if at least one period has a non zero cost attached.
     *
     * @param periods periods list
     * @return true if periods have costs, else false
     */
    public static boolean verifyPeriodsHaveCosts(final List<CostPeriod> periods) {
        boolean haveCosts = false;
        for (final CostPeriod period : periods) {
            if (!period.getCost().equals(BigDecimal.ZERO)) {
                haveCosts = true;
            }
        }
        return haveCosts;
    }

    /**
     * Clear buffer table for user and report.
     *
     * @param userName logged user name
     * @param reportType requested report type
     */
    public static void clearBufferTable(final String userName, final String reportType) {
        final String sqlStatement =
                "DELETE FROM ccost_sum WHERE user_name = " + SqlUtils.formatValueForSql(userName)
                        + " AND report_name = " + SqlUtils.formatValueForSql(reportType);
        SqlUtils.executeUpdate("ccost_sum", sqlStatement);
    }

    /**
     * Returns sql restriction for specified cost table and request parameters.
     *
     * @param costTable cost table name
     * @param parameters request parameters
     * @return sql string
     */
    private static String getCashFlowRestrictionForTable(final String costTable,
            final RequestParameters parameters) {
        final String costAssociatedWith = parameters.getCostAssocWith();
        final String fieldName = getForeignKeyByType(costAssociatedWith);
        String restriction =
                DbConstants.getFieldFullName(costTable, fieldName) + IS_NOT_NULL_OPERATOR;

        restriction +=
                AND_OPERATOR + parameters.getRestrictionForTableAndField(costTable, fieldName);

        restriction += AND_OPERATOR + getExistsClause(costTable, parameters);

        // Add cost categories restriction
        final String includeCostCateg = parameters.getStringValue("include_cost_categ");
        if (StringUtil.notNullOrEmpty(includeCostCateg)) {
            final boolean isLikeOp = includeCostCateg
                .indexOf(PERCENT_OP + parameters.getMultipleValueSeparator()) != -1;
            String inSqlStatement = "";
            if (isLikeOp) {
                final String[] costCategories =
                        includeCostCateg.split(parameters.getMultipleValueSeparator());
                String whereClause = "";
                for (final String costCatId : costCategories) {
                    whereClause += (whereClause.length() > 0 ? OR_OPERATOR : "")
                            + " cost_cat.cost_cat_id LIKE '" + costCatId + "' ";

                }
                inSqlStatement = "SELECT cost_cat.cost_cat_id FROM cost_cat WHERE " + whereClause;

            } else {
                inSqlStatement = " '"
                        + includeCostCateg.replaceAll(parameters.getMultipleValueSeparator(), "','")
                        + "'";
            }
            restriction += AND_OPERATOR + costTable + ".cost_cat_id IN (" + inSqlStatement + ")";
        }

        final String excludeCostCateg = parameters.getStringValue("exclude_cost_categ");
        if (StringUtil.notNullOrEmpty(excludeCostCateg)) {
            restriction += AND_OPERATOR + costTable + ".cost_cat_id NOT IN ('"
                    + excludeCostCateg.replaceAll(parameters.getMultipleValueSeparator(), "', '")
                    + "')";
        }
        // add cam cost restriction
        final String camCost = parameters.getStringValue("cam_cost");
        if (StringUtil.notNullOrEmpty(camCost)) {
            restriction +=
                    AND_OPERATOR + costTable + ".cam_cost = " + SqlUtils.formatValueForSql(camCost);
        }

        return restriction;
    }

    /**
     * Get exist clause based on cost associated with.
     *
     * @param costTable cost table
     * @param parameters request parameters
     * @return String
     */
    private static String getExistsClause(final String costTable,
            final RequestParameters parameters) {
        final String costAssociatedWith = parameters.getCostAssocWith();
        final boolean isForLease = Constants.LEASES_FOR_BUILDINGS.equals(costAssociatedWith)
                || Constants.LEASES_FOR_PROPERTIES.equals(costAssociatedWith)
                || Constants.LEASES_ALL.equals(costAssociatedWith);
        final String sqlJoinWithBl = isForLease
                ? " EXISTS(SELECT ls.ls_id FROM ls, bl WHERE ls.use_as_template = 0 AND "
                        + costTable + ".ls_id = ls.ls_id AND ls.bl_id = bl.bl_id "
                        + parameters.getLocationRestrictionForTable2(DbConstants.BL_TABLE)
                        + " AND  ${sql.getVpaRestrictionForTable('bl')} )"
                : " EXISTS(SELECT bl.bl_id FROM bl WHERE " + costTable + ".bl_id = bl.bl_id "
                        + parameters.getLocationRestrictionForTable2(DbConstants.BL_TABLE)
                        + " AND ${sql.getVpaRestrictionForTable('bl')} )";

        final String sqlJoinWithProperty = isForLease
                ? " EXISTS(SELECT ls.ls_id FROM ls, property WHERE ls.use_as_template = 0 AND "
                        + costTable + ".ls_id = ls.ls_id AND ls.pr_id = property.pr_id "
                        + parameters.getLocationRestrictionForTable2(DbConstants.PR_TABLE)
                        + " AND  ${sql.getVpaRestrictionForTable('property')} )"
                : " EXISTS(SELECT property.pr_id FROM property WHERE " + costTable
                        + ".pr_id = property.pr_id "
                        + parameters.getLocationRestrictionForTable2(DbConstants.PR_TABLE)
                        + " AND ${sql.getVpaRestrictionForTable('property')} )";
        String result = "1=1";
        if (DbConstants.BL_TABLE.equals(costAssociatedWith)
                || Constants.LEASES_FOR_BUILDINGS.equals(costAssociatedWith)) {
            result = sqlJoinWithBl;
        }

        if (DbConstants.PR_TABLE.equals(costAssociatedWith)
                || Constants.LEASES_FOR_PROPERTIES.equals(costAssociatedWith)) {
            result = sqlJoinWithProperty;
        }

        if (Constants.LEASES_ALL.equals(costAssociatedWith)) {
            result = "( " + sqlJoinWithBl + OR_OPERATOR + sqlJoinWithProperty + " )";
        }
        return result;
    }

    /**
     * Returns foreign key by cash flow projection type.
     *
     * @param projectionType cash flow projection type
     * @return String
     */
    private static String getForeignKeyByType(final String projectionType) {
        String key = "";
        if (DbConstants.AC_TABLE.equals(projectionType)) {
            key = DbConstants.AC_ID;
        } else if (DbConstants.BL_TABLE.equals(projectionType)) {
            key = DbConstants.BL_ID;
        } else if (DbConstants.PR_TABLE.equals(projectionType)) {
            key = DbConstants.PR_ID;
        } else if (Constants.LEASES_ALL.equals(projectionType)
                || Constants.LEASES_FOR_BUILDINGS.equals(projectionType)
                || Constants.LEASES_FOR_PROPERTIES.equals(projectionType)) {
            key = DbConstants.LS_ID;
        }
        return key;
    }

}

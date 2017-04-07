package com.archibus.app.common.finanal.dao.datasource;

import java.util.*;

import com.archibus.app.common.finanal.dao.IFinancialAnalysisParametersDao;
import com.archibus.app.common.finanal.domain.FinancialAnalysisParameter;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * Financial analysis datasource object. Mapped to finanal_params database table.
 *
 *
 * <p>
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialAnalysisParametersDataSource
        extends ObjectDataSourceImpl<FinancialAnalysisParameter>
        implements IFinancialAnalysisParametersDao<FinancialAnalysisParameter> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "auto_number", "parameterId" },
            { "bl_id", "buildingCode" }, { "pr_id", "propertyCode" }, { "eq_id", "equipmentCode" },
            { "project_id", "projectCode" }, { "property_type", "propertyType" },
            { "date_purchased", "datePurchased" }, { "date_apprec_start", "dateApprecStart" },
            { "date_loan_start", "dateLoanStart" }, { "date_market_val", "dateMarketVal" },
            { "loan_term", "loanTerm" }, { "planned_life", "plannedLife" },
            { "sub_loan", "subLoan" }, { "cost_basis_for_deprec", "costBasisForDeprec" },
            { "cost_of_land", "costOfLand" }, { "cost_purchase", "costPurchase" },
            { "loan_amount", "loanAmount" }, { "loan_down_payment", "loanDownPayment" },
            { "loan_rate", "loanRate" }, { "rate_apprec", "rateApprec" },
            { "value_market", "valueMarket" } };

    /**
     * {@link FinancialAnalysisParametersDataSource}.
     *
     */
    public FinancialAnalysisParametersDataSource() {
        super("financialAnalysisParameter", Constants.FINANAL_PARAMS);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public FinancialAnalysisParameter getFinancialParameterForAssetId(final String assetType,
            final String assetId) {
        final String pkFieldName = AssetType.fromString(assetType).getAssetFieldName();
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(Constants.FINANAL_PARAMS, pkFieldName, assetId));
        final DataRecord record = dataSource.getRecord();

        return new DataSourceObjectConverter<FinancialAnalysisParameter>()
            .convertRecordToObject(record, this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<FinancialAnalysisParameter> getFinancialParameterForAssetTypes(
            final List<String> assetTypes) {
        final DataSource dataSource = this.createCopy();
        final String restriction = MetricProviderUtils
            .getAssetTypeRestrictionForTable(Constants.FINANAL_PARAMS, assetTypes);
        dataSource.addRestriction(Restrictions.sql(restriction));
        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<FinancialAnalysisParameter>()
            .convertRecordsToObjects(records, this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<FinancialAnalysisParameter> getFinancialParameters(final Restriction restriction) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(restriction);
        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<FinancialAnalysisParameter>()
            .convertRecordsToObjects(records, this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */

    @Override
    public FinancialAnalysisParameter getFinancialParameterById(final int parameterId) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(
            Restrictions.eq(Constants.FINANAL_PARAMS, Constants.AUTO_NUMBER, parameterId));
        final DataRecord record = dataSource.getRecord();

        return new DataSourceObjectConverter<FinancialAnalysisParameter>()
            .convertRecordToObject(record, this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */

    @Override
    public List<FinancialAnalysisParameter> getFinancialParameterByAssetType(
            final String assetType) {
        final List<String> type = new ArrayList<String>();
        type.add(assetType);
        return getFinancialParameterForAssetTypes(type);
    }

    /** {@inheritDoc} */

    @Override
    public List<FinancialAnalysisParameter> getFinancialParametersForMetric(
            final MetricProvider metricProvider, final Date collectStartDate,
            final Date collectEndDate) {
        final List<FinancialAnalysisParameter> result = new ArrayList<FinancialAnalysisParameter>();
        if (metricProvider.isApplicableForAssetType(AssetType.BUILDING)) {
            final List<FinancialAnalysisParameter> buildings =
                    getFinancialParameterByAssetType(AssetType.BUILDING.toString());
            result.addAll(buildings);
            final List<FinancialAnalysisParameter> buildingsFromInventory =
                    getBuildingsFromInventory(collectStartDate, collectEndDate);
            result.addAll(buildingsFromInventory);
        }

        if (metricProvider.isApplicableForAssetType(AssetType.PROPERTY)) {
            final List<FinancialAnalysisParameter> properties =
                    getFinancialParameterByAssetType(AssetType.PROPERTY.toString());
            result.addAll(properties);
            final List<FinancialAnalysisParameter> propertiesFromInventory =
                    getPropertiesFromInventory(collectStartDate, collectEndDate);
            result.addAll(propertiesFromInventory);
        }

        if (metricProvider.isApplicableForAssetType(AssetType.PROJECT)) {
            final List<FinancialAnalysisParameter> projects =
                    getFinancialParameterByAssetType(AssetType.PROJECT.toString());
            result.addAll(projects);
        }

        if (metricProvider.isApplicableForAssetType(AssetType.EQUIPMENT)) {
            final List<FinancialAnalysisParameter> equipment =
                    getFinancialParameterByAssetType(AssetType.EQUIPMENT.toString());
            result.addAll(equipment);
        }
        return result;
    }

    /**
     * Get buildings from inventory.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1.1: Statements with SELECT WHERE EXISTS ... pattern. Case #3:
     * Calculations with conditional logic.
     *
     * @param collectStartDate start date for calculation period
     * @param collectEndDate end date for calculation period
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */

    @SuppressWarnings("PMD.AvoidUsingSql")
    private List<FinancialAnalysisParameter> getBuildingsFromInventory(final Date collectStartDate,
            final Date collectEndDate) {
        final DataSource buildingDataSource = DataSourceFactory.createDataSourceForFields(
            DbConstants.BUILDING_TABLE,
            new String[] { DbConstants.BL_ID, DbConstants.VALUE_BOOK, DbConstants.DATE_BOOK_VAL });
        buildingDataSource.addQuery("SELECT bl.bl_id ${sql.as} bl_id, (CASE "
                + "        WHEN EXISTS(SELECT ot.ot_id FROM ot WHERE ot.bl_id = bl.bl_id)"
                + "            THEN (SELECT ot.cost_purchase FROM ot WHERE ot.bl_id = bl.bl_id  AND ot.ot_id = (SELECT MAX(ot.ot_id) FROM ot WHERE ot.bl_id = bl.bl_id)) "
                + "        ELSE bl.value_book END) ${sql.as} value_book, (CASE "
                + "        WHEN EXISTS(SELECT ot.ot_id FROM ot WHERE ot.bl_id = bl.bl_id) "
                + "            THEN (SELECT ot.date_purchase FROM ot WHERE ot.bl_id = bl.bl_id  AND ot.ot_id = (SELECT MAX(ot.ot_id) FROM ot WHERE ot.bl_id = bl.bl_id))"
                + "        ELSE bl.date_book_val END) ${sql.as} date_book_val  FROM bl");

        buildingDataSource.addRestriction(Restrictions.sql(
            "bl.bl_id NOT IN (SELECT finanal_params.bl_id FROM finanal_params where bl_id IS NOT NULL)"));
        buildingDataSource.addRestriction(Restrictions.sql(
            "(EXISTS(SELECT * FROM cost_tran_recur WHERE cost_tran_recur.bl_id = bl.bl_id AND (cost_tran_recur.date_start <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " OR  cost_tran_recur.date_end >= "
                    + SqlUtils.formatValueForSql(collectStartDate)
                    + " )) OR EXISTS(SELECT * FROM cost_tran_sched WHERE cost_tran_sched.bl_id = bl.bl_id AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " AND  ${sql.isNull('cost_tran_sched.date_paid',  'cost_tran_sched.date_due')} >= "
                    + SqlUtils.formatValueForSql(collectStartDate)
                    + " ) OR EXISTS(SELECT * FROM cost_tran WHERE cost_tran.bl_id = bl.bl_id  AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " AND  ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} >= "
                    + SqlUtils.formatValueForSql(collectStartDate) + "  )) "));
        final List<DataRecord> records = buildingDataSource.getRecords();
        final List<FinancialAnalysisParameter> results =
                new ArrayList<FinancialAnalysisParameter>();
        for (final DataRecord record : records) {
            final FinancialAnalysisParameter financialAnalysisParameter =
                    new FinancialAnalysisParameter();
            financialAnalysisParameter.setBuildingCode(record.getString("bl.bl_id"));
            financialAnalysisParameter.setCostPurchase(record.getDouble("bl.value_book"));
            financialAnalysisParameter.setDatePurchased(record.getDate("bl.date_book_val"));
            results.add(financialAnalysisParameter);
        }
        return results;
    }

    /**
     * Get properties from inventory.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1.1: Statements with SELECT WHERE EXISTS ... pattern. Case #3:
     * Calculations with conditional logic.
     *
     * @param collectStartDate start date for calculation period
     * @param collectEndDate end date for calculation period
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private List<FinancialAnalysisParameter> getPropertiesFromInventory(final Date collectStartDate,
            final Date collectEndDate) {
        final DataSource buildingDataSource = DataSourceFactory.createDataSourceForFields(
            DbConstants.PROPERTY_TABLE,
            new String[] { DbConstants.PR_ID, DbConstants.VALUE_BOOK, DbConstants.DATE_BOOK_VAL });
        buildingDataSource.addQuery("SELECT property.pr_id ${sql.as} pr_id, (CASE "
                + "        WHEN EXISTS(SELECT ot.ot_id FROM ot WHERE ot.pr_id = property.pr_id)"
                + "            THEN (SELECT ot.cost_purchase FROM ot WHERE ot.pr_id = property.pr_id  AND ot.ot_id = (SELECT MAX(ot.ot_id) FROM ot WHERE ot.pr_id = property.pr_id)) "
                + "        ELSE property.value_book END) ${sql.as} value_book, (CASE "
                + "        WHEN EXISTS(SELECT ot.ot_id FROM ot WHERE ot.pr_id = property.pr_id) "
                + "            THEN (SELECT ot.date_purchase FROM ot WHERE ot.pr_id = property.pr_id  AND ot.ot_id = (SELECT MAX(ot.ot_id) FROM ot WHERE ot.pr_id = property.pr_id))"
                + "        ELSE property.date_book_val END) ${sql.as} date_book_val  FROM property");

        buildingDataSource.addRestriction(Restrictions.sql(
            "property.pr_id NOT IN (SELECT finanal_params.pr_id FROM finanal_params WHERE finanal_params.pr_id IS NOT NULL)"));
        buildingDataSource.addRestriction(Restrictions.sql(
            "(EXISTS(SELECT * FROM cost_tran_recur WHERE cost_tran_recur.pr_id = property.pr_id AND (cost_tran_recur.date_start <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " OR cost_tran_recur.date_end >= "
                    + SqlUtils.formatValueForSql(collectStartDate)
                    + " )) OR EXISTS(SELECT * FROM cost_tran_sched WHERE cost_tran_sched.pr_id = property.pr_id AND ${sql.isNull('cost_tran_sched.date_paid', 'cost_tran_sched.date_due')} <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " AND ${sql.isNull('cost_tran_sched.date_paid',  'cost_tran_sched.date_due')} >= "
                    + SqlUtils.formatValueForSql(collectStartDate)
                    + " ) OR EXISTS(SELECT * FROM cost_tran WHERE cost_tran.pr_id = property.pr_id  AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} <= "
                    + SqlUtils.formatValueForSql(collectEndDate)
                    + " AND ${sql.isNull('cost_tran.date_paid', 'cost_tran.date_due')} >= "
                    + SqlUtils.formatValueForSql(collectStartDate) + "  ))"));
        final List<DataRecord> records = buildingDataSource.getRecords();
        final List<FinancialAnalysisParameter> results =
                new ArrayList<FinancialAnalysisParameter>();
        for (final DataRecord record : records) {
            final FinancialAnalysisParameter financialAnalysisParameter =
                    new FinancialAnalysisParameter();
            financialAnalysisParameter.setPropertyCode(record.getString("property.pr_id"));
            financialAnalysisParameter.setCostPurchase(record.getDouble("property.value_book"));
            financialAnalysisParameter.setDatePurchased(record.getDate("property.date_book_val"));
            results.add(financialAnalysisParameter);
        }
        return results;
    }

}

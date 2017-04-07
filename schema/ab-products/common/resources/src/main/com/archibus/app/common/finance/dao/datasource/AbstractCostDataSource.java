package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.db.ViewField;
import com.archibus.utility.*;

/**
 * Base class for Cost DataSources. Provides common functionality for Cost DataSources.
 * <p>
 * TODO: (VT): unit test
 *
 * @author Ioan Draghici
 * @author Valery Tydykov
 *
 * @param <Cost> Type of persistent object.
 */
public abstract class AbstractCostDataSource<Cost> extends ObjectDataSourceImpl<Cost>
        implements ICostDao<Cost> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "ac_id", "accountId" },
            { "amount_expense", "amountExpense" }, { "amount_income", "amountIncome" },
            { Constants.COST_CAT_ID, "costCategoryId" },
            { Constants.DESCRIPTION, Constants.DESCRIPTION }, { "dv_id", "divisionId" },
            { "dp_id", "departmentId" }, { "bl_id", "buildingId" }, { "pr_id", "propertyId" },
            { "ls_id", "leaseId" }, { "parcel_id", "parcelId" },
            { Constants.OPTION1, Constants.OPTION1 }, { Constants.OPTION2, Constants.OPTION2 },
            { "pa_name", "assetName" }, { "amount_expense_base_budget", "amountExpenseBaseBudget" },
            { "amount_expense_base_payment", "amountExpenseBasePayment" },
            { "amount_expense_total_payment", "amountExpenseTotalPayment" },
            { "amount_expense_vat_budget", "amountExpenseVatBudget" },
            { "amount_expense_vat_payment", "amountExpenseVatPayment" },
            { "amount_income_base_budget", "amountIncomeBaseBudget" },
            { "amount_income_base_payment", "amountIncomeBasePayment" },
            { "amount_income_total_payment", "amountIncomeTotalPayment" },
            { "amount_income_vat_budget", "amountIncomeVatBudget" },
            { "amount_income_vat_payment", "amountIncomeVatPayment" }, { "ctry_id", "ctryId" },
            { "currency_budget", "currencyBudget" }, { "currency_payment", "currencyPayment" },
            { "date_used_for_mc_budget", "dateUsedForMcBudget" },
            { "date_used_for_mc_payment", "dateUsedForMcPayment" },
            { "exchange_rate_budget", "exchangeRateBudget" },
            { "exchange_rate_override", "exchangeRateOverride" },
            { "exchange_rate_payment", "exchangeRatePayment" },
            { "vat_amount_override", "vatAmountOverride" },
            { "vat_percent_override", "vatPercentOverride" },
            { "vat_percent_value", "vatPercentValue" }, { "cam_cost", "camCost" },
            { "tax_bill_num", "taxBillNum" }, { "tax_authority_contact", "taxAuthorityContact" },
            { "tax_type", "taxType" }, { "tax_period_in_months", "taxPeriodInMonths" },
            { "tax_value_assessed", "taxValueAssessed" }, { "tax_clr", "taxClr" } };

    /**
     * Constant: SQL keyword: " OR ".
     */
    private static final String SQL_KEYWORD_OR = " OR ";

    /**
     * Constructs AbstractCostDataSource, mapped to <code>tableName</code> table, using
     * <code>beanName</code> bean.
     *
     * @param tableName Table name to map to.
     * @param beanName Bean name to use.
     */
    protected AbstractCostDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }

    /** {@inheritDoc} */
    @Override
    public String createSqlRestrictionForCosts(final List<Integer> costIds) {
        final StringBuffer sql = new StringBuffer();

        final DataSourceImpl dataSource = (DataSourceImpl) this.createCopy();
        dataSource.checkSetContext();

        final ViewField.Immutable firstPkField = dataSource.getPrimaryKeyFields().get(0);

        for (int i = 0; i < costIds.size(); i++) {
            final Object costId = costIds.get(i).toString();

            if (i > 0) {
                sql.append(SQL_KEYWORD_OR);
            }

            sql.append(firstPkField.getName());
            sql.append(" = ");
            sql.append(costId);
        }

        return sql.toString();
    }

    /** {@inheritDoc} */
    @Override
    public List<Cost> findByAssetKeyAndDateRange(final String assetKey, final Date startDate,
            final Date endDate, final String clientRestriction) {
        final DataSource dataSource = this.createCopy();
        // apply vpa restriction using binding parameters
        dataSource.addTable("bl");
        dataSource.addTable("property");
        dataSource.setApplyVpaRestrictions(false);

        if (StringUtil.notNullOrEmpty(assetKey)) {
            final String[] keys = Utility.stringToArray(assetKey, ",");
            for (final String key2 : keys) {
                final String key = key2.trim();
                dataSource.addRestriction(Restrictions.sql(key + " IS NOT NULL"));
            }
        }

        if (StringUtil.notNullOrEmpty(startDate)) {
            dataSource
                .addRestriction(Restrictions.gte(this.tableName, Constants.DATE_DUE, startDate));
        }

        if (StringUtil.notNullOrEmpty(endDate)) {
            dataSource
                .addRestriction(Restrictions.lte(this.tableName, Constants.DATE_DUE, endDate));
        }

        final List<DataRecord> records = dataSource.getRecords(clientRestriction);

        return new DataSourceObjectConverter<Cost>().convertRecordsToObjects(records, this.beanName,
            this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public List<Cost> findByCostIds(final List<Integer> costIds) {
        final DataSourceImpl dataSource = (DataSourceImpl) this.createCopy();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.checkSetContext();

        final String costIdRestriction = createSqlRestrictionForCosts(costIds);
        final List<DataRecord> records = dataSource.getRecords(costIdRestriction);

        return new DataSourceObjectConverter<Cost>().convertRecordsToObjects(records, this.beanName,
            this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public List<Cost> findByRestriction(final Restriction restriction) {
        final DataSource dataSource = this.createCopy();
        dataSource.setApplyVpaRestrictions(false);
        dataSource.addRestriction(restriction);
        final List<DataRecord> records = dataSource.getRecords();

        return new DataSourceObjectConverter<Cost>().convertRecordsToObjects(records, this.beanName,
            this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public Cost getRecord(final int costId) {
        final DataSourceImpl dataSource = (DataSourceImpl) this.createCopy();
        // Kb 3047002 Don't apply VPA restriction
        dataSource.setApplyVpaRestrictions(false);
        dataSource.checkSetContext();

        final ViewField.Immutable firstPkField = dataSource.getPrimaryKeyFields().get(0);
        dataSource.addRestriction(Restrictions.eq(this.tableName, firstPkField.getName(), costId));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<Cost>().convertRecordToObject(record, this.beanName,
            this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}

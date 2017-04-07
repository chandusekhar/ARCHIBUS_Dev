package com.archibus.service.cost;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.service.cost.VatUtil.VatCost;
import com.archibus.utility.*;

/**
 * Report request parameters.
 * <p>
 * Handle filter options: analyze cost from, analyze cost for, time information, geographical
 * selection, multi-currency and vat options
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.1
 *
 */
public class RequestParameters {
    /**
     * Constant.
     */
    private static final String COST_FROM = "cost_from";

    /**
     * Constant.
     */
    private static final String MULTIPLE_VALUE_SEPARATOR = "multipleValueSeparator";

    /**
     * Constant.
     */
    private static final String IS_MC_AND_VAT_ENABLED = "isMcAndVatEnabled";

    /**
     * Constant.
     */
    private static final String ONE = "1";

    /**
     * Location fields.
     */
    private final String[] locationKeys = new String[] { DbConstants.CTRY_ID, DbConstants.REGN_ID,
            DbConstants.STATE_ID, DbConstants.CITY_ID, DbConstants.SITE_ID, DbConstants.PR_ID,
            DbConstants.BL_ID };

    /**
     * Client request parameters.
     */
    private final Map<String, String> parameters;

    /**
     * Multiple value separator (value must come from Ab.form.Form).
     */
    private String multipleValueSeparator = ",";

    /**
     *
     * Constructor specifying request parameters.
     *
     * @param parameters request parameters
     */
    public RequestParameters(final Map<String, String> parameters) {
        this.parameters = parameters;
        if (this.parameters.containsKey(MULTIPLE_VALUE_SEPARATOR)) {
            this.multipleValueSeparator = this.parameters.get(MULTIPLE_VALUE_SEPARATOR);
        }
    }

    /**
     * Set parameter value.
     *
     * @param name parameter name
     * @param value parameter value
     */
    public void setParameterValue(final String name, final String value) {
        this.parameters.put(name, value);
    }

    /**
     * Return parameter value.
     *
     * @param name parameter name
     * @return string
     */
    public String getParameterValue(final String name) {
        return this.parameters.get(name);
    }

    /**
     * Return parameter value.
     *
     * @param name parameter name
     * @return string
     */
    public String getStringValue(final String name) {
        String value = null;
        if (this.parameters.containsKey(name)) {
            value = this.parameters.get(name);
        }
        return value;
    }

    /**
     * Convert specified value to boolean.
     *
     * @param name parameter name
     * @return boolean
     */
    public boolean getBooleanValue(final String name) {
        boolean value = false;
        if (this.parameters.containsKey(name)) {
            value = StringUtil.toBoolean(this.parameters.get(name));
        }
        return value;
    }

    /**
     * Returns start date.
     *
     * @return date
     */
    public Date getDateStart() {
        return toDateValue(DbConstants.DATE_START);
    }

    /**
     * Returns end date.
     *
     * @return date
     */
    public Date getDateEnd() {
        return toDateValue(DbConstants.DATE_END);
    }

    /**
     * Returns time range period.
     *
     * @return string
     */
    public String getPeriod() {
        return getStringValue("period");
    }

    /**
     * If time range is on fiscal year or not.
     *
     * @return boolean
     */
    public boolean isFiscalYear() {
        return getBooleanValue("is_fiscal_year");
    }

    /**
     * If recurring cost must be displayed.
     *
     * @return boolean
     */
    public boolean isFromRecurring() {
        boolean value = false;
        if (this.parameters.containsKey(COST_FROM)) {
            value = this.parameters.get(COST_FROM).substring(0, 1).equals(ONE);
        }
        return value;
    }

    /**
     * If scheduled cost must be displayed.
     *
     * @return boolean
     */
    public boolean isFromScheduled() {
        boolean value = false;
        if (this.parameters.containsKey(COST_FROM)) {
            value = this.parameters.get(COST_FROM).substring(1, 2).equals(ONE);
        }
        return value;
    }

    /**
     * If actual cost must be displayed.
     *
     * @return boolean
     */
    public boolean isFromActual() {
        boolean value = false;
        if (this.parameters.containsKey(COST_FROM)) {
            value = this.parameters.get(COST_FROM).substring(2).equals(ONE);
        }
        return value;
    }

    /**
     * Get cost associated with parameter.
     *
     * @return string
     */
    public String getCostAssocWith() {
        return getStringValue("cost_assoc_with");
    }

    /**
     * Get cost for parameter. Possible values: EXPENSE, INCOME, NETINCOME
     *
     * @return string
     */
    public String getCostTypeOf() {
        return getStringValue("cost_type_of");
    }

    /**
     * Returns calculation type.
     * 
     * @return string
     */
    public String getCalculationType() {
        String calculationType = null;
        final String costTypeOf = this.getCostTypeOf();
        if (CostProjection.CALCTYPE_EXPENSE.equalsIgnoreCase(costTypeOf)) {
            calculationType = CostProjection.CALCTYPE_EXPENSE;
        } else if (CostProjection.CALCTYPE_INCOME.equalsIgnoreCase(costTypeOf)) {
            calculationType = CostProjection.CALCTYPE_INCOME;
        } else if (CostProjection.CALCTYPE_NETINCOME.equalsIgnoreCase(costTypeOf)) {
            calculationType = CostProjection.CALCTYPE_NETINCOME;
        }
        return calculationType;
    }

    /**
     * Returns true if client selection is budget currency.
     *
     * @return boolean
     */
    public boolean isBudgetCurrency() {
        return getBooleanValue("is_budget_currency");
    }

    /**
     * Returns currency code.
     *
     * @return String
     */
    public String getCurrencyCode() {
        return getStringValue("currency_code");
    }

    /**
     * Returns exchange rate type. Possible values: BUDGET, PAYMENT
     *
     * @return String
     */
    public String getExchangeRateType() {
        return this.isMcAndVatEnabled() ? getStringValue("exchange_rate") : ExchangeRateType.BUDGET
                .toString();
    }

    /**
     * Returns Vat cost type.
     *
     * @return VatCost
     */
    public VatCost getVatCostType() {
        return this.isMcAndVatEnabled() ? VatCost.fromString(getStringValue("vat_cost_type"))
                : VatCost.TOTAL;
    }

    /**
     * Returns location restriction as parsed restriction.
     *
     * @param table table name
     * @return Restriction.
     */
    public Restriction getLocationRestrictionForTable(final String table) {
        final List<Clause> clauses = new ArrayList<Clause>();
        for (final String key : this.locationKeys) {
            final String value = getStringValue(key);
            if (StringUtil.notNullOrEmpty(value)
                    && !(DbConstants.PR_TABLE.equals(table) && DbConstants.BL_ID.equals(key))) {
                final Clause clause = getRestrictionClause(table, key, value);
                clauses.add(clause);
            }
        }
        return Restrictions.and(clauses.toArray(new Clause[clauses.size()]));
    }

    /**
     * Returns location restriction as sql restriction.
     *
     * @param table table name
     * @return Restriction.
     */
    public String getLocationRestrictionForTable2(final String table) {
        String clauses = "";
        for (final String key : this.locationKeys) {
            final String value = getStringValue(key);
            if (StringUtil.notNullOrEmpty(value)
                    && !(DbConstants.PR_TABLE.equals(table) && DbConstants.BL_ID.equals(key))) {
                final String clause = getRestrictionClause2(table, key, value);
                clauses += (clauses.length() > 0 ? " AND " : "") + clause;
            }
        }
        if (clauses.length() > 0) {
            clauses = " AND  " + clauses;
        }
        return clauses;
    }

    /**
     * Returns sql restriction for specified table and field.
     *
     * @param table table name
     * @param field field name
     * @return sql restriction.
     */
    public String getRestrictionForTableAndField(final String table, final String field) {

        String clause = "1 = 1";
        final String value = getStringValue(field);
        if (StringUtil.notNullOrEmpty(value)) {
            clause = getRestrictionClause2(table, field, value);
        }
        return clause;
    }

    /**
     * Returns multiple value separator.
     *
     * @return String
     */
    public String getMultipleValueSeparator() {
        return this.multipleValueSeparator;
    }

    /**
     * If MultiCurrency and Vat is enabled.
     *
     * @return boolean
     */
    public boolean isMcAndVatEnabled() {
        boolean value = false;
        if (this.parameters.containsKey(IS_MC_AND_VAT_ENABLED)) {
            value = StringUtil.toBooleanObject(this.parameters.get(IS_MC_AND_VAT_ENABLED));
        } else {
            value = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        }
        return value;
    }

    /**
     * Returns request parameters in map format.
     *
     * @return Map<String, String>
     */
    public Map<String, String> toMap() {
        final Map<String, String> cloned = new HashMap<String, String>();
        cloned.putAll(this.parameters);
        return cloned;
    }

    /**
     * Returns parameter value converted to Date object.
     *
     * @param key key name
     * @return Date
     */
    private Date toDateValue(final String key) {
        Date value = null;
        if (this.parameters.containsKey(key)) {
            value = DateTime.stringToDate(this.parameters.get(key), "yyyy-MM-dd");
        }
        return value;
    }

    /**
     * Returns restriction clause.
     *
     * @param table table name
     * @param field field name
     * @param value field value
     * @return clause
     */
    private Clause getRestrictionClause(final String table, final String field, final String value) {
        Clause clause = null;
        if (value.indexOf(this.multipleValueSeparator) == -1) {
            clause = Restrictions.eq(table, field, value);
        } else {
            clause =
                    Restrictions.in(table, field,
                        value.replaceAll(this.multipleValueSeparator, ", "));
        }
        return clause;
    }

    /**
     * Returns restriction clause as SQL string.
     *
     * @param table table name
     * @param field field name
     * @param value field value
     * @return clause
     */
    private String getRestrictionClause2(final String table, final String field, final String value) {
        String clause = table + Constants.DOT + field;
        if (value.indexOf(this.multipleValueSeparator) == -1) {
            clause += " = " + SqlUtils.formatValueForSql(value);
        } else {
            clause +=
                    String.format(" IN ('%s')",
                        value.replaceAll(this.multipleValueSeparator, "','"));
        }
        return clause;
    }

}

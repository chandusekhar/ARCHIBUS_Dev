package com.archibus.app.common.metrics.validation;

import java.util.List;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.datasource.GranularityDataSource;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.metrics.provider.MetricValuesProvider;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * Provide methods to validate metric definition.
 *
 * Suppress PMD warnings, "TooManyMethods".
 * <p>
 * Justification: this class implement metric settings validator. For now is better to keep all code
 * in one class.
 *
 * @author Ioan Draghici
 * @since v21.2
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class Validator {

    /**
     * Metric.
     */
    private final Metric metric;

    /**
     * Metric granularities.
     */
    private List<Granularity> granularities;

    /**
     * Class constructor.
     *
     * @param metric metric object
     */
    public Validator(final Metric metric) {
        this.metric = metric;
    }

    /**
     * Start the validation process.
     *
     * @throws ExceptionBase exception base
     */
    public void validateMetric() throws ExceptionBase {
        // try {
        // validate sample data
        final int recordsNo = DataStatistics.getInt(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, "count",
            Restrictions.and(
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_ERR_MSG,
                    Constants.EXAMPLE),
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_NAME,
                    this.metric.getName())));
        if (recordsNo > 0) {
            handleException(Messages.ERROR_SAMPLE_DATA, null);
        }
        // validate SQL fields collect formula and where statement
        validateSqls();
        // check collect formula
        validateFormula();
        // validate metric settings
        validateSettings();
        // load metric granularities
        this.granularities = loadGranularitiesForMetric(this.metric.getName());
        if (this.granularities.isEmpty()) {
            handleException(Messages.ERROR_NO_GRANULARITIES, null);
        }
        // validate metric granularities
        if (this.metric.isRatioMetric()) {
            validateGranularitiesForRatioMetric();
        } else {
            validateGranularities();
        }
        // } catch (final ExceptionBase exception) {
        // throw exception;
        // }
    }

    /**
     * Validate metric status. Metric status must ACTIVE.
     *
     * @throws ExceptionBase exception base
     */
    public void validateStatus() throws ExceptionBase {
        if (Constants.STATUS_DEACTIVATED.equals(this.metric.getStatus())) {
            handleException(Messages.ERROR_METRIC_NOT_ACTIVE, this.metric.getName());
        }
    }

    /**
     * Load assigned granularities for given metric name.
     *
     * @param metricName metric name
     * @return list
     */
    private List<Granularity> loadGranularitiesForMetric(final String metricName) {
        final GranularityDataSource granularityDataSource = new GranularityDataSource();
        return granularityDataSource.getGranularitiesForMetric(metricName);
    }

    /**
     * Validate collect formula definition.
     *
     * @throws ExceptionBase exception
     */
    private void validateFormula() throws ExceptionBase {
        if (Constants.NONE.equals(this.metric.getFormula()) && !this.metric.isRatioMetric()) {
            // if is ratio metric and numerator or denominator are not defined throw error
            handleException(Messages.ERROR_RATIO_NO_DEF, null);
        }
        if (this.metric.isFieldName() && !SchemaUtilities
            .isValidTableField(this.metric.getCollectTable(), this.metric.getCollectField())) {
            // if is a database field validate agains collect table
            handleException(Messages.ERROR_COLLECT_FIELD_INVALID, this.metric.getCollectField());
        }
        if (this.metric.isCustomWfr()) {
            // try to load specified bean
            final MetricValuesProvider provider =
                    (MetricValuesProvider) ContextStore.get().getBean(this.metric.getBeanName());
            if (StringUtil.isNullOrEmpty(provider)) {
                handleException(Messages.ERROR_BEAN_NAME_INVALID, this.metric.getBeanName());
            }
        }
    }

    /**
     * Validate metric settings.
     *
     * @throws ExceptionBase exception
     */
    private void validateSettings() throws ExceptionBase {
        if (StringUtil.isNullOrEmpty(this.metric.getRecurringRule())) {
            handleException(Messages.ERROR_COLLECT_RECURRENCE_UNDEFINED, null);
        }
    }

    /**
     * Validate metric granularities. Validate fields and tables.
     *
     * @throws ExceptionBase exception
     */
    private void validateGranularities() throws ExceptionBase {
        // try {
        for (final Granularity granularity : this.granularities) {
            if (!Constants.PORTFOLIO.equals(granularity.getGroupByFields())) {
                validateGranularity(granularity);
            }
        }
        // } catch (final ExceptionBase exception) {
        // throw exception;
        // }
    }

    /**
     * Validate granularities for ratio metric.
     *
     * @throws ExceptionBase exception
     */
    private void validateGranularitiesForRatioMetric() throws ExceptionBase {
        final List<Granularity> numeratorGrans =
                loadGranularitiesForMetric(this.metric.getNumerator());
        final List<Granularity> denominatorGrans =
                loadGranularitiesForMetric(this.metric.getDenominator());
        for (final Granularity granularity : this.granularities) {
            if (!isAssigned(granularity.getGroupByFields(), numeratorGrans)
                    || !isAssigned(granularity.getGroupByFields(), denominatorGrans)) {
                handleException(Messages.ERROR_UNASSIGNED_GRANULARITY, granularity.getTitle());
            }
        }
    }

    /**
     * Check is granularity is contained by list.
     *
     * @param collectGroupBy group by
     * @param list granularities list
     * @return boolean
     */
    private boolean isAssigned(final String collectGroupBy, final List<Granularity> list) {
        boolean result = false;
        for (final Granularity elem : list) {
            if (collectGroupBy.equals(elem.getGroupByFields())) {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * Validate given granularity.
     *
     * @param granularity granularity object
     * @throws ExceptionBase exception if field is not defined for specified tables
     *             <p>
     *             Suppress PMD warning PMD.BooleanInversion
     *             <p>
     *             Justification: there is no bitwise inversion on boolean in java (See: Chapter
     *             15.22.2 of JLS
     *             http://docs.oracle.com/javase/specs/jls/se7/html/jls-15.html#jls-15.22.2)
     */
    @SuppressWarnings({ "PMD.BooleanInversion" })
    private void validateGranularity(final Granularity granularity) throws ExceptionBase {
        String fields = SchemaUtilities.getShortFieldName(granularity.getGroupByFields());
        if (granularity.getFieldPresence() == 0) {
            fields += Constants.SEMICOLON + granularity.getRequiredFields();
        }
        String tables = this.metric.getCollectTable();
        if (StringUtil.notNullOrEmpty(granularity.getRequiredTables())) {
            tables += Constants.SEMICOLON + granularity.getRequiredTables();
        }
        final String[] fieldArray = fields.split(Constants.SEMICOLON);
        final String[] tableArray = tables.split(Constants.SEMICOLON);
        for (final String field : fieldArray) {
            final boolean isValidField = SchemaUtilities.isValidTableField(tableArray, field);
            if (!isValidField) {
                handleException(Messages.ERROR_GROUP_BY_FIELD_INVALID, field);
                break;
            }
        }
    }

    /**
     * Check SQL statement for sql injection - collect_formula and collect_where_clause.
     *
     * @throws ExceptionBase sql injection exception
     */
    private void validateSqls() throws ExceptionBase {
        // try {
        final SqlInjectionHandler handler =
                (SqlInjectionHandler) ContextStore.get().getBean("sqlInjectionHandler");
        if (StringUtil.notNullOrEmpty(this.metric.getFormula())) {
            handler.checkString(this.metric.getFormula());
        }
        if (StringUtil.notNullOrEmpty(this.metric.getWhereClause())) {
            handler.checkString(this.metric.getWhereClause());
        }
        // } catch (final ExceptionBase exceptionBase) {
        // throw exceptionBase;
        // }
    }

    /**
     * Handle exception.
     *
     * @param message message id
     * @param replacement value to replace
     * @throws ExceptionBase exception base.
     */
    private void handleException(final String message, final String replacement)
            throws ExceptionBase {
        ExceptionBase exception = ExceptionBaseFactory.newTranslatableException(message,
            new Object[] { this.metric.getTitle() });
        if (StringUtil.notNullOrEmpty(replacement)) {
            exception = ExceptionBaseFactory.newTranslatableException(message,
                new Object[] { this.metric.getTitle(), replacement });
        }
        throw exception;
    }

}

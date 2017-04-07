package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.sql.Timestamp;
import java.util.*;
import java.util.regex.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Add data to a transaction from an ARCHIBUS data table.
 *
 * @author cole
 *
 */
public class PopulateTransaction extends AbstractValidatingRule implements IRecordTranslator {
    /**
     * ARCHIBUS fields to connector field ids for fields to restrict on.
     */
    private static final String RESTRICTION_MAPPING_PARAM = "restrictionMap";

    /**
     * Additional custom SQL restriction.
     */
    private static final String CUSTOM_RESTRICTION_PARAM = "customRestriction";

    /**
     * ARCHIBUS fields to connector field ids for fields to populate on the transaction.
     */
    private static final String VALUE_MAPPING_PARAM = "valueMap";

    /**
     * Data source for the ARCHIBUS table.
     */
    private DataSource referencedDataSource;

    /**
     * ARCHIBUS fields to transaction fields for values to copy.
     */
    private JSONObject valueFieldMapping;

    /**
     * ARCHIBUS fields to transaction fields for values to restrict on.
     */
    private JSONObject restrictionFieldMapping;

    /**
     * Parameters to a custom restriction.
     */
    private Set<String> parameterNames;

    /**
     * Custom restriction.
     */
    private String customRestriction;

    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        super.init(connectorField);
        if (getRuleParameter() instanceof JSONObject) {
            final JSONObject parameters = (JSONObject) getRuleParameter();
            if (!parameters.has(RESTRICTION_MAPPING_PARAM)
                    || !parameters.has(VALUE_MAPPING_PARAM)) {
                throw new ConfigurationException(
                    "Parameter for " + connectorField.getFieldId() + " should include: "
                            + RESTRICTION_MAPPING_PARAM + " and " + VALUE_MAPPING_PARAM,
                    null);
            }
            this.restrictionFieldMapping = parameters.getJSONObject(RESTRICTION_MAPPING_PARAM);
            this.valueFieldMapping = parameters.getJSONObject(VALUE_MAPPING_PARAM);
            this.customRestriction = parameters.optString(CUSTOM_RESTRICTION_PARAM, null);
            if (this.customRestriction != null && super.isCaching()) {
                throw new ConfigurationException(
                    "Populate Transaction's custom restriction is incompatible with caching.",
                    null);
            }
        } else {
            throw new ConfigurationException(
                "Parameter should be JSONObject for " + connectorField.getFieldId(), null);
        }

        this.referencedDataSource = createReferencedDataSource();

        if (this.customRestriction != null) {
            final Pattern pattern = Pattern.compile("\\$\\{parameters\\['([^']*)']}");
            final Matcher parameterMatcher = pattern.matcher(this.customRestriction);
            this.parameterNames = new HashSet<String>();
            while (parameterMatcher.find()) {
                this.parameterNames.add(parameterMatcher.group(1));
            }
        }
    }

    /**
     * @return create a data source to pull values from to populate the transaction with.
     */
    private DataSource createReferencedDataSource() {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(getValidatingTable());
        final Iterator<Object> archibusRestrictionFieldIterator =
                this.restrictionFieldMapping.keys();
        while (archibusRestrictionFieldIterator.hasNext()) {
            dataSource.addField(archibusRestrictionFieldIterator.next().toString());
        }
        final Iterator<Object> archibusValueFieldIterator = this.valueFieldMapping.keys();
        while (archibusValueFieldIterator.hasNext()) {
            dataSource.addField(archibusValueFieldIterator.next().toString());
        }
        return dataSource;
    }

    @Override
    public void applyRule(final Map<String, Object> record,
            final Map<String, Object> originalRecord) {
        this.referencedDataSource.clearRestrictions();
        if (this.customRestriction != null) {
            addCustomRestriction(record);
        }
        final StringBuilder cacheKeyBuilder = new StringBuilder();
        final Iterator<Object> archibusRestrictionFieldIterator =
                this.restrictionFieldMapping.keys();
        while (archibusRestrictionFieldIterator.hasNext()) {
            final String archibusRestrictionField =
                    archibusRestrictionFieldIterator.next().toString();
            final Object restrictionValue =
                    originalRecord.get(this.restrictionFieldMapping.get(archibusRestrictionField));
            if (restrictionValue == null) {
                this.referencedDataSource.addRestriction(Restrictions.isNull(
                    this.referencedDataSource.getMainTableName(), archibusRestrictionField));
            } else {
                this.referencedDataSource
                    .addRestriction(Restrictions.eq(this.referencedDataSource.getMainTableName(),
                        archibusRestrictionField, restrictionValue));
            }
            cacheKeyBuilder.append(restrictionValue).append('|');
        }
        final DataRecord referencedRecord =
                getCache().get(cacheKeyBuilder.toString(), this.referencedDataSource);
        final Iterator<Object> archibusValueFieldIterator = this.valueFieldMapping.keys();
        while (archibusValueFieldIterator.hasNext()) {
            final String key = (String) archibusValueFieldIterator.next();
            record.put(this.valueFieldMapping.getString(key), referencedRecord == null ? null
                    : referencedRecord.getValue(getValidatingTable() + '.' + key));
        }
    }

    /**
     * Add a custom restriction to the data source.
     *
     * @param record the parameters to the custom restriction.
     */
    private void addCustomRestriction(final Map<String, Object> record) {
        this.referencedDataSource.addRestriction(Restrictions.sql(this.customRestriction));
        for (final String key : this.parameterNames) {
            final Object value = record.get(key);
            String dataType;
            if (value instanceof java.sql.Time) {
                dataType = DataSource.DATA_TYPE_TIME;
            } else if (value instanceof Date || value instanceof Timestamp) {
                dataType = DataSource.DATA_TYPE_DATE;
            } else if (value instanceof Number) {
                dataType = DataSource.DATA_TYPE_NUMBER;
            } else {
                dataType = DataSource.DATA_TYPE_TEXT;
            }
            /*
             * The data type may change, for example if the first value is null.
             */
            this.referencedDataSource.addParameter(key, value, dataType);
            /*
             * This sets a flag indicating that the parameter changed.
             */
            if (this.referencedDataSource.getParameters().containsKey(key)) {
                this.referencedDataSource.setParameter(key, value);
            }
        }
    }

    /**
     * @return true as a value is required to identify the record in the other table.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }
}

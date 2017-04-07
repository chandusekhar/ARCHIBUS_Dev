package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * A rule to take a value from a referenced table and use it in place of a value from a referring
 * table (the table the connector is working on).
 *
 * @author cole
 *
 */
public class LookupValue extends AbstractValidatingRule implements IRecordTranslator {

    /**
     * Data source for looking up values.
     */
    private DataSource foreignTableDs;

    /**
     * The field in the referenced table that has the value to be used in place of the value in the
     * ARCHIBUS database.
     */
    private String foreignValueField;

    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        super.init(connectorField);
        this.foreignValueField = (String) getRuleParameter();
        this.foreignTableDs = DataSourceFactory.createDataSource();
        this.foreignTableDs.addTable(getValidatingTable()).addField(getValidatingTableKeyFields())
            .addField(this.foreignValueField);
    }

    /**
     * There must be an existing value to lookup.
     *
     * @return true.
     */
    @Override
    public boolean requiresExistingValue() {
        return true;
    }

    /**
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord the record prior to translation by other record level rules.
     * @throws TranslationException if the value on import doens't match a value in the database.
     */
    @Override
    public void applyRule(final Map<String, Object> record,
            final Map<String, Object> originalRecord) throws TranslationException {
        this.foreignTableDs.clearRestrictions();
        if (isExporting()) {
            /*
             * Lookup the value of the field in the foreign table.
             */
            final DataRecord foreignRecord = getCache().get(originalRecord, this.foreignTableDs);
            final String foreignValue = foreignRecord == null ? null
                    : foreignRecord.getString(getValidatingTable() + '.' + this.foreignValueField);
            record.put(getSourceField(), foreignValue);
        } else {
            /*
             * Lookup the key fields from the foreign table based on the value and put them on the
             * record.
             */
            final Object sourceFieldValue = originalRecord.get(getSourceField());
            final Object sourceValue = originalRecord.get(getSourceField());
            if (sourceValue == null) {
                this.foreignTableDs.addRestriction(
                    Restrictions.isNull(getValidatingTable(), this.foreignValueField));
            } else {
                this.foreignTableDs.addRestriction(
                    Restrictions.eq(getValidatingTable(), this.foreignValueField, sourceValue));
            }
            final DataRecord foreignRecord =
                    getCache().get(String.valueOf(sourceFieldValue), this.foreignTableDs);
            if (foreignRecord == null) {
                throw new TranslationException("LookupValue " + originalRecord.get(getSourceField())
                        + " doesn't match a field in " + getValidatingTable() + '.'
                        + this.foreignValueField,
                    null);
            }
            int keyFieldIndex = 0;
            final String[] validatingTableKeyFields = getValidatingTableKeyFields();
            for (final String recordKeyField : getRecordKeyFields()) {
                final String foreignKeyField = validatingTableKeyFields[keyFieldIndex];
                if (recordKeyField != null) {
                    record.put(recordKeyField,
                        foreignRecord.getString(getValidatingTable() + '.' + foreignKeyField));
                }
                keyFieldIndex++;
            }
        }
    }

}

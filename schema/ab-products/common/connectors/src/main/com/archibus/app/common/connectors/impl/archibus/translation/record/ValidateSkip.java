package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.translation.skip.ISkipRecordCondition;
import com.archibus.app.common.connectors.translation.exception.TranslationException;
import com.archibus.datasource.*;

/**
 * A connector rule to skip a field if it does not exist in the referenced table in the ARCHIBUS
 * database.
 *
 * @author cole
 *
 */
public class ValidateSkip extends AbstractValidatingRule
        implements IRecordTranslator, ISkipRecordCondition {

    /**
     * Whether to skip the record (as opposed to just the field).
     */
    private boolean skipRecord;

    /**
     * Data source for the validating table.
     */
    private DataSource foreignTableDs;

    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        super.init(connectorField);
        this.skipRecord = "SkipRecord".equalsIgnoreCase((String) getRuleParameter());
        this.foreignTableDs = DataSourceFactory.createDataSource();
        this.foreignTableDs.addTable(getValidatingTable()).addField(getValidatingTableKeyFields());
    }

    /**
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord the record prior to translation by other record level rules.
     */
    @Override
    public void applyRule(final Map<String, Object> record,
            final Map<String, Object> originalRecord) {
        if (!this.skipRecord && !isExporting() && record.containsKey(getSourceField())
                && !isValueInReferencedTable(originalRecord)) {
            record.remove(getSourceField());
        }
    }

    /**
     * @param record the record with the keys to be looked up in the referenced table.
     * @return true if the value is not in the referenced table.
     */
    private boolean isValueInReferencedTable(final Map<String, Object> record) {
        boolean recordPresent;
        this.foreignTableDs.clearRestrictions();
        try {
            recordPresent = getCache().get(record, this.foreignTableDs) != null;
        } catch (final TranslationException e) {
            recordPresent = false;
        }
        return recordPresent;
    }

    /**
     * @param record the record with the keys to be looked up in the referenced table.
     * @return true if the value is not in the referenced table and this is an import.
     */
    @Override
    public boolean shouldSkip(final Map<String, Object> record) {
        return this.skipRecord && !isExporting() && !isValueInReferencedTable(record);
    }

    @Override
    public boolean requiresExistingValue() {
        return true;
    }

    /**
     * @param record the record to be skipped.
     * @return the reason this record would be skipped.
     */
    @Override
    public String getReason(final Map<String, Object> record) {
        return "No record matching [" + getPkeyValues(record) + "] in " + getValidatingTable();
    }
}

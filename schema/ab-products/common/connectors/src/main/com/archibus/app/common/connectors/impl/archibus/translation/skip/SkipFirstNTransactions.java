package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;

/**
 * A rule to skip the first N records.
 *
 * @author cole
 *
 */
public class SkipFirstNTransactions implements ISkipRecordCondition {

    /**
     * The index of the next record.
     */
    private long nextIndex;

    /**
     * The number of records to skip.
     */
    private long recordsToSkip;

    /**
     * Records to skip will be taken from the connector field's parameter.
     */
    public SkipFirstNTransactions() {
        /*
         * For use as a rule
         */
    }

    /**
     * @param recordsToSkip the number of records to skip (N).
     */
    public SkipFirstNTransactions(final long recordsToSkip) {
        this.nextIndex = 1;
        this.recordsToSkip = recordsToSkip;
    }

    /**
     * Instantiate this translator by setting the index to 1, and the number of records to skip to
     * the connector.skip_first_row value.
     *
     * @param connectorField ignored.
     */
    @Override
    public void init(final ConnectorFieldConfig connectorField) {
        this.nextIndex = 1;
        this.recordsToSkip = Long.parseLong(connectorField.getParameter());
    }

    /**
     * @param record ignored.
     * @return whether this record is one of the first N records.
     */
    @Override
    public boolean shouldSkip(final Map<String, Object> record) {
        return this.nextIndex++ <= this.recordsToSkip;
    }

    /**
     * Sets no value, nor requires one.
     *
     * @return false.
     */
    @Override
    public boolean requiresExistingValue() {
        return false;
    }

    /**
     * @param record the record to be skipped.
     * @return the reason this record would be skipped.
     */
    @Override
    public String getReason(final Map<String, Object> record) {
        return "One of first " + this.recordsToSkip + " records.";
    }
}

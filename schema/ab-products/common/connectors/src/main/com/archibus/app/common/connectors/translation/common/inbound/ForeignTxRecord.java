package com.archibus.app.common.connectors.translation.common.inbound;

import java.util.*;

import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * A database record representation of a transaction from a message for/from a foreign system.
 *
 * @author cole
 */
public class ForeignTxRecord extends ArchibusDataRecord {
    /**
     * Data that doesn't represent, but describes the foreign transaction.
     */
    private final ForeignTxMetadata metadata;
    
    /**
     * Create a database record representation of a transaction from a message for/from a foreign
     * system. The record starts with no fields and no errors.
     *
     * @param metadata data describing this transaction.
     */
    public ForeignTxRecord(final ForeignTxMetadata metadata) {
        super();
        this.metadata = metadata;
    }
    
    /**
     * @return metadata describing this transaction, may be unavailable.
     */
    public ForeignTxMetadata getMetadata() {
        return this.metadata;
    }
    
    /**
     * Replace any no-update values on this transaction with values from the old record that are not
     * also no-update. If the old record has errors for a no-update field, copy those as well. If
     * the duplicate isn't a ForeignTxDataRecord, assume no errors.
     *
     * @param duplicate the record to merge into this one.
     */
    public void mergeWithDuplicate(final ArchibusDataRecord duplicate) {
        /*
         * Extract duplicate data from the duplicate record for efficient reference in code.
         */
        ForeignTxMetadata duplicateMetadata = null;
        if (duplicate instanceof ForeignTxRecord) {
            duplicateMetadata = ((ForeignTxRecord) duplicate).getMetadata();
        }
        final Map<String, Object> duplicateFields = duplicate.getFields();
        
        /*
         * Replace no-update fields with fields in the duplicate, or errors if they exist.
         */
        final Iterator<String> fieldNameNotUpdatedIterator =
                this.metadata.getFieldsNotUpdated().iterator();
        while (fieldNameNotUpdatedIterator.hasNext()) {
            final String fieldNameNotUpdated = fieldNameNotUpdatedIterator.next();
            if (duplicateMetadata != null) {
                /*
                 * If it has metadata, need to merge errors and remove no-update field.
                 */
                if (duplicateMetadata.getFieldsInError().contains(fieldNameNotUpdated)) {
                    this.metadata.getFieldsInError().add(fieldNameNotUpdated);
                }
                /*
                 * Unless the duplicate also says it wasn't updated, this record now has the old
                 * value so it's safe to update it.
                 */
                if (!duplicateMetadata.getFieldsNotUpdated().contains(fieldNameNotUpdated)) {
                    fieldNameNotUpdatedIterator.remove();
                }
            }
            putField(fieldNameNotUpdated, duplicateFields.get(fieldNameNotUpdated));
        }
    }
    
    /**
     * @param translatedValues map of source fields to their values after rules are applied.
     * @param rspRecDef the definition of the mapping of fields between the transaction and database
     *            records.
     * @param <ForeignTransactionType> the type of the transaction being used to populate the
     *            record.
     * @throws TranslationException if there's an error translating a transaction field to a
     *             database value.
     */
    public <ForeignTransactionType> void populateUsing(final Map<String, Object> translatedValues,
            final ResponseTxDef<?, ForeignTransactionType, ?> rspRecDef)
            throws TranslationException {
        rspRecDef.populateDbValues(translatedValues, this);
    }
}

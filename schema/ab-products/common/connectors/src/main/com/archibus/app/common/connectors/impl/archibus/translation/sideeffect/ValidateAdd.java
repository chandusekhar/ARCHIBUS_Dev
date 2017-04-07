package com.archibus.app.common.connectors.impl.archibus.translation.sideeffect;

import java.util.Map;

import com.archibus.datasource.data.DataRecord;

/**
 * Add data to a table referred to by the record being imported if it doesn't already exist.
 *
 * @author cole
 *
 */
public class ValidateAdd extends PopulateTable {
    @Override
    protected void updateReferencedRecord(final Map<String, Object> record,
            final DataRecord referencedRecord) {
        if (referencedRecord.isNew()) {
            super.updateReferencedRecord(record, referencedRecord);
        }
    }
}

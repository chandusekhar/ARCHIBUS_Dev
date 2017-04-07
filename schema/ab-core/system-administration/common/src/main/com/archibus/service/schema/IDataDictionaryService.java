package com.archibus.service.schema;

import org.json.JSONArray;

/**
 *
 * Service for Data Dictionary actions, such as copyTable, copyFields. *
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbSystemAdministration-DataDictionaryService'.
 * <p>
 *
 * @author Radu Bunea
 * @since 23.1
 *
 */
public interface IDataDictionaryService {
    /**
     *
     * Copy all dictionary table fields to another table.
     *
     * @param fromTable Table to copy fields from
     * @param toTable Table to copy fields to
     */
    void copyTable(final String fromTable, final String toTable);

    /**
     *
     * Copy selected dictionary table fields to another table.
     *
     * @param fromTable Table to copy fields from
     * @param toTable Table to copy fields to
     * @param fieldsToCopy List of object fields to copy
     * @param checkFieldsForActions Check for existing fields to keep or overwrite
     *            <p>
     *            {fieldName: fieldName, action: action}
     *            <p>
     *            action: copy, keep, overwrite
     */
    void copyFields(final String fromTable, final String toTable, final JSONArray fieldsToCopy,
            boolean checkFieldsForActions);
}

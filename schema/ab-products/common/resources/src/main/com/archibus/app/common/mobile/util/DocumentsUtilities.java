package com.archibus.app.common.mobile.util;

import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.*;

/**
 *
 /** Utility class. Provides methods related to ARCHIBUS Documents synchronisation.
 * <p>
 *
 * Used to sync records with sync tables.
 *
 * @author Catalin Purice
 * @since 20.2
 *
 */
public final class DocumentsUtilities {

    /**
     * Constant: Lock status of document field: unlocked.
     */
    private static final String UNLOCKED = "0";

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private DocumentsUtilities() {
    }

    /**
     * Copies the documents from the source table to the destination table.
     *
     * @param documentFieldNames list of document fields
     * @param fromRecord sync table record
     * @param toRecord record
     */
    public static void copyDocuments(final String[] documentFieldNames,
            final DataRecord fromRecord, final DataRecord toRecord) {

        final String syncTableName =
                Utility.tableNameFromFullName(fromRecord.getFields().get(0).getFieldDef()
                    .fullName());

        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");

        for (final String documentFieldName : documentFieldNames) {
            final String documentFileName =
                    fromRecord.getString(syncTableName + SQL_DOT + documentFieldName);

            if (StringUtil.notNullOrEmpty(documentFileName)) {

                // source doc parameters
                final Map<String, String> srcKeys = createPrimaryKey(fromRecord);

                final DocumentParameters srcDocParam =
                        new DocumentParameters(srcKeys, syncTableName, documentFieldName, null,
                            true);

                // target document parameters
                final Map<String, String> targetKeys = createPrimaryKey(toRecord);

                // TODO: get description from source record field value (KB3041038)
                final String localizedDescription =
                        EventHandlerBase.localizeString(
                            ContextStore.get().getEventHandlerContext(),
                            "Document from mobile device", DocumentsUtilities.class.toString());

                final DocumentParameters targetDocParam =
                        new DocumentParameters(targetKeys, Utility.tableNameFromFullName(toRecord
                            .getFields().get(0).getFieldDef().fullName()), documentFieldName,
                            documentFileName, localizedDescription, UNLOCKED);

                // copy document
                // KB 3049225 - do not interrupt the process due to errors caused by missing
                // document from afm_docs table
                try {
                    documentService.copyDocument(srcDocParam, targetDocParam);
                } catch (final ExceptionBase e) {
                    if (e.getErrorNumber() != ExceptionBase.ERROR_NUMBER_DOCUMENT_STORAGE_CORRUPTED) {
                        throw e;
                    }
                }

            }
        }
    }

    /**
     * Creates the Document Parameters Keys for copying a document.
     *
     * @param record The record
     * @return key and value pairs
     */
    private static Map<String, String> createPrimaryKey(final DataRecord record) {
        final Map<String, String> keys = new HashMap<String, String>();

        for (final DataValue fieldDataValue : record.getFields()) {
            final String fullFieldName = fieldDataValue.getName();
            final int fieldNameIndex = fullFieldName.indexOf(SQL_DOT) + 1;
            final ArchibusFieldDefBase.Immutable fieldDef = fieldDataValue.getFieldDef();
            if (fieldDef != null && fieldDef.isPrimaryKey()) {
                keys.put(fullFieldName.substring(fieldNameIndex),
                    record.getNeutralValue(fullFieldName));
            }
        }

        return keys;
    }

}

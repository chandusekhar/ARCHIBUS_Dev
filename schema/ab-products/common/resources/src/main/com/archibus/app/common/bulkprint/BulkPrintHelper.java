package com.archibus.app.common.bulkprint;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Helper class for BulkPrintService.
 * 
 * @author ZY
 * @since 20.1
 * 
 */
public final class BulkPrintHelper {
    
    /**
     * Constant: table name "afm_docvers".
     */
    private static final String AFM_DOCVERS = "afm_docvers";
    
    /**
     * Constant: field name "field_name" of table "afm_docvers".
     */
    private static final String FIELD_NAME = "field_name";
    
    /**
     * Constant: field name "pkey_value" of table "afm_docvers".
     */
    private static final String PKEY_VALUE = "pkey_value";
    
    /**
     * Constant: Field Name.
     */
    private static final String VERSION = "version";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private BulkPrintHelper() {
    }
    
    /**
     * @return the latest version of the document.
     * 
     * @param pkey primary keys map.
     * @param tableName table name.
     * @param fieldName field name.
     */
    public static String getLastDocumentVersion(final Map<String, String> pkey,
            final String tableName, final String fieldName) {
        
        String lastestVersion = "";
        
        // get pk string from record's primary values
        final StringBuffer keyStr = new StringBuffer();
        for (final String key : pkey.keySet()) {
            if (keyStr.length() > 0) {
                keyStr.append('|');
            }
            keyStr.append(pkey.get(key));
            
        }
        
        final DataSource docversDS =
                DataSourceFactory.createDataSourceForFields(AFM_DOCVERS,
                    new String[] { FIELD_NAME, PKEY_VALUE, VERSION }).addSort(AFM_DOCVERS, VERSION,
                    DataSource.SORT_DESC);
        
        // get max 'version' record
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(AFM_DOCVERS, "table_name", tableName, Operation.EQUALS);
        restriction.addClause(AFM_DOCVERS, FIELD_NAME, fieldName, Operation.EQUALS);
        restriction.addClause(AFM_DOCVERS, PKEY_VALUE, keyStr.toString(), Operation.EQUALS);
        
        final List<DataRecord> versionRecords = docversDS.getRecords(restriction);
        if (!versionRecords.isEmpty()) {
            lastestVersion = String.valueOf(versionRecords.get(0).getInt("afm_docvers.version"));
        }
        
        return lastestVersion;
    }
    
    /**
     * Initial file size limit value from system default parameter if no application specified
     * parameter value.
     * 
     * @return limit size
     */
    public static long getSizeLimit() {
        
        ContextStore.get().getEventHandlerContext();
        
        long totalLimit = 0;
        final com.archibus.config.IActivityParameterManager activityParameterManager =
                ContextStore.get().getProject().getActivityParameterManager();
        
        final String sizeStr =
                activityParameterManager.getParameterValue("AbCommonResources-OutputPdfSizeLimit");
        if (StringUtil.notNullOrEmpty(sizeStr)) {
            totalLimit = Integer.valueOf(sizeStr);
        }
        return totalLimit;
    }
}

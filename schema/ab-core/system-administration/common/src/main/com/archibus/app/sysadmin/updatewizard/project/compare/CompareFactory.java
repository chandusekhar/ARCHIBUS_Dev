package com.archibus.app.sysadmin.updatewizard.project.compare;

import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.schema.TableDef;

/**
 * Compare factory.
 * 
 * @author Catalin Purice
 * 
 */
// CHECKSTYLE:OFF Justification: Suppress "the class should be Abstract". Fixing this will lead to
// "abstract class name should be AbstractXXX" warning.
// I want to keep this class name for usability reason.
// TODO: (VT): I disagree with the justification. This class should be renamed.
public final class CompareFactory {
    // CHECKSTYLE:ON
    /**
     * Private constructor. This is a factory.
     */
    private CompareFactory() {
    }
    
    /**
     * Returns fieldMapList.
     * 
     * @param fieldData loaded field
     * @param isCompare true if the field will be compared only
     * @return {@link CompareFieldProperties}
     */
    
    public static CompareFieldProperties compareFieldToCsvDef(final LoadLangFieldData fieldData,
            final boolean isCompare) {
        return new CompareFieldProperties(fieldData, isCompare);
    }
    
    /**
     * Returns CompareFieldDef.
     * 
     * @param sqlTableDef SQL table definition
     * @param archTableDef ARCHIBUS table definition
     * @param fieldName field name
     * @return {@link CompareFieldDef}
     */
    public static CompareFieldDef compareFieldToSqlDef(final DatabaseSchemaTableDef sqlTableDef,
            final TableDef.ThreadSafe archTableDef, final String fieldName) {
        return new CompareFieldDef(sqlTableDef, archTableDef, fieldName);
    }
    
    /**
     * Returns CompareToCVS.
     * 
     * @param tableData {@link LoadTableData}
     * @return {@link CompareTableProperties}
     */
    public static CompareTableProperties compareTableToCsvDef(final LoadTableData tableData) {
        return new CompareTableProperties(tableData.getTableName(), tableData.isSqlView());
    }
}

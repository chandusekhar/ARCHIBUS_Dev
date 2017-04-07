package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.datasource.SqlUtils;

/**
 * Create alter table object.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public final class AlterTableCreator {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private AlterTableCreator() {
        super();
    }

    /**
     *
     * @param fieldToCompare field to compare
     * @param dontSetNotNull don't set null
     * @param output the output
     * @param nlsToChar nls to char
     * @return the alter field object
     */
    public static AlterTable createAlterTable(final CompareFieldDef fieldToCompare,
            final boolean dontSetNotNull, final SqlCommandOutput output, final boolean nlsToChar) {
        AlterTable fieldToAlter = null;
        if (SqlUtils.isSybase()) {
            fieldToAlter = new AlterTableSybase(fieldToCompare, dontSetNotNull, output);
        } else if (SqlUtils.isOracle()) {
            fieldToAlter = new AlterTableOracle(fieldToCompare, nlsToChar, dontSetNotNull, output);
        } else {
            fieldToAlter = new AlterTableSqlServer(fieldToCompare, dontSetNotNull, output);
        }
        
        return fieldToAlter;
    }
}

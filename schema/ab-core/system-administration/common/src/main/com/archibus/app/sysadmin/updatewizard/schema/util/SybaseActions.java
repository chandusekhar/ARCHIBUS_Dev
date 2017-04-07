package com.archibus.app.sysadmin.updatewizard.schema.util;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.schema.*;

/**
 * Describes different methods specific to Sybase database.
 * 
 * @author Catalin
 * 
 */
public final class SybaseActions {
    
    /**
     * private constructor.
     */
    private SybaseActions() {
        
    }
    
    /**
     * @param foreignKey foreign key
     * @param foreignTable foreign table
     * @param addFkeyStmt foreign key statement
     * @return statement
     */
    public static String setCascadeAndSetNull(final ForeignKey.Immutable foreignKey,
            final String foreignTable, final String addFkeyStmt) {
        String localAddFkeyStmt =
                addFkeyStmt + SchemaUpdateWizardConstants.ON_UPDATE
                        + SchemaUpdateWizardConstants.CASCADE
                        + SchemaUpdateWizardConstants.ON_DELETE;
        final String lastFieldName = foreignKey.getLastField();
        final TableDef.ThreadSafe foreignTableDef =
                ContextStore.get().getProject().loadTableDef(foreignTable);
        final ArchibusFieldDefBase.Immutable fDef = foreignTableDef.getFieldDef(lastFieldName);
        if (fDef.isPrimaryKey() || !getForeignFieldsAllowNull(foreignTableDef, foreignKey)) {
            localAddFkeyStmt += SchemaUpdateWizardConstants.CASCADE;
        } else {
            localAddFkeyStmt += SchemaUpdateWizardConstants.SET_NULL;
        }
        return localAddFkeyStmt;
    }
    
    /**
     * 
     * set String Right Truncation on/off.
     * 
     * @param isOn true if the right truncation is ON
     */
    public static void setStringRTruncation(final boolean isOn) {
        String command = "SET STRING_RTRUNCATION %s";
        if (isOn) {
            command = String.format(command, "ON");
        } else {
            command = String.format(command, "OFF");
        }
        EventHandlerBase.executeDbSql(ContextStore.get().getEventHandlerContext(), command, false);
    }
    
    /**
     * Returns Allow null for a foreign key.
     * 
     * @param foreignTableDef table definition
     * @param foreignKey foreign key
     * @return boolean
     */
    private static boolean getForeignFieldsAllowNull(final TableDef.ThreadSafe foreignTableDef,
            final ForeignKey.Immutable foreignKey) {
        boolean isAllowNull = true;
        for (final String foreignField : foreignKey.getForeignFields()) {
            if (!foreignTableDef.getFieldDef(foreignField).getAllowNull()) {
                isAllowNull = false;
                break;
            }
        }
        return isAllowNull;
    }
}

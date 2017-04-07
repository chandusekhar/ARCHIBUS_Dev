package com.archibus.app.sysadmin.updatewizard.script.impl.method;

import java.util.ArrayList;

import com.archibus.app.sysadmin.updatewizard.project.job.AddTableNamesToTransferSetJob;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.job.UpdateSchemaJob;
import com.archibus.context.ContextStore;

/**
 *
 * Defines all methods supported by DUW files as static methods.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public final class MethodCall {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private MethodCall() {
        super();
    }

    /**
     * Reloads the ARCHIBUS Data Dictionary.
     *
     * @return success message.
     */
    public static String refreshDataDictionary() {
        ContextStore.get().getProject().clearCachedTableDefs();
        return "ARCHIBUS Data Dictionary reloaded successfully.";
    }
    
    /**
     * Reloads the ARCHIBUS Workflow rules.
     *
     * @return success message.
     */
    public static String refreshWorflowRules() {
        ContextStore.get().getProject().reloadWorkflowRules();
        return "ARCHIBUS Workflow rules reloaded successfully.";
    }

    /**
     *
     * Recreate table method.
     *
     * @param tableLikeExpression like expression
     * @param isRecreateAllFk is recreate fk parameter
     * @return success message.
     */
    public static String recreateTable(final String tableLikeExpression,
            final Boolean isRecreateAllFk) {
        return updateSchema(tableLikeExpression, true, isRecreateAllFk);
    }
    
    /**
     *
     * Alter table method.
     *
     * @param tableLikeExpression like expression
     * @param isRecreateAllFk is recreate fk parameter
     * @return success message.
     */
    public static String alterTable(final String tableLikeExpression, final Boolean isRecreateAllFk) {
        return updateSchema(tableLikeExpression, false, isRecreateAllFk);
    }

    /**
     * Update Schema.
     *
     * @param tableLikeExpression table likeS
     * @param isRecreateTable recreates table is true
     * @param isRecreateAllFk recreates all foreign keys
     * @return job ID
     */
    private static String updateSchema(final String tableLikeExpression,
            final boolean isRecreateTable, final boolean isRecreateAllFk) {

        updateSchemaPrerequisites(tableLikeExpression);
        
        new UpdateSchemaJob(true, true, isRecreateTable, isRecreateAllFk, false, "").run();

        return "Table(s) '" + tableLikeExpression + "' "
                + (isRecreateTable ? "re-created" : "altered")
                + ". Please check the logs for details.";
    }

    /**
     *
     * Update schema for Oracle.
     *
     * @param tableLikeExpression table name
     * @param isRecreateTable recreates table is true
     * @param isRecreateAllFk recreates all foreign keys
     * @param isSetToChar set to CHAR (Oracle Only)
     * @param tableSpaceName name of tablespace (Oracle Only)
     * @return job ID
     */
    public static String updateSchema(final String tableLikeExpression,
            final boolean isRecreateTable, final boolean isRecreateAllFk,
            final boolean isSetToChar, final String tableSpaceName) {

        updateSchemaPrerequisites(tableLikeExpression);

        new UpdateSchemaJob(true, true, isRecreateTable, isRecreateTable, isSetToChar,
            tableSpaceName).run();
        
        return "Table(s) ' " + tableLikeExpression
                + "' were updated. Please check the logs for details. ";
    }

    /**
     *
     * Update Schema prerequisites.
     *
     * @param tableLikeExpression tables to update.
     */
    private static void updateSchemaPrerequisites(final String tableLikeExpression) {
        ContextStore.get().getProject().clearCachedTableDefs();
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        final AddTableNamesToTransferSetJob addTablesToProcessJob =
                new AddTableNamesToTransferSetJob(new ArrayList<String>(), false,
                    tableLikeExpression, false);
        addTablesToProcessJob.run();
    }
}

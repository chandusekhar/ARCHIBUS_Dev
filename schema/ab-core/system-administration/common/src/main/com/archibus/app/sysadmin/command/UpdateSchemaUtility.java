package com.archibus.app.sysadmin.command;

import com.archibus.app.sysadmin.updatewizard.project.loader.TableProperties;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.job.UpdateSchemaJob;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;

import junit.framework.Assert;

/**
 * Command-line utility, to be invoked by the build script.
 * <p>
 * Reads ARCHIBUS database schema and applies it to SQL schema.
 *
 * Integration test for UpdateSchemaJob. Invoked by UpgradeSchemaUtility; provides context for
 * UpdateSchemaJob and runs UpdateSchemaJob.
 * <p>
 * Integration test is used here as framework that runs WebCentral without servlet container.
 *
 *
 * @author Valery Tydykov
 * @since 23.1
 *
 */
public class UpdateSchemaUtility extends DataSourceTestBase {
    /**
     * Property: name of the table for which schema should be updated. Typical value : "ac".
     */
    private static String tableName;

    /**
     * Runs this unit test as command-line utility. Requires argument: table name.
     *
     * @param args Requires argument: table name.
     *
     *            <p>
     *            Suppress PMD warning "DoNotCallSystemExit".
     *            <p>
     *            Justification: This is a command-line utility. TestRunner thread will not stop, it
     *            needs to be stopped by System.exit().
     */
    @SuppressWarnings("PMD.DoNotCallSystemExit")
    public static void main(final String[] args) {
        Assert.assertTrue("Must be one argument: table name", args.length == 1);

        tableName = args[0];

        junit.textui.TestRunner.run(UpdateSchemaUtility.class);
        System.exit(0);
    }

    /**
     * Tests run method of UpdateSchemaJob.
     */
    public void testRun() {
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);

        final TableProperties table = new TableProperties();
        table.setName(UpdateSchemaUtility.tableName);
        table.setNoOfRecords(0);

        ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);

        final UpdateSchemaJob updateSchemaJob =
                new UpdateSchemaJob(true, false, true, false, false, "");
        updateSchemaJob.run();

        // Commit the changes
        ContextStore.get().getDbConnection().commit();
    }
}

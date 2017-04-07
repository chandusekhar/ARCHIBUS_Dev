package com.archibus.app.sysadmin.updatewizard.project;

import java.io.*;
import java.util.ArrayList;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.ext.importexport.exporter.*;
import com.archibus.ext.importexport.importer.*;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.utility.ExceptionBase;

/**
 * Date Transfer using Database Exporter/Importer.
 *
 * @author Catalin Purice
 *
 */
public class TestTransferUsingDtManager extends DataSourceTestBase {

    /**
     * Testing transfer out.
     */
    public void testTransferOut(final String tableName) {
        final String filePath =
                TransferFile.getTransferFolderOut() + File.separator + tableName + "."
                        + XlsBuilder.FileFormatType.CSV.toString().toLowerCase();
        final DatabaseExporter dtOutManager =
                (DatabaseExporter) ContextStore.get().getBean(
                    DatabaseExporterImpl.DATABASEEXPORTOR_BEAN);

        try {
            dtOutManager.setDocPath(TransferFile.getTransferFolderOut());
            
            dtOutManager.exportData(filePath, "activity_log", new ArrayList<String>(), null,
                tableName, true);
        } catch (final ExceptionBase e) {
            e.printStackTrace();
        }
    }
    
    /**
     * Testing transfer in.
     */
    public void testTransferIn(final String tableName) {

        final DatabaseImporter dtInManager =
                (DatabaseImporter) ContextStore.get().getBean(
                    DatabaseImporterImpl.DATABASEIMPORTOR_BEAN);

        final String fileName =
                tableName + "." + XlsBuilder.FileFormatType.CSV.toString().toLowerCase();
        final String dataPath = TransferFile.getTransferFolderOut();

        try {
            final InputStream inputStream =
                    new FileInputStream(new File(dataPath + File.separator + fileName));
            dtInManager.importData(inputStream, XlsBuilder.FileFormatType.CSV, true, dataPath,
                true, "", true);
        } catch (final ExceptionBase e) {
            e.printStackTrace();
        } catch (final FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * test if all records exported are imported back.
     */
    public void testExportImportAllRecords() {

        // get initial records
        final int initialCount =
                DataStatistics.getInt("activity_log", "activity_log_id", "COUNT", "");
        testTransferOut("activity_log");

        // delete all records from activity_log
        SqlUtils.executeUpdate("activity_log", "DELETE FROM activity_log");
        SqlUtils.commit();

        testTransferIn("activity_log");

        final int afterImportCount =
                DataStatistics.getInt("activity_log", "activity_log_id", "COUNT", "");
        assertEquals(initialCount, afterImportCount);
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml",
                "/context/core/core-optional.xml", "/context/reports/docx/reports-docx.xml",
                "/context/controls/drawing/controls-drawing.xml", "appContext-test.xml" };
    }

}

package com.archibus.app.sysadmin.updatewizard.project.transfer.out;

import java.io.File;
import java.util.ArrayList;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.context.ContextStore;
import com.archibus.ext.importexport.exporter.*;
import com.archibus.utility.*;

/**
 * Transfer file out properties.
 *
 * @author Catalin Purice
 *
 */
public class TransferFileOut extends TransferFile {
    
    /**
     * data transfer out manager.
     */
    private final transient DatabaseExporter dtOutManager;
    
    /**
     * Constructor.
     */
    public TransferFileOut() {
        super();
        this.dtOutManager =
                (DatabaseExporter) ContextStore.get().getBean(
                    DatabaseExporterImpl.DATABASEEXPORTOR_BEAN);
    }
    
    /**
     * Set the file name to export.
     *
     * @param fileName file name
     */
    public void setTableName(final String fileName) {
        loadTableParam(fileName);
        final File outFile = this.getFile();
        final File folderFile = outFile.getParentFile();
        FileUtil.createFoldersIfNot(folderFile.getAbsolutePath());
    }
    
    /**
     *
     * @throws ExceptionBase ExceptionBase
     */
    public void transferOut() throws ExceptionBase {
        this.dtOutManager.exportData(getFile().getAbsolutePath(), getTableName(),
            new ArrayList<String>(), null, getTableName(), this.isDocTable());
    }
    
    /**
     * Getter for the dtOutManager property.
     *
     * @see dtOutManager
     * @return the dtOutManager property.
     */
    public DatabaseExporter getDtOutManager() {
        return this.dtOutManager;
    }
}

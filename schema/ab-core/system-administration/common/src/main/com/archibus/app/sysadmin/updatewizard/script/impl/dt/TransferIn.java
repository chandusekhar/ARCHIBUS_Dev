package com.archibus.app.sysadmin.updatewizard.script.impl.dt;

import java.io.*;

import org.apache.log4j.Category;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.SqlFileLoggerBuilder;
import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.context.ContextStore;
import com.archibus.db.SqlLoggerWithOptions;
import com.archibus.ext.importexport.importer.*;
import com.archibus.utility.ExceptionBase;
import com.enterprisedt.util.debug.Logger;

/**
 *
 * Data transfer in for batch file script.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class TransferIn extends AbstractDataTransfer<DatabaseImporter> implements
IDataTransfer<ResponseMessage> {

    /**
     * Error message.
     */
    private static final String ERR_MESSAGE = "An error occurred during transfer in: ";

    /**
     * Result of import.
     */
    private static final String RESULT_MESSAGE_TRANSFER_IN =
            "%d records inserted, %d records updated, %d records with error. Imported file: %s";
    
    /**
     * Result message.
     */
    private String responseMessage;
    
    /**
     * Result message.
     */
    private ResponseMessage.Level responseType;

    /**
     * Full path name.
     */
    private final String fullPathName;

    /**
     * Constructor.
     *
     * @param fullPathName data transfer importer manager
     */
    public TransferIn(final String fullPathName) {
        super((DatabaseImporter) ContextStore.get().getBean(
            DatabaseImporterImpl.DATABASEIMPORTOR_BEAN));
        this.fullPathName = fullPathName;
        this.responseMessage = "";
        this.responseType = ResponseMessage.Level.INFO;
    }

    @Override
    public void transfer() {
        
        DataTransferFileSystem dtFileSystem = null;
        Category sqlFileLogger = null;
        InputStream inputStream = null;
        
        try {

            dtFileSystem = new DataTransferFileSystem(this.fullPathName);
            sqlFileLogger =
                    SqlFileLoggerBuilder.createLogger(TransferFile.getTransferFolderOut()
                            + File.separator + dtFileSystem.getFileInstance().getName() + ".sql",
                        false);
            inputStream = dtFileSystem.getInputStream(dtFileSystem.getFileInstance());
            this.getDtManager().resetCounters();
            this.getDtManager().importData(inputStream, dtFileSystem.getFileType(), true,
                TransferFile.getTransferFolderOut(), true, TransferFile.getTransferFolderOut(),
                true, new SqlLoggerWithOptions(sqlFileLogger, true));
            this.responseMessage =
                    String.format(RESULT_MESSAGE_TRANSFER_IN, this.getDtManager()
                        .nRecordsInserted(), this.getDtManager().nRecordsUpdated(), this
                        .getDtManager().nRecordsWithErrors(), dtFileSystem.getFileInstance()
                        .getAbsolutePath());
            if (this.getDtManager().nRecordsWithErrors() > 0) {
                this.responseType = ResponseMessage.Level.ERROR;
            }
        } catch (final ExceptionBase e) {
            this.responseMessage = ERR_MESSAGE + e.getMessage();
            this.responseType = ResponseMessage.Level.ERROR;
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (final IOException e) {
                    Logger.getLogger(this.getClass()).info(
                        "Error while closing the stream: " + e.getCause().getMessage());
                }
                if (sqlFileLogger != null) {
                    sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
                }
            }
        }
    }
    
    @Override
    public ResponseMessage getResultMessage() {
        return new ResponseMessage(this.responseMessage, this.responseType);
    }
}

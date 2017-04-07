package com.archibus.app.sysadmin.updatewizard.script.impl.dt;

import com.archibus.app.sysadmin.updatewizard.script.impl.ResponseMessage;
import com.archibus.context.ContextStore;
import com.archibus.ext.importexport.exporter.*;

/**
 *
 * Transfer out the specified file.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class TransferOut extends AbstractDataTransfer<DatabaseExporter> implements
        IDataTransfer<ResponseMessage> {
    /**
     * Result of export.
     */
    private static final String RESULT_MESSAGE_TRANSFER_OUT = "%d records exported.";
    
    /**
     * Constructor.
     *
     */
    public TransferOut() {
        super((DatabaseExporter) ContextStore.get().getBean(
            DatabaseExporterImpl.DATABASEEXPORTOR_BEAN));
    }
    
    @Override
    public void transfer() {
        /*
         * this.getDtManager().exportData(fullPathFileName, tableName, new ArrayList<String>(),
         * restrictions, tableName, this.isDocTable());
         */
    }

    @Override
    public ResponseMessage getResultMessage() {
        return new ResponseMessage(String.format(RESULT_MESSAGE_TRANSFER_OUT, this.getDtManager()
            .nRecordsExported()), null);
    }
}

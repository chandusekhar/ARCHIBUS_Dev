package com.archibus.eventhandler.waste.label;

import java.io.File;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.docx.DocxUtility;
import com.archibus.utility.*;
import com.aspose.words.Document;

/**
 * Waste Management Common Handler.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteLabelImpl extends EventHandlerBase implements WasteLabel {
    
    /**
     * Indicates the folder that holds Label docx template file.
     * 
     */
    public static final String LABEL_DOCX_FOLDER = ContextStore.get().getWebAppPath()
            + "/schema/ab-products/risk/waste/common/";
    
    /**
     * Indicates the field values that will fill in label docx.
     * 
     */
    protected Object[] docxFieldValues;
    
    /**
     * Indicates the field values that will fill in label docx.
     * 
     */
    protected int wasteId;
    
    /**
     * Indicates the fields in label template.
     * 
     */
    protected String[] docxFields;
    
    /**
     * Indicates the label template file name.
     * 
     */
    protected String templateFileName = "";
    
    /**
     * Generate Selected Label word file by waste out record contained in array.
     * 
     */
    public void generateLabel() {
        // Load word template from server
        final Document hazDocTemplate =
                DocxUtility.getDocument(new File(LABEL_DOCX_FOLDER + this.templateFileName));
        // Create file folder for new file being generated
        final String outFileFolder =
                ContextStore.get().getWebAppPath() + "/schema/per-site/pdf-forms/"
                        + ContextStore.get().getUser().getName().toLowerCase() + "/";
        FileUtil.createFoldersIfNot(outFileFolder);
        // New file path
        final String outFilePath = outFileFolder + this.wasteId + ".docx";
        // Set record field valuse to word template field
        try {
            hazDocTemplate.getMailMerge().execute(this.docxFields, this.docxFieldValues);
            hazDocTemplate.save(outFilePath);
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            // Wrap original exception into ExceptionBase, supplying user-friendly error message.
            // @translatable
            final String message = "Could not generate Label docx:" + this.templateFileName;
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException(message, null);
            exception.setNested(originalException);
            
            throw exception;
        }
    }
    
}

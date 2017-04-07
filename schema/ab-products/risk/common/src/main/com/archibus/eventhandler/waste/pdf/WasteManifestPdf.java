package com.archibus.eventhandler.waste.pdf;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.waste.WasteUtility;
import com.archibus.ext.pdflivecycle.PdfFormExportJob;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.FileUtil;
import com.aspose.pdf.kit.*;

/**
 * Waste Management Manifest PDF form class.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteManifestPdf {
    
    /**
     * Indicates manifest.
     * 
     */
    private static final String MANIFEST = "manifest";
    
    /**
     * Indicates tempmanifestPage1.
     * 
     */
    private static final String TEMPLATE_MANIFEST_PAGE1_PDF = "waste_manifest_page1.pdf";
    
    /**
     * Indicates the code size.
     * 
     */
    private static final int CODE_SIZE = 6;
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEMPORARY_PDF_FILE1 = "tempPDFFile1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEMPORARY_PDF_FILE2 = "tempPDFFile2";
    
    /**
     * Indicates p2.
     * 
     */
    private static final String PAGE2 = "p2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_DIS_PART = "teams_dis_part";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_DIS_RESIDUE = "teams_dis_residue";
    
    /**
     * Indicates abWasteRptFacilityDs.
     * 
     */
    private static final String AB_WASTE_RPT_FACILITY_DS = "abWasteRptFacilityDs";
    
    /**
     * Indicates the pdf.
     * 
     */
    private static final String PDF = ".pdf";
    
    /**
     * Indicates '.'.
     * 
     */
    private static final String STRING_1 = "'";
    
    /**
     * Indicates the record size.
     * 
     */
    private static final int FIRST_PAGE_WASTE_SIZE = 4;
    
    /**
     * Indicates the view name.
     * 
     */
    private static final String VIEW_NAME = "ab-waste-rpt-manifests.axvw";
    
    /**
     * DataSource of regulated_code.
     * 
     */
    private final DataSource codeDS = DataSourceFactory.createDataSourceForFields(
        "waste_profile_reg_codes", new String[] { "waste_profile", "regulated_code" });
    
    /**
     * DataSource of abWasteRptMainfestsDs.
     * 
     */
    private final DataSource manifestDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptMainfestsDs");
    
    /**
     * DataSource of abWasteRptGeneratorDs.
     * 
     */
    private final DataSource genDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptGeneratorDs");
    
    /**
     * DataSource of abWasteRptOutDs.
     * 
     */
    private final DataSource watesOutDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        "abWasteRptOutDs");
    
    /**
     * DataSource of AB_WASTE_RPT_FACILITY_DS.
     * 
     */
    private final DataSource facDs = DataSourceFactory.loadDataSourceFromFile(VIEW_NAME,
        AB_WASTE_RPT_FACILITY_DS);
    
    /**
     * Indicates the field name .
     * 
     */
    private final String manifestNumber;
    
    /**
     * Indicates the field name .
     * 
     */
    private boolean blank;
    
    /**
     * Indicates the field name .
     * 
     */
    private boolean both;
    
    /**
     * Constructor of Class.
     * 
     * @param manifestNumber manifest number
     * 
     */
    
    public WasteManifestPdf(final String manifestNumber) {
        this.manifestNumber = manifestNumber;
        this.blank = false;
        this.both = false;
    }
    
    /**
     * get blank.
     * 
     * @return boolean
     */
    public boolean isBlank() {
        return this.blank;
    }
    
    /**
     * set blank.
     * 
     * @param blank boolean
     */
    public void setBlank(final boolean blank) {
        this.blank = blank;
    }
    
    /**
     * get both.
     * 
     * @return boolean
     */
    public boolean isBoth() {
        return this.both;
    }
    
    /**
     * set both.
     * 
     * @param both boolean
     */
    public void setBoth(final boolean both) {
        this.both = both;
    }
    
    /**
     * Getter for the codeDS property.
     * 
     * @see codeDS
     * @return the codeDS property.
     */
    public DataSource getCodeDS() {
        return this.codeDS;
    }
    
    /**
     * Getter for the manifestDs property.
     * 
     * @see manifestDs
     * @return the manifestDs property.
     */
    public DataSource getManifestDs() {
        return this.manifestDs;
    }
    
    /**
     * Getter for the genDs property.
     * 
     * @see genDs
     * @return the genDs property.
     */
    public DataSource getGenDs() {
        return this.genDs;
    }
    
    /**
     * Getter for the watesOutDs property.
     * 
     * @see watesOutDs
     * @return the watesOutDs property.
     */
    public DataSource getWatesOutDs() {
        return this.watesOutDs;
    }
    
    /**
     * Getter for the facDs property.
     * 
     * @see facDs
     * @return the facDs property.
     */
    public DataSource getFacDs() {
        return this.facDs;
    }
    
    /**
     * generate manifest pdf form.
     * 
     * 
     * @return JobResult job result
     */
    public JobResult generateSingleManifestPdf() {
        
        // Get waste records from DataSource
        // KB 3033456 add the status restriction so that duplicated records are not showed in case
        // the manifest is assigned to both the Generated and Disposed waste records
        final List<DataRecord> wasteOutRecords =
                this.watesOutDs.getRecords("waste_out.manifest_number='" + this.manifestNumber
                        + "' AND waste_out.status='D'");
        
        final DataRecord manifestRecord =
                this.manifestDs.getRecord("waste_manifests.manifest_number='" + this.manifestNumber
                        + STRING_1);
        
        // Calculate the page number of PDF file by size of waste records list
        int pageCount = 1;
        if (wasteOutRecords.size() > FIRST_PAGE_WASTE_SIZE) {
            pageCount =
                    pageCount + (wasteOutRecords.size() - FIRST_PAGE_WASTE_SIZE)
                            / WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE + 1;
        }
        
        // Load pdf kit license
        PdfFormExportJob.loadPdfKitLibraryLicense();
        final String temporaryPdfFilePath =
                WasteUtility.gePdfFilePath("tempmanifest" + this.manifestNumber + PDF);
        
        // Get the generated PDF form and set the 'Hazard' sign
        final Form form = getForm(wasteOutRecords, temporaryPdfFilePath, pageCount);
        checkHaz(wasteOutRecords);
        
        // Fill value of waste records to PDF from
        WasteManifestPdfFormWriter.fillPdf(this, wasteOutRecords, manifestRecord, form, pageCount);
        
        // Generate the PDF file
        try {
            
            form.allFlatten();
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            WasteUtility.wrapAndThrowException(originalException);
            
        } finally {
            
            // Call close() in a finally block -KB3038953
            this.closeForm(form);
            
            // Delete the generated temporary file from server.
            FileUtil.deleteFile(temporaryPdfFilePath);
        }
        
        return new JobResult("", MANIFEST + this.manifestNumber + PDF,
            PdfFormExportJob.getPdfOutputFileContextPathAndName(MANIFEST + this.manifestNumber
                    + PDF));
        
    }
    
    /**
     * Create and return single or multiple page PDF form, based on waste our records.
     * 
     * @param wasteOutRecords List<DataRecord>
     * @param temporaryPdfFilePath String path of temporary generated PDF file
     * @param pageCount int number of pages
     * @return Form
     * 
     */
    private Form getForm(final List<DataRecord> wasteOutRecords, final String temporaryPdfFilePath,
            final int pageCount) {
        
        Form form = null;
        FormEditor editor = null;
        
        // Create output file folder
        final String outputFilefolderPath = WasteUtility.gePdfFilePath("");
        FileUtil.createFoldersIfNot(outputFilefolderPath);
        
        // initial path of output PDF file
        final String outputFilePath =
                WasteUtility.gePdfFilePath(MANIFEST + this.manifestNumber + PDF);
        
        // if waste records can be in single page
        if (wasteOutRecords.size() <= FIRST_PAGE_WASTE_SIZE) {
            
            // initial form editor for the single page PDF template and then close it
            this.createAndCloseEditor(
                WasteUtility.getTemplateFilePath(TEMPLATE_MANIFEST_PAGE1_PDF), temporaryPdfFilePath);
            
            // create single page pdf form
            form = this.createNewForm(temporaryPdfFilePath, outputFilePath);
            
        } else {
            // if need multiple pages for showing waste records
            
            final String temporaryPdfFilePath1 =
                    WasteUtility.gePdfFilePath(TEMPORARY_PDF_FILE1 + this.manifestNumber + PDF);
            final String temporaryPdfFilePath2 =
                    WasteUtility.gePdfFilePath(TEMPORARY_PDF_FILE2 + this.manifestNumber + PDF);
            
            // initial editor for first PDF page
            this.createAndCloseEditor(
                WasteUtility.getTemplateFilePath(TEMPLATE_MANIFEST_PAGE1_PDF),
                temporaryPdfFilePath1);
            
            // create multiple pdf pages
            for (int i = 0; i < pageCount - 1; i++) {
                
                // initial editor for rest pages except for first page
                if (i != 0) {
                    
                    this.createAndCloseEditor(temporaryPdfFilePath, temporaryPdfFilePath1);
                }
                
                // initial editor for continue pages
                editor =
                        this.createNewEditor(
                            WasteUtility.getTemplateFilePath("waste_manifest_con_sheet.pdf"),
                            temporaryPdfFilePath2);
                
                // rename the fields name before concat the template
                this.renamaFields(editor, i);
                
                // close() the editor
                this.closeEditor(editor);
                
                // concat the pdf templates
                try {
                    
                    final PdfFileEditor pdfEditor = new PdfFileEditor();
                    pdfEditor.append(temporaryPdfFilePath1, temporaryPdfFilePath2, 1, 1,
                        temporaryPdfFilePath);
                    
                    // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
                    // method throws a checked Exception, which needs to be wrapped in ExceptionBase
                } catch (final Exception originalException) {
                    // CHECKSTYLE:ON
                    
                    WasteUtility.wrapAndThrowException(originalException);
                    
                } finally {
                    
                    FileUtil.deleteFile(temporaryPdfFilePath1);
                    FileUtil.deleteFile(temporaryPdfFilePath2);
                    
                }
                
            }
            
            // create multiple page pdf form
            form = this.createNewForm(temporaryPdfFilePath, outputFilePath);
        }
        
        return form;
    }
    
    /**
     * Rename form fields in editor for given page number.
     * 
     * @param editor FormEditor
     * @param pageNum int page number
     * 
     */
    private void renamaFields(final FormEditor editor, final int pageNum) {
        editor
            .renameField(WasteManifestPdfConstant.CURRENT_PAGE + PAGE2,
                WasteManifestPdfConstant.CURRENT_PAGE + WasteManifestPdfConstant.P2_STR
                        + (pageNum + 2));
        editor.renameField(WasteManifestPdfConstant.TOTAL_PAGES + PAGE2,
            WasteManifestPdfConstant.TOTAL_PAGES + WasteManifestPdfConstant.P2_STR + (pageNum + 2));
        
        for (int num = 1; num <= WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE; num++) {
            
            for (final String pdfName : WasteManifestPdfConstant.OUT_PDF_NAMES) {
                editor.renameField(pdfName + num + PAGE2, pdfName + num
                        + WasteManifestPdfConstant.P2_STR + (pageNum + 2));
            }
            
            editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_FULL,
                WasteManifestPdfConstant.TEAMS_DIS_FULL + WasteManifestPdfConstant.P2_STR
                        + (pageNum + 2));
            editor.renameField(TEAMS_DIS_PART, TEAMS_DIS_PART + WasteManifestPdfConstant.P2_STR
                    + (pageNum + 2));
            editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_TYPE,
                WasteManifestPdfConstant.TEAMS_DIS_TYPE + WasteManifestPdfConstant.P2_STR
                        + (pageNum + 2));
            editor.renameField(WasteManifestPdfConstant.TEAMS_DIS_QTY,
                WasteManifestPdfConstant.TEAMS_DIS_QTY + WasteManifestPdfConstant.P2_STR
                        + (pageNum + 2));
            editor.renameField(TEAMS_DIS_RESIDUE, TEAMS_DIS_RESIDUE
                    + WasteManifestPdfConstant.P2_STR + (pageNum + 2));
            editor.renameField(WasteManifestPdfConstant.A9A + num + PAGE2,
                WasteManifestPdfConstant.A9A + num + WasteManifestPdfConstant.P2_STR
                        + (pageNum + 2));
            
            for (int code = 1; code <= CODE_SIZE; code++) {
                
                editor.renameField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + num + code + PAGE2,
                    WasteManifestPdfConstant.TEAMS_HAZ_CODE + num + code
                            + WasteManifestPdfConstant.P2_STR + (pageNum + 2));
            }
        }
    }
    
    /**
     * Check the 'Hazard' sign.
     * 
     * @param wasteOutRecords List<DataRecord>
     */
    private void checkHaz(final List<DataRecord> wasteOutRecords) {
        final Set<String> set = new HashSet<String>();
        for (int i = 0; i < wasteOutRecords.size(); i++) {
            final DataRecord out = wasteOutRecords.get(i);
            final String haz = out.getString(WasteManifestPdfConstant.WASTE_TYPE);
            set.add(haz);
        }
        if (set.size() > 1) {
            this.setBoth(set.contains(WasteManifestPdfConstant.HAZ));
        }
    }
    
    /**
     * Try to close the form, catch and throw the exception.
     * 
     * 
     * @param form Form template form
     */
    private void closeForm(final Form form) {
        try {
            
            form.close();
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            WasteUtility.wrapAndThrowException(originalException);
        }
        
    }
    
    /**
     * Try to close the Editor, catch and throw the exception.
     * 
     * 
     * @param editor FormEditor
     */
    private void closeEditor(final FormEditor editor) {
        try {
            editor.close();
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        
    }
    
    /**
     * Try to create and close the Editor, meanwhile catch and throw the exception.
     * 
     * 
     * @param srcTemplateFilePath String source form template file path
     * @param destFilePath String destination form template file path
     */
    private void createAndCloseEditor(final String srcTemplateFilePath, final String destFilePath) {
        
        FormEditor editor = null;
        
        try {
            
            editor = new FormEditor(srcTemplateFilePath, destFilePath);
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            WasteUtility.wrapAndThrowException(originalException);
            
        } finally {
            if (editor != null) {
                
                this.closeEditor(editor);
            }
        }
        
    }
    
    /**
     * Try to create and return a new form.
     * 
     * 
     * @param templateFilePath String source template file path
     * @param outputFilePath String outout PDF file path
     * 
     * @return Form
     */
    private Form createNewForm(final String templateFilePath, final String outputFilePath) {
        
        Form form = null;
        
        try {
            
            form = new Form(templateFilePath, outputFilePath);
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            WasteUtility.wrapAndThrowException(originalException);
            
        }
        
        return form;
    }
    
    /**
     * Try to create and return a new form Editor.
     * 
     * 
     * @param templateFilePath String source template file path
     * @param outputFilePath String outout PDF file path
     * 
     * @return Form
     */
    private FormEditor createNewEditor(final String templateFilePath, final String outputFilePath) {
        
        FormEditor editor = null;
        
        try {
            
            editor = new FormEditor(templateFilePath, outputFilePath);
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            
            WasteUtility.wrapAndThrowException(originalException);
            
        }
        
        return editor;
    }
    
}

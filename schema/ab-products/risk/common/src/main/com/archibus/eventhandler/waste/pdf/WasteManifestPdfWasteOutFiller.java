package com.archibus.eventhandler.waste.pdf;

import java.util.List;

import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.waste.WasteUtility;
import com.aspose.pdf.kit.Form;

/**
 * Waste Management Manifest PDF form class.
 * 
 * 
 * @author ASC-BJ
 *         <p>
 *         Suppress PMD.TooManyMethods warning.
 *         <p>
 */
public final class WasteManifestPdfWasteOutFiller {
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String PAGE1 = "p1";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_PROFILES_WASTE_PROFILE = "waste_profiles.waste_profile";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_PROFILE = "waste_profile_reg_codes.waste_profile='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_REGULATED_CODE = "waste_profile_reg_codes.regulated_code";
    
    /**
     * Indicates x.
     * 
     */
    private static final String XVALUE = "X";
    
    /**
     * Indicates the format.
     * 
     */
    private static final String QTY = "0.00";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_OUT_QUANTITY = "waste_out.quantity";
    
    /**
     * Indicates the record size.
     * 
     */
    private static final int FIRST_PAGE_WASTE_SIZE = 4;
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfWasteOutFiller() {
        
    }
    
    /**
     * Fill waste out info.
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param page int
     */
    public static void fillOut(final WasteManifestPdf pdf, final List<DataRecord> wasteOutRecords,
            final Form form, final int page) {
        final String[] fieldNames =
                { "waste_profiles.transp_shipping_name", "waste_profiles.waste_name",
                        "waste_profiles.transp_classification", "waste_out.number_containers",
                        "waste_out.container_cat", WASTE_OUT_QUANTITY, "waste_out.units",
                        "waste_out.method_code" };
        // fill single page
        fillSinglePageOut(pdf, wasteOutRecords, form, fieldNames,
            WasteManifestPdfConstant.OUT_PDF_NAMES);
        if (page > 1) {
            // fill mutiple page
            fillMultiplePageOut(pdf, wasteOutRecords, form, page, fieldNames,
                WasteManifestPdfConstant.OUT_PDF_NAMES);
        }
    }
    
    /**
     * Fill Multiple Page Out.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param page int
     * @param fieldNames String[]
     * @param pdfNames String[]
     */
    private static void fillMultiplePageOut(final WasteManifestPdf pdf,
            final List<DataRecord> wasteOutRecords, final Form form, final int page,
            final String[] fieldNames, final String[] pdfNames) {
        DataRecord outRecord = null;
        try {
            for (int pnum = 2; pnum <= page; pnum++) {
                form.setField(WasteManifestPdfConstant.CURRENT_PAGE
                        + WasteManifestPdfConstant.P2_STR + pnum, String.valueOf(pnum));
                form.setField(WasteManifestPdfConstant.TOTAL_PAGES
                        + WasteManifestPdfConstant.P2_STR + pnum, String.valueOf(page));
                int inum = 0;
                for (int outNum =
                        FIRST_PAGE_WASTE_SIZE + WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE
                                * (pnum - 2); outNum < wasteOutRecords.size(); outNum++) {
                    outRecord = wasteOutRecords.get(outNum);
                    pdf.setBlank(WasteUtility.checkBlank(outRecord, fieldNames, pdf.isBlank()));
                    inum =
                            outNum - FIRST_PAGE_WASTE_SIZE
                                    - WasteManifestPdfConstant.CONT_PAGE_WASTE_SIZE * (pnum - 2)
                                    + 1;
                    final List<DataRecord> codeRecords =
                            pdf.getCodeDS().getRecords(
                                WASTE_PROFILE + outRecord.getValue(WASTE_PROFILES_WASTE_PROFILE)
                                        + WasteManifestPdfConstant.STRING_1);
                    // set out info to pdf
                    for (int s = 0; s < fieldNames.length; s++) {
                        if (WASTE_OUT_QUANTITY.equals(fieldNames[s])) {
                            final double quantity = outRecord.getDouble(fieldNames[s]);
                            final String squantity =
                                    new java.text.DecimalFormat(QTY).format(quantity);
                            form.setField(pdfNames[s] + inum + WasteManifestPdfConstant.P2_STR
                                    + pnum, squantity);
                        } else {
                            form.setField(pdfNames[s] + inum + WasteManifestPdfConstant.P2_STR
                                    + pnum, WasteUtility.isNull(String.valueOf(outRecord
                                .getValue(fieldNames[s]))));
                        }
                    }
                    if (pdf.isBoth()) {
                        final String hazardous =
                                outRecord.getString(WasteManifestPdfConstant.WASTE_TYPE);
                        if (WasteManifestPdfConstant.HAZ.equals(hazardous)) {
                            form.setField(WasteManifestPdfConstant.A9A + inum
                                    + WasteManifestPdfConstant.P2_STR + pnum, XVALUE);
                        }
                    }
                    // set code info to pdf
                    for (int t = 0; t < codeRecords.size(); t++) {
                        final int mnum = t + 1;
                        final DataRecord code = codeRecords.get(t);
                        final String[] fields = { WASTE_REGULATED_CODE };
                        pdf.setBlank(WasteUtility.checkBlank(code, fields, pdf.isBlank()));
                        form.setField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + inum + mnum
                                + WasteManifestPdfConstant.P2_STR + pnum, WasteUtility
                            .isNull(String.valueOf(code.getValue(WASTE_REGULATED_CODE))));
                        
                    }
                    
                }
            }
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill Single Page Out.
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param form Form
     * @param fieldNames String[]
     * @param pdfNames String[]
     */
    private static void fillSinglePageOut(final WasteManifestPdf pdf,
            final List<DataRecord> wasteOutRecords, final Form form, final String[] fieldNames,
            final String[] pdfNames) {
        DataRecord outRecord = null;
        try {
            for (int i = 0; i < wasteOutRecords.size() && i < FIRST_PAGE_WASTE_SIZE; i++) {
                final int inum = i + 1;
                outRecord = wasteOutRecords.get(i);
                pdf.setBlank(WasteUtility.checkBlank(outRecord, fieldNames, pdf.isBlank()));
                final List<DataRecord> codeRecords =
                        pdf.getCodeDS().getRecords(
                            WASTE_PROFILE + outRecord.getValue(WASTE_PROFILES_WASTE_PROFILE)
                                    + WasteManifestPdfConstant.STRING_1);
                // set code info to pdf
                for (int t = 0; t < codeRecords.size(); t++) {
                    final int mnum = t + 1;
                    final DataRecord code = codeRecords.get(t);
                    final String[] fields = { WASTE_REGULATED_CODE };
                    pdf.setBlank(WasteUtility.checkBlank(code, fields, pdf.isBlank()));
                    form.setField(WasteManifestPdfConstant.TEAMS_HAZ_CODE + inum + mnum + PAGE1,
                        WasteUtility.isNull(String.valueOf(code.getValue(WASTE_REGULATED_CODE))));
                    
                }
                // set out info to pdf
                for (int s = 0; s < fieldNames.length; s++) {
                    if (WASTE_OUT_QUANTITY.equals(fieldNames[s])) {
                        final double quantity = outRecord.getDouble(fieldNames[s]);
                        final String squantity = new java.text.DecimalFormat(QTY).format(quantity);
                        form.setField(pdfNames[s] + inum + PAGE1, squantity);
                    } else {
                        form.setField(pdfNames[s] + inum + PAGE1,
                            WasteUtility.isNull(String.valueOf(outRecord.getValue(fieldNames[s]))));
                    }
                }
                if (pdf.isBoth()) {
                    final String hazardous =
                            outRecord.getString(WasteManifestPdfConstant.WASTE_TYPE);
                    if (WasteManifestPdfConstant.HAZ.equals(hazardous)) {
                        form.setField(WasteManifestPdfConstant.A9A + inum + PAGE1, XVALUE);
                    }
                }
            }
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
}

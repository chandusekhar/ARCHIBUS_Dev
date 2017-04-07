package com.archibus.eventhandler.waste.pdf;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.waste.WasteUtility;
import com.archibus.utility.StringUtil;
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
public final class WasteManifestPdfFormWriter {
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXY = "Y";
    
    /**
     * Indicates the EPAID name.
     * 
     */
    private static final String EPAID = "vn.insurance_cert1";
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXE = "E";
    
    /**
     * Indicates check box.
     * 
     */
    private static final String BOXI = "I";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_CONTACTNOTES = "teams_contactnotes";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_FAC_SIGN = "teams_fac_sign";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String TEAMS_ALT_SIGN = "teams_alt_sign";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String FULL_REJECTION = "waste_manifests.discrepancy_full_rejection";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String PARTIAL_REJECTION = "waste_manifests.discrepancy_partial_rejection";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_TYPE =
            "waste_manifests.discrepancy_type";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_QTY = "waste_manifests.discrepancy_qty";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_MANIFESTS_DISCREPANCY_RESIDUE =
            "waste_manifests.discrepancy_residue";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String COMPANY = "company";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String VN_VN_ID = "vn.vn_id='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String VN_COMPANY = "vn.company";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_MEN_NUM = "waste_manifests.manifest_number";
    
    /**
     * Indicates the field name of 'waste_out.generator_id'.
     * 
     */
    private static final String WASTE_OUT_GENERATOR_ID = "waste_out.generator_id";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfFormWriter() {
        
    }
    
    /**
     * fill pdf value.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param wasteOutRecords List<DataRecord>
     * @param manifestRecord DataRecord
     * @param form Form
     * @param page int
     */
    public static void fillPdf(final WasteManifestPdf pdf, final List<DataRecord> wasteOutRecords,
            final DataRecord manifestRecord, final Form form, final int page) {
        try {
            // fill totalPages
            form.setField("totalPagesp1", String.valueOf(page));
            // fill the manifest info
            fillBasicManifestInfo(pdf, manifestRecord, form);
            // fill the check box info
            fillCheckBoxField(manifestRecord, form, page);
            // fill the fac info
            WasteManifestPdfFacilityFiller.fillFacilityInfo(pdf, manifestRecord, form);
            if (!wasteOutRecords.isEmpty()) {
                // fill waste out info
                WasteManifestPdfWasteOutFiller.fillOut(pdf, wasteOutRecords, form, page);
                final String gId =
                        WasteUtility.isNull(String.valueOf(wasteOutRecords.get(0).getValue(
                            WASTE_OUT_GENERATOR_ID)));
                if (!"".equals(gId) && null != gId) {
                    // fill generator info
                    WasteManifestPdfGeneratorFiller.fillGenerator(pdf, form, gId);
                }
            }// CHECKSTYLE:OFF
             // Suppress IllegalCatch warnings.
             // Justification: third-party API method throws a checked Exception, which needs to be
             // wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill basic ManifestInfo.
     * 
     * @param pdf WasteManifestPdf object
     * @param manifestRecord DataRecord
     * @param form manifestRecord
     */
    private static void fillBasicManifestInfo(final WasteManifestPdf pdf,
            final DataRecord manifestRecord, final Form form) {
        final String[] fieldName =
                { WASTE_MEN_NUM, "waste_manifests.handling_instructions",
                        "waste_manifests.signed_by", "waste_manifests.port",
                        "waste_manifests.sign_transporter", "waste_manifests.sign_transporter_2",
                        "waste_manifests.manifest_reference_num",
                        WASTE_MANIFESTS_DISCREPANCY_RESIDUE,
                        "waste_manifests.sign_alternate_facility", "waste_manifests.sign_facility",
                        WASTE_MANIFESTS_DISCREPANCY_QTY, WASTE_MANIFESTS_DISCREPANCY_TYPE,
                        PARTIAL_REJECTION, FULL_REJECTION,
                        "waste_manifests.facility_contact_notes",
                        "waste_manifests.exception_notes", "waste_manifests.ship_month",
                        "waste_manifests.ship_day", "waste_manifests.ship_year",
                        "waste_manifests.trans1_month", "waste_manifests.trans1_day",
                        "waste_manifests.trans1_year", "waste_manifests.trans2_month",
                        "waste_manifests.trans2_day", "waste_manifests.trans2_year",
                        "waste_manifests.fac_month", "waste_manifests.fac_day",
                        "waste_manifests.fac_year", "waste_manifests.leave_date_month",
                        "waste_manifests.leave_date_day", "waste_manifests.leave_date_year",
                        "waste_manifests.alt_ship_month", "waste_manifests.alt_ship_day",
                        "waste_manifests.alt_ship_year" };
        final String[] pdfName =
                { "teams_manifest_no", "teams_handling", "teams_signature", "teams_port",
                        "teams_trans1_sign", "teams_trans2_sign", "teams_manifest_ref",
                        WasteManifestPdfConstant.TEAMS_DIS_RESIDUE, TEAMS_ALT_SIGN, TEAMS_FAC_SIGN,
                        WasteManifestPdfConstant.TEAMS_DIS_QTY,
                        WasteManifestPdfConstant.TEAMS_DIS_TYPE,
                        WasteManifestPdfConstant.TEAMS_DIS_PART,
                        WasteManifestPdfConstant.TEAMS_DIS_FULL, TEAMS_CONTACTNOTES,
                        "teams_excnotes", "ship_month", "ship_day", "ship_year", "trans1_month",
                        "trans1_day", "trans1_year", "trans2_month", "trans2_day", "trans2_year",
                        "fac_month", "fac_day", "fac_year", "leave_date_month", "leave_date_day",
                        "leave_date_year", "alt_ship_month", "alt_ship_day", "alt_ship_year" };
        pdf.setBlank(WasteUtility.checkBlank(manifestRecord, fieldName, pdf.isBlank()));
        // set value to pdf
        try {
            for (int i = 0; i < pdfName.length; i++) {
                form.setField(pdfName[i],
                    WasteUtility.isNull(String.valueOf(manifestRecord.getValue(fieldName[i]))));
            }
            final DataSource vnDs =
                    DataSourceFactory.createDataSourceForFields("vn", new String[] { "vn_id",
                            "insurance_cert1", COMPANY });
            // fill vn info
            final String vnId = manifestRecord.getString("waste_manifests.transporter_id");
            final String vnId2 = manifestRecord.getString("waste_manifests.transporter_id_2");
            if (StringUtil.notNullOrEmpty(vnId)) {
                final DataRecord vnRecord =
                        vnDs.getRecord(VN_VN_ID + vnId + WasteManifestPdfConstant.STRING_1);
                form.setField("teams_trans_no", WasteUtility.isNull(vnRecord.getString(EPAID)));
                form.setField("teams_trans_name",
                    WasteUtility.isNull(vnRecord.getString(VN_COMPANY)));
            }
            if (StringUtil.notNullOrEmpty(vnId2)) {
                final DataRecord vnRecord2 =
                        vnDs.getRecord(VN_VN_ID + vnId2 + WasteManifestPdfConstant.STRING_1);
                form.setField("teams_trans_no2", WasteUtility.isNull(vnRecord2.getString(EPAID)));
                form.setField("teams_trans_name2",
                    WasteUtility.isNull(vnRecord2.getString(VN_COMPANY)));
            }
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * fill CheckBox field.
     * 
     * @param manifestRecord DataRecord
     * @param form manifestRecord
     * @param page int
     */
    private static void fillCheckBoxField(final DataRecord manifestRecord, final Form form,
            final int page) {
        
        final String international =
                manifestRecord.getString("waste_manifests.international_shipments");
        
        try {
            if (BOXI.equals(international)) {
                form.setField("txtImport", BOXI);
            }
            if (BOXE.equals(international)) {
                form.setField("txtExport", BOXE);
            }
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        
        setCheckBoxFields(new String[] { FULL_REJECTION, PARTIAL_REJECTION,
                WASTE_MANIFESTS_DISCREPANCY_TYPE, WASTE_MANIFESTS_DISCREPANCY_QTY,
                WASTE_MANIFESTS_DISCREPANCY_RESIDUE }, new String[] {
                WasteManifestPdfConstant.TEAMS_DIS_FULL, WasteManifestPdfConstant.TEAMS_DIS_PART,
                WasteManifestPdfConstant.TEAMS_DIS_TYPE, WasteManifestPdfConstant.TEAMS_DIS_QTY,
                WasteManifestPdfConstant.TEAMS_DIS_RESIDUE }, form, manifestRecord);
        
        for (int num = 2; num <= page; num++) {
            
            setCheckBoxFields(new String[] { FULL_REJECTION, PARTIAL_REJECTION,
                    WASTE_MANIFESTS_DISCREPANCY_TYPE, WASTE_MANIFESTS_DISCREPANCY_QTY,
                    WASTE_MANIFESTS_DISCREPANCY_RESIDUE },
                new String[] {
                        WasteManifestPdfConstant.TEAMS_DIS_FULL + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_PART + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_TYPE + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_QTY + WasteManifestPdfConstant.P2_STR
                                + num,
                        WasteManifestPdfConstant.TEAMS_DIS_RESIDUE
                                + WasteManifestPdfConstant.P2_STR + num }, form, manifestRecord);
        }
    }
    
    /**
     * Set check box field in form by value of source field.
     * 
     * 
     * @param srcFields String[] source field array
     * @param form Form PDF form
     * @param checkFields String[] check box fields array
     * @param manifestRecord DataRecord manifest record
     */
    private static void setCheckBoxFields(final String[] srcFields, final String[] checkFields,
            final Form form, final DataRecord manifestRecord) {
        try {
            for (int i = 0; i < srcFields.length; i++) {
                if (1 == manifestRecord.getInt(srcFields[i])) {
                    form.setField(checkFields[i], BOXY);
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

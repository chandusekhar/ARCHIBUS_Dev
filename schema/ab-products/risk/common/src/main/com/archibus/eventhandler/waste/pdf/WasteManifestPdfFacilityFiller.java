package com.archibus.eventhandler.waste.pdf;

import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.waste.WasteUtility;
import com.archibus.utility.StringUtil;
import com.aspose.pdf.kit.Form;

/**
 * Waste Management Manifest PDF form filler - Facility.
 * 
 * 
 * @author ASC-BJ
 *         <p>
 *         Suppress PMD.TooManyMethods warning.
 *         <p>
 */
public final class WasteManifestPdfFacilityFiller {
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_FACILITY_NUMBER =
            "waste_facilities.facility_number";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ZIP = "waste_facilities.zip";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_STATE_ID = "waste_facilities.state_id";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_CITY_ID = "waste_facilities.city_id";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_FACILITY_ID = "waste_facilities.facility_id='";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ADDRESS2 = "waste_facilities.address2";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_FACILITIES_ADDRESS1 = "waste_facilities.address1";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String VN_COMPANY = "vn.company";
    
    /**
     * Indicates the field name.
     * 
     */
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfFacilityFiller() {
        
    }
    
    /**
     * fill facInfo.
     * 
     * @param pdf WasteManifestPdf object
     * @param manifestRecord DataRecord
     * @param form Form
     */
    public static void fillFacilityInfo(final WasteManifestPdf pdf,
            final DataRecord manifestRecord, final Form form) {
        // get fac value from record
        final String fac = manifestRecord.getString("waste_manifests.facility_id");
        final String fac2 = manifestRecord.getString("waste_manifests.facility_id_alt");
        final String[] fieldName =
                { VN_COMPANY, WASTE_FACILITIES_ADDRESS1, WASTE_FACILITIES_ADDRESS2,
                        WASTE_FACILITIES_CITY_ID, WASTE_FACILITIES_STATE_ID, WASTE_FACILITIES_ZIP,
                        WASTE_FACILITIES_FACILITY_NUMBER, "waste_facilities.phone",
                        "waste_facilities.ctry_id" };
        final String[] pdfName =
                { "company", "address1", "address2", "city_id", "state_id", "zip", "teams_fac_no",
                        "phone", "country" };
        final String[] pdfName2 =
                { "company_fac2", "address1_fac2", "address2_fac2", "city_id_fac2",
                        "state_id_fac2", "zip_fac2", "teams_fac_no2", "phone_fac2", "country_fac2" };
        try {
            if (StringUtil.notNullOrEmpty(fac)) {
                // get fac record info and set to pdf
                final DataRecord facRecord1 =
                        pdf.getFacDs().getRecord(
                            WASTE_FACILITIES_FACILITY_ID + fac + WasteManifestPdfConstant.STRING_1);
                pdf.setBlank(WasteUtility.checkBlank(facRecord1, fieldName, pdf.isBlank()));
                for (int i = 0; i < fieldName.length; i++) {
                    form.setField(pdfName[i], facRecord1.getString(fieldName[i]));
                }
            }
            if (StringUtil.notNullOrEmpty(fac2)) {
                // get second fac record info and set to pdf
                final DataRecord facRecord2 =
                        pdf.getFacDs()
                            .getRecord(
                                WASTE_FACILITIES_FACILITY_ID + fac2
                                        + WasteManifestPdfConstant.STRING_1);
                pdf.setBlank(WasteUtility.checkBlank(facRecord2, fieldName, pdf.isBlank()));
                for (int i = 0; i < fieldName.length; i++) {
                    form.setField(pdfName2[i], facRecord2.getString(fieldName[i]));
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

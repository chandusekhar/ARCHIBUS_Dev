package com.archibus.eventhandler.waste.pdf;

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
public final class WasteManifestPdfGeneratorFiller {
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CONTACT_ADDRESS2 = "contact.address2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CONTACT_ADDRESS1 = "contact.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String PROPERTY_ADDRESS2 = "property.address2";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String PROPERTY_ADDRESS1 = "property.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_ADDRESS2 = "bl.address2";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_ADDRESS1 = "bl.address1";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_GENERATORS_PR_ID = "waste_generators.pr_id";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String WASTE_GENERATORS_BL_ID = "waste_generators.bl_id";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String CEC_GEN_PHONE = "cec_gen_phone";
    
    /**
     * Indicates the field name.
     * 
     */
    private static final String WASTE_GENERATORS_CONTACT_ID = "waste_generators.contact_id";
    
    /**
     * Indicates the file name.
     * 
     */
    private static final String BL_CONTACT_PHONE = "bl.contact_phone";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfGeneratorFiller() {
        
    }
    
    /**
     * fill Generator.
     * 
     * 
     * @param pdf WasteManifestPdf object
     * @param form Form
     * @param gId String
     */
    public static void fillGenerator(final WasteManifestPdf pdf, final Form form, final String gId) {
        final DataRecord genRecord =
                pdf.getGenDs().getRecord(
                    "waste_generators.generator_id='" + gId + WasteManifestPdfConstant.STRING_1);
        final String[] fieldName =
                { "waste_generators.generator_id", "waste_generators.generator_name",
                        BL_CONTACT_PHONE, "contact.email" };
        final String[] pdfName =
                { "teams_generator_id", "teams_gen_name", "teams_gen_phone", "teams_mail_name" };
        // check have null or "" value
        pdf.setBlank(WasteUtility.checkBlank(genRecord, fieldName, pdf.isBlank()));
        try {
            // set value to pdf
            for (int i = 0; i < pdfName.length; i++) {
                form.setField(pdfName[i],
                    WasteUtility.isNull(String.valueOf(genRecord.getValue(fieldName[i]))));
            }
            form.setField("teams_emp_phone",
                WasteUtility.isNull(String.valueOf(genRecord.getValue(BL_CONTACT_PHONE))));
            fillGeneratorAddress(genRecord, form);
            final String contact = genRecord.getString(WASTE_GENERATORS_CONTACT_ID);
            if (null == contact) {
                form.setField(CEC_GEN_PHONE,
                    WasteUtility.isNull(String.valueOf(genRecord.getValue(BL_CONTACT_PHONE))));
                
            } else {
                form.setField(CEC_GEN_PHONE,
                    WasteUtility.isNull(String.valueOf(genRecord.getValue("contact.phone"))));
            }
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
    }
    
    /**
     * Fill generator Site address according to new logic.
     * 
     * @param genRecord DataRecord
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param prFieldName String[]
     * @param blFieldName String[]
     * 
     */
    public static void fillGeneratorSite(final DataRecord genRecord, final Form form,
            final String mailAddress1, final String mailAddress2, final String[] prFieldName,
            final String[] blFieldName) {
        final String[] siteAddress =
                { "teams_gen_address1", "teams_gen_address2", "teams_gen_city", "teams_gen_state",
                        "teams_gen_zip", "teams_gen_country" };
        final String blId = genRecord.getString(WASTE_GENERATORS_BL_ID);
        final String prId = genRecord.getString(WASTE_GENERATORS_PR_ID);
        if (StringUtil.notNullOrEmpty(blId)) {
            WasteManifestPdfAddressFiller.fillAddressByBuilding(genRecord, form, mailAddress1,
                mailAddress2, blFieldName, siteAddress);
            
        } else if (StringUtil.notNullOrEmpty(prId)) {
            // set value to pdf
            WasteManifestPdfAddressFiller.fillAddressByProperty(form, mailAddress1, mailAddress2,
                prFieldName, siteAddress, genRecord);
        }
        
    }
    
    /**
     * Fill generator Address Info.
     * 
     * 
     * @param genRecord DataRecord
     * @param form Form
     */
    public static void fillGeneratorAddress(final DataRecord genRecord, final Form form) {
        final String[] blFieldName =
                { BL_ADDRESS1, BL_ADDRESS2, "bl.city_id", "bl.state_id", "bl.zip", "bl.ctry_id" };
        final String[] prFieldName =
                { PROPERTY_ADDRESS1, PROPERTY_ADDRESS2, "property.city_id", "property.state_id",
                        "property.zip", "property.ctry_id" };
        final String[] contactFieldName =
                { CONTACT_ADDRESS1, CONTACT_ADDRESS2, "contact.city_id", "contact.state_id",
                        "contact.zip", "contact.ctry_id" };
        final String[] mailAddress =
                { "teams_mail_address1", "teams_mail_address2", "teams_mail_city",
                        "teams_mail_state", "teams_mail_zip", "teams_mail_country" };
        final String contact = genRecord.getString(WASTE_GENERATORS_CONTACT_ID);
        final String blId = genRecord.getString(WASTE_GENERATORS_BL_ID);
        final String prId = genRecord.getString(WASTE_GENERATORS_PR_ID);
        String mAddress1 = "";
        String mAddress2 = "";
        try {
            if (StringUtil.notNullOrEmpty(contact)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(CONTACT_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(CONTACT_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i], WasteUtility.isNull(String.valueOf(genRecord
                        .getValue(contactFieldName[i]))));
                }
            } else if (StringUtil.notNullOrEmpty(blId)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(BL_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(blFieldName[i]))));
                }
            } else if (StringUtil.notNullOrEmpty(prId)) {
                // set value to pdf
                mAddress1 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS1));
                mAddress2 = WasteUtility.isNull(genRecord.getString(PROPERTY_ADDRESS2));
                for (int i = 0; i < mailAddress.length; i++) {
                    form.setField(mailAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(prFieldName[i]))));
                }
            }
            
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            WasteUtility.wrapAndThrowException(originalException);
        }
        fillGeneratorSite(genRecord, form, mAddress1, mAddress2, prFieldName, blFieldName);
    }
    
}

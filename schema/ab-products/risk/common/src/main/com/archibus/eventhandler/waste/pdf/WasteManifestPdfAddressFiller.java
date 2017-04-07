package com.archibus.eventhandler.waste.pdf;

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
public final class WasteManifestPdfAddressFiller {
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteManifestPdfAddressFiller() {
        
    }
    
    /**
     * Fill generator Info of Property according to new logic.
     * 
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param prFieldName String[]
     * @param address String[]
     * @param genRecord DataRecord
     * 
     */
    public static void fillAddressByProperty(final Form form, final String mailAddress1,
            final String mailAddress2, final String[] prFieldName, final String[] address,
            final DataRecord genRecord) {
        String address1;
        String address2;
        address1 = WasteUtility.isNull(genRecord.getString("property.address1"));
        address2 = WasteUtility.isNull(genRecord.getString("property.address2"));
        if (!(address1.equals(mailAddress1) && address2.equals(mailAddress2))) {
            try {
                for (int i = 0; i < address.length; i++) {
                    form.setField(address[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(prFieldName[i]))));
                }
                // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
                // method throws a checked Exception, which needs to be wrapped in ExceptionBase
            } catch (final Exception originalException) {
                // CHECKSTYLE:ON
                WasteUtility.wrapAndThrowException(originalException);
            }
        }
    }
    
    /**
     * Fill address Building Info according.
     * 
     * 
     * @param genRecord DataRecord
     * @param form Form
     * @param mailAddress1 String
     * @param mailAddress2 String
     * @param siteAddress String[]
     * @param blFieldName String[]
     * 
     */
    public static void fillAddressByBuilding(final DataRecord genRecord, final Form form,
            final String mailAddress1, final String mailAddress2, final String[] blFieldName,
            final String[] siteAddress) {
        String address1;
        String address2;
        // set value to pdf
        address1 = WasteUtility.isNull(genRecord.getString("bl.address1"));
        address2 = WasteUtility.isNull(genRecord.getString("bl.address2"));
        if (!(address1.equals(mailAddress1) && address2.equals(mailAddress2))) {
            try {
                for (int i = 0; i < siteAddress.length; i++) {
                    form.setField(siteAddress[i],
                        WasteUtility.isNull(String.valueOf(genRecord.getValue(blFieldName[i]))));
                }
                // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
                // method throws a checked Exception, which needs to be wrapped in ExceptionBase
            } catch (final Exception originalException) {
                // CHECKSTYLE:ON
                WasteUtility.wrapAndThrowException(originalException);
            }
        }
    }
}

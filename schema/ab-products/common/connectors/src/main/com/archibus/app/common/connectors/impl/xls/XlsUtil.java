package com.archibus.app.common.connectors.impl.xls;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.ext.report.xls.XlsBuilder;

/**
 * Utility class. Provides methods for working with Excel files.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class XlsUtil {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private XlsUtil() {
        
    }

    /**
     * Return the Excel file type from the file name.
     *
     * @param fileName the name of the file.
     * @return the Excel file type.
     * @throws ConfigurationException if the extension is missing or unrecognized.
     */
    public static XlsBuilder.FileFormatType getFileType(final String fileName)
            throws ConfigurationException {
        final int extensionIndex = fileName.lastIndexOf('.');
        if (extensionIndex < 0) {
            throw new ConfigurationException("Extension expected for Excel file name", null);
        }
        final String extension = fileName.substring(extensionIndex + 1).toUpperCase();
        try {
            return XlsBuilder.FileFormatType.valueOf(extension);
        } catch (final IllegalArgumentException e) {
            throw new ConfigurationException("Invalid file name extension for Excel: " + extension,
                e);
        }
    }
}

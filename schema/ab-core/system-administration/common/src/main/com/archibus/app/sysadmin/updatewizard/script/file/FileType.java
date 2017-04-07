package com.archibus.app.sysadmin.updatewizard.script.file;

/**
 *
 * Defines the supported file types.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class FileType {

    /**
     * File extensions supported.
     */
    public enum ExtensionType {
        /**
         * CSV file type.
         */
        CSV(1),
        /**
         * XLS file type.
         */
        XLS(2),
        /**
         * XLSX file type.
         */
        XLSX(3),
        /**
         * SQL file type.
         */
        SQL(4),
        /**
         * DUW file type.
         */
        DUW(5),
        /**
         * TXT file type.
         */
        TXT(6);
        /**
         * The code for ExtensionType.
         */
        private final int code;

        /**
         * @param code a database code for a Extension Type.
         */
        private ExtensionType(final int code) {
            this.code = code;
        }

        /**
         * @param code the code for a ExtentionType.
         * @return the ExtentionType for the given code.
         */
        public static ExtensionType valueOf(final Integer code) {
            ExtensionType type = null;
            if (code != null) {
                for (final ExtensionType extensionType : ExtensionType.values()) {
                    if (extensionType.code == code.intValue()) {
                        type = extensionType;
                    }
                }
            }
            return type;
        }

        /**
         * @return the code for the extension type.
         */
        public int getCode() {
            return this.code;
        }
    }
}

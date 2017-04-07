package com.archibus.app.common.connectors.service;

/**
 * The type of data exchanged.
 *
 * @author cole
 * @since 22.1
 *
 */
public enum DataType {
    /**
     * Delimited or fixed width (or a mix thereof). This includes CSV.
     */
    TEXT("Text"),
    /**
     * Excel Spreadsheet(s).
     */
    EXCEL("Excel"),
    /**
     * eXtensible Markup Language.
     */
    XML("XML"),
    /**
     * JavaScript Object Notation.
     */
    JSON("JSON"),
    /**
     * EDI file.
     */
    EDI("EDI"),
    /**
     * Records from a relational data base.
     */
    DATA_RECORD("Data Record"),
    /**
     * Results from an LDAP search.
     */
    SEARCH_RESULTS("Search Result");
    
    /**
     * A short descriptive name for this type of data.
     */
    private final String name;
    
    /**
     * @param name a short descriptive name for this type of data.
     */
    private DataType(final String name) {
        this.name = name;
    }
    
    /**
     * @return a short descriptive name for this type of data.
     */
    public String getName() {
        return this.name;
    }
}

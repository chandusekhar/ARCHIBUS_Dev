package com.archibus.app.common.connectors.translation.xls.inbound;

/**
 *
 * Excel Sheet request.
 * <p>
 *
 * @author Catalin Purice
 * @since 21.3
 *
 */
public class XlsSheetRequest {

    /**
     * The sheet's name.
     */
    private final String name;

    /**
     * The first column of the sheet to read.
     */
    private final int startColumn;

    /**
     * The first row of the sheet to read.
     */
    private final int startRow;

    /**
     * Constructor.
     *
     * @param name the sheet's name.
     * @param startColumn the first column of the sheet to read.
     * @param startRow the first row of the sheet to read.
     */
    public XlsSheetRequest(final String name, final int startColumn, final int startRow) {
        super();
        this.name = name;
        this.startColumn = startColumn;
        this.startRow = startRow;
    }

    /**
     * @return the sheet's name.
     */
    public String getName() {
        return this.name;
    }

    /**
     * @return the first column of the sheet to read.
     */
    public int getStartColumn() {
        return this.startColumn;
    }

    /**
     * @return the first row of the sheet to read.
     */
    public int getStartRow() {
        return this.startRow;
    }

}

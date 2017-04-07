package com.archibus.app.common.finanal.domain;

import java.text.MessageFormat;
import java.util.*;

import com.archibus.app.common.finanal.impl.Constants;
import com.archibus.app.common.metrics.domain.MetricDecimals;
import com.archibus.model.config.Currency;
import com.ibm.icu.text.NumberFormat;

/**
 * Domain object for financial matrix. Provide methods to calculate and format matrix values.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialMatrix {

    /**
     * Constant.
     */
    private static final String POSITIVE_VALUE = "{0} {1}";

    /**
     * Constant.
     */
    private static final String NEGATIVE_VALUE = "({0} {1})";

    /**
     * Box id.
     */
    private String boxId;

    /**
     * Last calculation date.
     */
    private Date dateLastCalc;

    /**
     * Value.
     */
    private double value;

    /**
     * Market value.
     */
    private double valueMarket;

    /**
     * Value formula.
     */
    private String valueCalc;

    /**
     * Value market formula.
     */
    private String valueCalcMarket;

    /**
     * Display decimals.
     */
    private String valueDisplayDecimals;

    /**
     * Formatted value.
     */
    private String valueFormatted;

    /**
     * Formatted value market.
     */
    private String valueMarketFormatted;

    /**
     * Getter for the boxId property.
     *
     * @see boxId
     * @return the boxId property.
     */
    public String getBoxId() {
        return this.boxId;
    }

    /**
     * Setter for the boxId property.
     *
     * @see boxId
     * @param boxId the boxId to set
     */

    public void setBoxId(final String boxId) {
        this.boxId = boxId;
    }

    /**
     * Getter for the dateLastCalc property.
     *
     * @see dateLastCalc
     * @return the dateLastCalc property.
     */
    public Date getDateLastCalc() {
        return this.dateLastCalc;
    }

    /**
     * Setter for the dateLastCalc property.
     *
     * @see dateLastCalc
     * @param dateLastCalc the dateLastCalc to set
     */

    public void setDateLastCalc(final Date dateLastCalc) {
        this.dateLastCalc = dateLastCalc;
    }

    /**
     * Getter for the value property.
     *
     * @see value
     * @return the value property.
     */
    public double getValue() {
        return this.value;
    }

    /**
     * Setter for the value property.
     *
     * @see value
     * @param value the value to set
     */

    public void setValue(final double value) {
        this.value = value;
    }

    /**
     * Getter for the valueMarket property.
     *
     * @see valueMarket
     * @return the valueMarket property.
     */
    public double getValueMarket() {
        return this.valueMarket;
    }

    /**
     * Setter for the valueMarket property.
     *
     * @see valueMarket
     * @param valueMarket the valueMarket to set
     */

    public void setValueMarket(final double valueMarket) {
        this.valueMarket = valueMarket;
    }

    /**
     * Getter for the valueCalc property.
     *
     * @see valueCalc
     * @return the valueCalc property.
     */
    public String getValueCalc() {
        return this.valueCalc;
    }

    /**
     * Setter for the valueCalc property.
     *
     * @see valueCalc
     * @param valueCalc the valueCalc to set
     */

    public void setValueCalc(final String valueCalc) {
        this.valueCalc = valueCalc;
    }

    /**
     * Getter for the valueCalcMarket property.
     *
     * @see valueCalcMarket
     * @return the valueCalcMarket property.
     */
    public String getValueCalcMarket() {
        return this.valueCalcMarket;
    }

    /**
     * Setter for the valueCalcMarket property.
     *
     * @see valueCalcMarket
     * @param valueCalcMarket the valueCalcMarket to set
     */

    public void setValueCalcMarket(final String valueCalcMarket) {
        this.valueCalcMarket = valueCalcMarket;
    }

    /**
     * Getter for the valueDisplayDecimals property.
     *
     * @see valueDisplayDecimals
     * @return the valueDisplayDecimals property.
     */
    public String getValueDisplayDecimals() {
        return this.valueDisplayDecimals;
    }

    /**
     * Setter for the valueDisplayDecimals property.
     *
     * @see valueDisplayDecimals
     * @param valueDisplayDecimals the valueDisplayDecimals to set
     */

    public void setValueDisplayDecimals(final String valueDisplayDecimals) {
        this.valueDisplayDecimals = valueDisplayDecimals;
    }

    /**
     * Getter for the valueFormatted property.
     *
     * @see valueFormatted
     * @return the valueFormatted property.
     */
    public String getValueFormatted() {
        return this.valueFormatted;
    }

    /**
     * Setter for the valueFormatted property.
     *
     * @see valueFormatted
     * @param valueFormatted the valueFormatted to set
     */

    public void setValueFormatted(final String valueFormatted) {
        this.valueFormatted = valueFormatted;
    }

    /**
     * Getter for the valueMarketFormatted property.
     *
     * @see valueMarketFormatted
     * @return the valueMarketFormatted property.
     */
    public String getValueMarketFormatted() {
        return this.valueMarketFormatted;
    }

    /**
     * Setter for the valueMarketFormatted property.
     *
     * @see valueMarketFormatted
     * @param valueMarketFormatted the valueMarketFormatted to set
     */

    public void setValueMarketFormatted(final String valueMarketFormatted) {
        this.valueMarketFormatted = valueMarketFormatted;
    }

    /**
     * Format calculated values.
     *
     * @param locale locale used to format values
     * @param currency display currency
     */
    public void formatCalculatedValues(final Locale locale, final Currency currency) {
        // format value
        final String formattedMoneyValue = formatDecimals(this.value, locale);
        final String currencySymbol = currency.getSymbol();
        if (this.value >= 0) {
            this.valueFormatted =
                    MessageFormat.format(POSITIVE_VALUE, currencySymbol, formattedMoneyValue);
        } else {
            this.valueFormatted = MessageFormat.format(NEGATIVE_VALUE, currencySymbol,
                formattedMoneyValue.substring(1));
        }

        // format value market
        final String formattedMoneyValueMarket = formatDecimals(this.valueMarket, locale);
        if (this.valueMarket >= 0) {
            this.valueMarketFormatted =
                    MessageFormat.format(POSITIVE_VALUE, currencySymbol, formattedMoneyValueMarket);
        } else {
            this.valueMarketFormatted = MessageFormat.format(NEGATIVE_VALUE, currencySymbol,
                formattedMoneyValueMarket.substring(1));
        }

    }

    /**
     * Converts numeric value to a formatted string using decimals.
     *
     * @param numericValue The value.
     * @param locale locale used to format values.
     * @return The formatted value.
     */
    public String formatDecimals(final double numericValue, final Locale locale) {
        String result = "";

        // The number of decimals.
        int decimals = 0;
        // The factor to divide the value by.
        int factor = 1;
        // The numeric symbol, e.g. K for thousands.
        String symbol = "";
        final MetricDecimals metricDecimals = MetricDecimals.fromString(this.valueDisplayDecimals);

        if (metricDecimals == MetricDecimals.ONE_PLACE) {
            decimals = 1;

        } else if (metricDecimals == MetricDecimals.TWO_PLACES) {
            decimals = 2;

        } else if (metricDecimals == MetricDecimals.HUNDREDS) {
            factor = Constants.FACTOR_100;
            symbol = "H";

        } else if (metricDecimals == MetricDecimals.THOUSANDS) {
            factor = Constants.FACTOR_1000;
            symbol = "K";

        } else if (metricDecimals == MetricDecimals.MILLIONS) {
            factor = Constants.FACTOR_1000000;
            symbol = "M";

        } else if (metricDecimals == MetricDecimals.BILLIONS) {
            factor = Constants.FACTOR_1000000000;
            symbol = "G";
        }

        final NumberFormat format = NumberFormat.getInstance(locale);
        format.setMaximumFractionDigits(decimals);
        format.setMinimumFractionDigits(decimals);
        result = format.format(numericValue / factor) + " " + symbol;

        return result;
    }

}

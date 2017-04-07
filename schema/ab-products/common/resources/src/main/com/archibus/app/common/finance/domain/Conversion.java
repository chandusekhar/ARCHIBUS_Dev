package com.archibus.app.common.finance.domain;

import java.util.Date;

/**
 * Domain object for afm_conversions table.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */

public class Conversion {
    /**
     * Class name.
     */
    static final String CLASS_NAME = "Conversion";
    
    /**
     * Field: source unit.
     */
    private String sourceUnits;
    
    /**
     * Field: destination unit.
     */
    private String destinUnits;
    
    /**
     * Field: is currency (if is exchange rate).
     */
    private String isCurrency;
    
    /**
     * Field: exchange rate type (budget or payment).
     */
    private String exchangeRateType;
    
    /**
     * Field: conversion date.
     */
    private Date dateConversion;
    
    /**
     * Field: conversion factor.
     */
    private double factor;
    
    /**
     * Getter for the sourceUnits property.
     * 
     * @see sourceUnits
     * @return the sourceUnits property.
     */
    public String getSourceUnits() {
        return this.sourceUnits;
    }
    
    /**
     * Setter for the sourceUnits property.
     * 
     * @see sourceUnits
     * @param sourceUnits the sourceUnits to set
     */
    
    public void setSourceUnits(final String sourceUnits) {
        this.sourceUnits = sourceUnits;
    }
    
    /**
     * Getter for the destinUnits property.
     * 
     * @see destinUnits
     * @return the destinUnits property.
     */
    public String getDestinUnits() {
        return this.destinUnits;
    }
    
    /**
     * Setter for the destinUnits property.
     * 
     * @see destinUnits
     * @param destinUnits the destinUnits to set
     */
    
    public void setDestinUnits(final String destinUnits) {
        this.destinUnits = destinUnits;
    }
    
    /**
     * Getter for the isCurrency property.
     * 
     * @see isCurrency
     * @return the isCurrency property.
     */
    public String getIsCurrency() {
        return this.isCurrency;
    }
    
    /**
     * Setter for the isCurrency property.
     * 
     * @see isCurrency
     * @param isCurrency the isCurrency to set
     */
    
    public void setIsCurrency(final String isCurrency) {
        this.isCurrency = isCurrency;
    }
    
    /**
     * Getter for the exchangeRateType property.
     * 
     * @see exchangeRateType
     * @return the exchangeRateType property.
     */
    public String getExchangeRateType() {
        return this.exchangeRateType;
    }
    
    /**
     * Setter for the exchangeRateType property.
     * 
     * @see exchangeRateType
     * @param exchangeRateType the exchangeRateType to set
     */
    
    public void setExchangeRateType(final String exchangeRateType) {
        this.exchangeRateType = exchangeRateType;
    }
    
    /**
     * Getter for the dateConversion property.
     * 
     * @see dateConversion
     * @return the dateConversion property.
     */
    public Date getDateConversion() {
        return this.dateConversion;
    }
    
    /**
     * Setter for the dateConversion property.
     * 
     * @see dateConversion
     * @param dateConversion the dateConversion to set
     */
    
    public void setDateConversion(final Date dateConversion) {
        this.dateConversion = dateConversion;
    }
    
    /**
     * Getter for the factor property.
     * 
     * @see factor
     * @return the factor property.
     */
    public double getFactor() {
        return this.factor;
    }
    
    /**
     * Setter for the factor property.
     * 
     * @see factor
     * @param factor the factor to set
     */
    
    public void setFactor(final double factor) {
        this.factor = factor;
    }
    
    /**
     * Getter for the className property.
     * 
     * @see className
     * @return the className property.
     */
    public static String getClassName() {
        return CLASS_NAME;
    }
    
}

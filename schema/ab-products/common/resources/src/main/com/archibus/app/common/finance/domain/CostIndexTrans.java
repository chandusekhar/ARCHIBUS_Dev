package com.archibus.app.common.finance.domain;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 
 * Represents Cost index transaction - domain object.
 * <p>
 * Mapped to cost_index_trans
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 * 
 */
public class CostIndexTrans extends CostIndex {
    /**
     * Class name constant.
     */
    static final String CLASS_COST_INDEX_TRANS = "CostIndexTrans";
    
    /**
     * Field.
     */
    private Date dateIndex;
    
    /**
     * Field.
     */
    private Date dateIndexLast;
    
    /**
     * Field.
     */
    private Date dateIndexValueNew;
    
    /**
     * Field.
     */
    private double indexPctChange;
    
    /**
     * Field.
     */
    private double indexValueNew;
    
    /**
     * Field.
     */
    private double rentIndexed;
    
    /**
     * Field.
     */
    private double rentNew;
    
    /**
     * Field.
     */
    private double rentPctChangeAct;
    
    /**
     * Field.
     */
    private double rentPctChangeCalc;
    
    /**
     * Field.
     */
    private int costTranRecurId;
    
    /**
     * Getter for the dateIndex property.
     * 
     * @see dateIndex
     * @return the dateIndex property.
     */
    public Date getDateIndex() {
        return this.dateIndex;
    }
    
    /**
     * Setter for the dateIndex property.
     * 
     * @see dateIndex
     * @param dateIndex the dateIndex to set
     */
    
    public void setDateIndex(final Date dateIndex) {
        this.dateIndex = dateIndex;
    }
    
    /**
     * Getter for the dateIndexLast property.
     * 
     * @see dateIndexLast
     * @return the dateIndexLast property.
     */
    public Date getDateIndexLast() {
        return this.dateIndexLast;
    }
    
    /**
     * Setter for the dateIndexLast property.
     * 
     * @see dateIndexLast
     * @param dateIndexLast the dateIndexLast to set
     */
    
    public void setDateIndexLast(final Date dateIndexLast) {
        this.dateIndexLast = dateIndexLast;
    }
    
    /**
     * Getter for the dateIndexValueNew property.
     * 
     * @see dateIndexValueNew
     * @return the dateIndexValueNew property.
     */
    public Date getDateIndexValueNew() {
        return this.dateIndexValueNew;
    }
    
    /**
     * Setter for the dateIndexValueNew property.
     * 
     * @see dateIndexValueNew
     * @param dateIndexValueNew the dateIndexValueNew to set
     */
    
    public void setDateIndexValueNew(final Date dateIndexValueNew) {
        this.dateIndexValueNew = dateIndexValueNew;
    }
    
    /**
     * Getter for the indexPctChange property.
     * 
     * @see indexPctChange
     * @return the indexPctChange property.
     */
    public double getIndexPctChange() {
        return this.indexPctChange;
    }
    
    /**
     * Setter for the indexPctChange property.
     * 
     * @see indexPctChange
     * @param indexPctChange the indexPctChange to set
     */
    
    public void setIndexPctChange(final double indexPctChange) {
        this.indexPctChange = indexPctChange;
    }
    
    /**
     * Getter for the indexValueNew property.
     * 
     * @see indexValueNew
     * @return the indexValueNew property.
     */
    public double getIndexValueNew() {
        return this.indexValueNew;
    }
    
    /**
     * Setter for the indexValueNew property.
     * 
     * @see indexValueNew
     * @param indexValueNew the indexValueNew to set
     */
    
    public void setIndexValueNew(final double indexValueNew) {
        this.indexValueNew = indexValueNew;
    }
    
    /**
     * Getter for the rentIndexed property.
     * 
     * @see rentIndexed
     * @return the rentIndexed property.
     */
    public double getRentIndexed() {
        return this.rentIndexed;
    }
    
    /**
     * Setter for the rentIndexed property.
     * 
     * @see rentIndexed
     * @param rentIndexed the rentIndexed to set
     */
    
    public void setRentIndexed(final double rentIndexed) {
        this.rentIndexed = rentIndexed;
    }
    
    /**
     * Getter for the rentNew property.
     * 
     * @see rentNew
     * @return the rentNew property.
     */
    public double getRentNew() {
        return this.rentNew;
    }
    
    /**
     * Setter for the rentNew property.
     * 
     * @see rentNew
     * @param rentNew the rentNew to set
     */
    
    public void setRentNew(final double rentNew) {
        this.rentNew = rentNew;
    }
    
    /**
     * Getter for the rentPctChangeAct property.
     * 
     * @see rentPctChangeAct
     * @return the rentPctChangeAct property.
     */
    public double getRentPctChangeAct() {
        return this.rentPctChangeAct;
    }
    
    /**
     * Setter for the rentPctChangeAct property.
     * 
     * @see rentPctChangeAct
     * @param rentPctChangeAct the rentPctChangeAct to set
     */
    
    public void setRentPctChangeAct(final double rentPctChangeAct) {
        this.rentPctChangeAct = rentPctChangeAct;
    }
    
    /**
     * Getter for the rentPctChangeCalc property.
     * 
     * @see rentPctChangeCalc
     * @return the rentPctChangeCalc property.
     */
    public double getRentPctChangeCalc() {
        return this.rentPctChangeCalc;
    }
    
    /**
     * Setter for the rentPctChangeCalc property.
     * 
     * @see rentPctChangeCalc
     * @param rentPctChangeCalc the rentPctChangeCalc to set
     */
    
    public void setRentPctChangeCalc(final double rentPctChangeCalc) {
        this.rentPctChangeCalc = rentPctChangeCalc;
    }
    
    /**
     * Getter for the costTranRecurId property.
     * 
     * @see costTranRecurId
     * @return the costTranRecurId property.
     */
    public int getCostTranRecurId() {
        return this.costTranRecurId;
    }
    
    /**
     * Setter for the costTranRecurId property.
     * 
     * @see costTranRecurId
     * @param costTranRecurId the costTranRecurId to set
     */
    
    public void setCostTranRecurId(final int costTranRecurId) {
        this.costTranRecurId = costTranRecurId;
    }
    
    /**
     * Returns a new cost index transaction for index profile.
     * 
     * @param costIndexProfile cost index profile
     * @return cost index transaction object
     */
    public static CostIndexTrans createFromProfile(final CostIndexProfile costIndexProfile) {
        final CostIndexTrans costIndexTrans = new CostIndexTrans();
        
        costIndexTrans.setLsId(costIndexProfile.getLsId());
        costIndexTrans.setCostIndexId(costIndexProfile.getCostIndexId());
        costIndexTrans.setDateIndexNext(costIndexProfile.getDateIndexNext());
        costIndexTrans.setIndexValueInitial(costIndexProfile.getIndexValueInitial());
        costIndexTrans.setIndexingFrequency(costIndexProfile.getIndexingFrequency());
        costIndexTrans.setPctChangeAdjust(costIndexProfile.getPctChangeAdjust());
        costIndexTrans.setRentRoundTo(costIndexProfile.getRentRoundTo());
        costIndexTrans.setResetInitialValues(costIndexProfile.getResetInitialValues());
        costIndexTrans.setRentInitial(costIndexProfile.getRentInitial());
        
        return costIndexTrans;
    }
    
    /**
     * Calculate index percentage change.
     * 
     */
    public void calculateIndexPercentageChange() {
        final double indexValueInitial = getIndexValueInitial();
        if (indexValueInitial != 0) {
            this.indexPctChange =
                    (this.indexValueNew / indexValueInitial - 1) * Constants.ONE_HUNDRED;
        }
    }
    
    /**
     * Calculate new rent value and rent percentage changes.
     * 
     * @param rentMaxLimit rent max limit
     * @param rentMinLimit rent min limit
     * @return new rent value;
     */
    public double calculateRentNew(final double rentMaxLimit, final double rentMinLimit) {
        // calculated rent percentage change
        final double indexPctChangeAdjustment = getPctChangeAdjust();
        this.rentPctChangeCalc =
                this.indexPctChange * indexPctChangeAdjustment / Constants.ONE_HUNDRED;
        // indexed rent
        final double rentInitial = getRentInitial();
        this.rentIndexed =
                rentInitial * (Constants.ONE_HUNDRED + this.rentPctChangeCalc)
                        / Constants.ONE_HUNDRED;
        
        if (rentMaxLimit != 0 && this.rentIndexed > rentMaxLimit) {
            this.rentNew = round(rentMaxLimit, getRentRoundTo(), BigDecimal.ROUND_HALF_UP);
        } else if (rentMinLimit != 0 && this.rentIndexed < rentMinLimit) {
            this.rentNew = round(rentMinLimit, getRentRoundTo(), BigDecimal.ROUND_HALF_UP);
        } else {
            this.rentNew = round(this.rentIndexed, getRentRoundTo(), BigDecimal.ROUND_HALF_UP);
        }
        // actual rent percentage change
        this.rentPctChangeAct = (this.rentNew / rentInitial - 1) * Constants.ONE_HUNDRED;
        return this.rentNew;
    }
    
    /**
     * Round number to specified number of decimals. Use BigDecimal scale method
     * 
     * @param value number
     * @param scale decimals number
     * @param roundingMode rounding method (BigDecimal)
     * @return rounded number
     */
    private double round(final double value, final int scale, final int roundingMode) {
        BigDecimal formmater = new BigDecimal(value);
        formmater = formmater.setScale(scale, roundingMode);
        return formmater.doubleValue();
    }
}

package com.archibus.app.common.finance.domain;

import java.math.BigDecimal;
import java.util.Date;

import com.archibus.service.cost.*;
import com.archibus.utility.ExceptionBase;

/**
 * Domain object for ScheduledCost.
 * <p>
 * Mapped to cost_tran_sched table.
 *
 * @author Ioan Draghici
 *
 *         <p>
 *         Suppress FindBugs warning "EQ_DOESNT_OVERRIDE_EQUALS" in this class.
 *         <p>
 *         Justification: The Cost.equals() method is appropiate for the ScheduledCost subclass. See
 *         Joshua Block, Effective Java, 2nd edition, page 34.
 */
@edu.umd.cs.findbugs.annotations.SuppressWarnings("EQ_DOESNT_OVERRIDE_EQUALS")
public class ScheduledCost extends Cost {
    
    /**
     * Class name constant.
     */
    static final String CLASS_SCHEDULED_COST = "ScheduledCost";
    
    /**
     * Date assessed.
     */
    private Date dateAssessed;
    
    /**
     * Date due.
     */
    private Date dateDue;
    
    /**
     * Date paid.
     */
    private Date datePaid;
    
    /**
     * Recurring cost code.
     */
    private int recurCostId;
    
    /**
     * Cost status.
     */
    private String status;
    
    /**
     * Field.
     */
    private double amountTaxLate1;

    /**
     * Field.
     */
    private double amountTaxLate2;

    /**
     * Field.
     */
    private double amountTaxLate3;

    /**
     * Field.
     */
    private Date dateTaxLate1;

    /**
     * Field.
     */
    private Date dateTaxLate2;

    /**
     * Field.
     */
    private Date dateTaxLate3;
    
    /**
     * Copies properties from.
     *
     * @param recurringCost recurring cost code
     * @return scheduled cost
     */
    public static ScheduledCost createFromRecurringCost(final RecurringCost recurringCost) {
        final ScheduledCost scheduledCost = new ScheduledCost();
        
        scheduledCost.setAccountId(recurringCost.getAccountId());
        scheduledCost.setAssetName(recurringCost.getAssetName());
        scheduledCost.setBuildingId(recurringCost.getBuildingId());
        scheduledCost.setCostCategoryId(recurringCost.getCostCategoryId());
        scheduledCost.setRecurCostId(recurringCost.getId());
        scheduledCost.setDepartmentId(recurringCost.getDepartmentId());
        scheduledCost.setDescription(recurringCost.getDescription());
        scheduledCost.setDivisionId(recurringCost.getDivisionId());
        scheduledCost.setLeaseId(recurringCost.getLeaseId());
        scheduledCost.setOption1(recurringCost.getOption1());
        scheduledCost.setOption2(recurringCost.getOption2());
        scheduledCost.setParcelId(recurringCost.getParcelId());
        scheduledCost.setPropertyId(recurringCost.getPropertyId());
        
        scheduledCost.setCurrencyBudget(recurringCost.getCurrencyBudget());
        scheduledCost.setCurrencyPayment(recurringCost.getCurrencyPayment());
        
        scheduledCost.setExchangeRateBudget(recurringCost.getExchangeRateBudget());
        scheduledCost.setExchangeRatePayment(recurringCost.getExchangeRatePayment());
        scheduledCost.setDateUsedForMcBudget(recurringCost.getDateUsedForMcBudget());
        scheduledCost.setDateUsedForMcPayment(recurringCost.getDateUsedForMcPayment());
        
        scheduledCost.setExchangeRateOverride(recurringCost.getExchangeRateOverride());
        scheduledCost.setVatAmountOverride(recurringCost.getVatAmountOverride());
        scheduledCost.setVatPercentOverride(recurringCost.getVatPercentOverride());
        
        scheduledCost.setVatPercentValue(recurringCost.getVatPercentValue());
        scheduledCost.setCtryId(recurringCost.getCtryId());
        
        scheduledCost.setAmountIncomeBasePayment(recurringCost.getAmountIncomeBasePayment());
        scheduledCost.setAmountIncomeVatPayment(recurringCost.getAmountIncomeVatPayment());
        scheduledCost.setAmountIncomeTotalPayment(recurringCost.getAmountIncomeTotalPayment());
        
        scheduledCost.setAmountExpenseBasePayment(recurringCost.getAmountExpenseBasePayment());
        scheduledCost.setAmountExpenseVatPayment(recurringCost.getAmountExpenseVatPayment());
        scheduledCost.setAmountExpenseTotalPayment(recurringCost.getAmountExpenseTotalPayment());
        
        scheduledCost.setAmountIncomeBaseBudget(recurringCost.getAmountIncomeBaseBudget());
        scheduledCost.setAmountIncomeVatBudget(recurringCost.getAmountIncomeVatBudget());
        scheduledCost.setAmountIncome(recurringCost.getAmountIncome());
        
        scheduledCost.setAmountExpenseBaseBudget(recurringCost.getAmountExpenseBaseBudget());
        scheduledCost.setAmountExpenseVatBudget(recurringCost.getAmountExpenseVatBudget());
        scheduledCost.setAmountExpense(recurringCost.getAmountExpense());
        scheduledCost.setCamCost(recurringCost.getCamCost());

        scheduledCost.setTaxBillNum(recurringCost.getTaxBillNum());
        scheduledCost.setTaxAuthorityContact(recurringCost.getTaxAuthorityContact());
        scheduledCost.setTaxType(recurringCost.getTaxType());
        scheduledCost.setTaxPeriodInMonths(recurringCost.getTaxPeriodInMonths());
        scheduledCost.setTaxValueAssessed(recurringCost.getTaxValueAssessed());
        scheduledCost.setTaxClr(recurringCost.getTaxClr());

        return scheduledCost;
    }
    
    /**
     * Calculate cost amounts, apply yearly factor and recalculate all amount fields.
     *
     * @param recurringCost recurring cost
     * @param isMcAndVatEnabled if McA & VAt is enabled
     * @param exchangeRates budget exchange rates
     */
    public void calculateIncomeAndExpense(final RecurringCost recurringCost,
            final boolean isMcAndVatEnabled, final ExchangeRateUtil exchangeRates) {
        calculateIncomeAndExpense(recurringCost, isMcAndVatEnabled, exchangeRates, true);
    }
    
    /**
     * Calculate cost amounts, apply yearly factor and recalculate all amount fields.
     *
     * @param recurringCost recurring cost
     * @param isMcAndVatEnabled if McA & VAt is enabled
     * @param exchangeRates budget exchange rates
     * @param throwException boolean ; default is true
     * @throws ExceptionBase if exchange rate is not defined
     */
    public void calculateIncomeAndExpense(final RecurringCost recurringCost,
            final boolean isMcAndVatEnabled, final ExchangeRateUtil exchangeRates,
            final boolean throwException) throws ExceptionBase {
        BigDecimal amountIncome = BigDecimal.ZERO;
        BigDecimal amountExpense = BigDecimal.ZERO;
        
        if (isMcAndVatEnabled) {
            amountIncome = new BigDecimal(recurringCost.getAmountIncomeBasePayment());
            amountExpense = new BigDecimal(recurringCost.getAmountExpenseBasePayment());
        } else {
            amountIncome = new BigDecimal(recurringCost.getAmountIncome());
            amountExpense = new BigDecimal(recurringCost.getAmountExpense());
        }
        
        // apply yearly factor
        final BigDecimal yearlyFactorEscalation =
                new BigDecimal(recurringCost.calculateYearlyFactorEscalation(getDateDue()));
        amountIncome = amountIncome.multiply(yearlyFactorEscalation);
        amountExpense = amountExpense.multiply(yearlyFactorEscalation);
        
        // apply monthly factor
        final BigDecimal monthlyFactorEscalation =
                new BigDecimal(RecurringCost.MONTHLY_FACTOR_ESCALATION);
        amountIncome = amountIncome.multiply(monthlyFactorEscalation);
        amountExpense = amountExpense.multiply(monthlyFactorEscalation);
        
        // update the values in this cost object
        if (isMcAndVatEnabled) {
            setAmountExpenseBasePayment(amountExpense.doubleValue());
            setAmountIncomeBasePayment(amountIncome.doubleValue());
            try {
                // update cost amounts
                VatUtil.calculateVatForCost(this);
                CurrencyUtil.convertCostToBudget(this, getDateDue(), getCurrencyBudget(),
                    exchangeRates);
            } catch (final ExceptionBase exceptionBase) {
                if (throwException) {
                    throw exceptionBase;
                }
            }
        } else {
            setAmountExpense(amountExpense.doubleValue());
            setAmountIncome(amountIncome.doubleValue());
        }
    }
    
    // ----------------------- getters and setters -----------------------------
    
    /**
     * Getter.
     *
     * @return date assessed
     */
    public Date getDateAssessed() {
        return this.dateAssessed;
    }
    
    /**
     * Getter.
     *
     * @return date due
     */
    public Date getDateDue() {
        return this.dateDue;
    }
    
    /**
     * Getter.
     *
     * @return date paid
     */
    public Date getDatePaid() {
        return this.datePaid;
    }
    
    /**
     * Getter.
     *
     * @return recurring cost id
     */
    public int getRecurCostId() {
        return this.recurCostId;
    }
    
    /**
     * Getter.
     *
     * @return cost status
     */
    public String getStatus() {
        return this.status;
    }
    
    /**
     * Setter.
     *
     * @param dateAssessed date assessed
     */
    public void setDateAssessed(final Date dateAssessed) {
        this.dateAssessed = dateAssessed;
    }
    
    /**
     * Setter.
     *
     * @param dateDue date due
     */
    public void setDateDue(final Date dateDue) {
        this.dateDue = dateDue;
    }
    
    /**
     * Setter.
     *
     * @param datePaid date paid
     */
    public void setDatePaid(final Date datePaid) {
        this.datePaid = datePaid;
    }
    
    /**
     * Setter.
     *
     * @param recurCostId recurring cost code
     */
    public void setRecurCostId(final int recurCostId) {
        this.recurCostId = recurCostId;
    }
    
    /**
     * Setter.
     *
     * @param status cost status
     */
    public void setStatus(final String status) {
        this.status = status;
    }
    
    /**
     * Getter for the amountTaxLate1 property.
     *
     * @see amountTaxLate1
     * @return the amountTaxLate1 property.
     */
    public double getAmountTaxLate1() {
        return this.amountTaxLate1;
    }

    /**
     * Setter for the amountTaxLate1 property.
     *
     * @see amountTaxLate1
     * @param amountTaxLate1 the amountTaxLate1 to set
     */
    
    public void setAmountTaxLate1(final double amountTaxLate1) {
        this.amountTaxLate1 = amountTaxLate1;
    }

    /**
     * Getter for the amountTaxLate2 property.
     *
     * @see amountTaxLate2
     * @return the amountTaxLate2 property.
     */
    public double getAmountTaxLate2() {
        return this.amountTaxLate2;
    }

    /**
     * Setter for the amountTaxLate2 property.
     *
     * @see amountTaxLate2
     * @param amountTaxLate2 the amountTaxLate2 to set
     */
    
    public void setAmountTaxLate2(final double amountTaxLate2) {
        this.amountTaxLate2 = amountTaxLate2;
    }

    /**
     * Getter for the amountTaxLate3 property.
     *
     * @see amountTaxLate3
     * @return the amountTaxLate3 property.
     */
    public double getAmountTaxLate3() {
        return this.amountTaxLate3;
    }

    /**
     * Setter for the amountTaxLate3 property.
     *
     * @see amountTaxLate3
     * @param amountTaxLate3 the amountTaxLate3 to set
     */
    
    public void setAmountTaxLate3(final double amountTaxLate3) {
        this.amountTaxLate3 = amountTaxLate3;
    }

    /**
     * Getter for the dateTaxLate1 property.
     *
     * @see dateTaxLate1
     * @return the dateTaxLate1 property.
     */
    public Date getDateTaxLate1() {
        return this.dateTaxLate1;
    }

    /**
     * Setter for the dateTaxLate1 property.
     *
     * @see dateTaxLate1
     * @param dateTaxLate1 the dateTaxLate1 to set
     */
    
    public void setDateTaxLate1(final Date dateTaxLate1) {
        this.dateTaxLate1 = dateTaxLate1;
    }

    /**
     * Getter for the dateTaxLate2 property.
     *
     * @see dateTaxLate2
     * @return the dateTaxLate2 property.
     */
    public Date getDateTaxLate2() {
        return this.dateTaxLate2;
    }

    /**
     * Setter for the dateTaxLate2 property.
     *
     * @see dateTaxLate2
     * @param dateTaxLate2 the dateTaxLate2 to set
     */
    
    public void setDateTaxLate2(final Date dateTaxLate2) {
        this.dateTaxLate2 = dateTaxLate2;
    }

    /**
     * Getter for the dateTaxLate3 property.
     *
     * @see dateTaxLate3
     * @return the dateTaxLate3 property.
     */
    public Date getDateTaxLate3() {
        return this.dateTaxLate3;
    }

    /**
     * Setter for the dateTaxLate3 property.
     *
     * @see dateTaxLate3
     * @param dateTaxLate3 the dateTaxLate3 to set
     */
    
    public void setDateTaxLate3(final Date dateTaxLate3) {
        this.dateTaxLate3 = dateTaxLate3;
    }
    
    @Override
    public String getCostClass() {
        return CLASS_SCHEDULED_COST;
    }
}

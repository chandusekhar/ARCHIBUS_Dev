package com.archibus.app.common.connectors.translation.text;

import java.io.Serializable;
import java.util.*;

/**
 * Compares character sequences to order them by precedence.
 *
 * @author cole
 *
 */
public class CharSequenceComparator implements Comparator<CharSequenceSet>, Serializable {
    /**
     * Serial version UID used to identify the class that was used to serialize this object.
     */
    private static final long serialVersionUID = 7113742671036039371L;
    
    /*
     * JUSTIFICATION: Suppress the error that ArrayList is used instead of List, as this class
     * requires the list to implement java.io.Serializable, and java.util.List doesn't.
     */
    /**
     * The original order of the CharSequenceSets.
     */
    @SuppressWarnings("PMD.LooseCoupling")
    private final ArrayList<CharSequenceSet> charSequenceOriginalOrder;
    
    /**
     * Create a comparator that compares character sequences to order them by precedence.
     *
     * @param charSequenceOriginalOrder the original order of the CharSequenceSets.
     */
    public CharSequenceComparator(final List<CharSequenceSet> charSequenceOriginalOrder) {
        this.charSequenceOriginalOrder = new ArrayList<CharSequenceSet>(charSequenceOriginalOrder);
    }
    
    /**
     * Compares two character sequence sets, considering the sequence with the higher precedence to
     * be first based on the function and then the order in the original list.
     *
     * @param sequenceLeft the left character sequence set
     * @param sequenceRight the right character sequence set
     * @return -1 if the left sequence comes first, 1 if the right sequence comes first, and 0 if
     *         it's the same instance in the same position in the original list (not just an
     *         equivalent copy).
     */
    @Override
    public int compare(final CharSequenceSet sequenceLeft, final CharSequenceSet sequenceRight) {
        int result = sequenceLeft.getFunction().ordinal() - sequenceRight.getFunction().ordinal();
        if (result == 0) {
            result =
                    this.charSequenceOriginalOrder.indexOf(sequenceLeft)
                            - this.charSequenceOriginalOrder.indexOf(sequenceRight);
        }
        return result;
    }
    
}

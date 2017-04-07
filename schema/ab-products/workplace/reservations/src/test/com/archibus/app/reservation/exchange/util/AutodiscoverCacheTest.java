package com.archibus.app.reservation.exchange.util;

import junit.framework.*;

import com.archibus.app.reservation.exchange.domain.AutodiscoverResult;

/**
 * Test for the auto-discover cache.
 * 
 * @author Yorik Gerlo
 */
public class AutodiscoverCacheTest extends TestCase {
    
    /** The fourth element added in the cache has index 3. */
    private static final int THREE = 3;

    /** Prefix for keys added in the cache. */
    private static final String KEY_PREFIX = "key";
    
    /** Remove timeout used for testing. */
    private static final int REMOVE_TIMEOUT = 50;
    
    /** Initial number of items to put in the cache. */
    private static final int INITIAL_COUNT = 5;
    
    /**
     * Test removing the eldest entries from the cache.
     */
    public void testRemoveEldestEntry() {
        final AutodiscoverCache cache = new AutodiscoverCache(REMOVE_TIMEOUT);
        
        int index = 0;
        for (; index < INITIAL_COUNT; ++index) {
            cache.put(KEY_PREFIX + index, new AutodiscoverResult(null));
        }
        
        Assert.assertEquals(INITIAL_COUNT, cache.size());
        // sleep to allow removal of the current items
        try {
            Thread.sleep(REMOVE_TIMEOUT);
        } catch (InterruptedException e) {
            Assert.fail(e.toString());
        }
        
        // put a new item, this would result in removal of the first (oldest) item
        cache.put(KEY_PREFIX + index++, new AutodiscoverResult(null));
        Assert.assertEquals(INITIAL_COUNT, cache.size());
        Assert.assertFalse(cache.containsKey(KEY_PREFIX + 0));
        
        // now access the 2 currently oldest item to postpone their removal
        Assert.assertNotNull(cache.get(KEY_PREFIX + 1));
        Assert.assertNotNull(cache.get(KEY_PREFIX + 2));
        // add a new item
        cache.put(KEY_PREFIX + index++, new AutodiscoverResult(null));
        Assert.assertEquals(INITIAL_COUNT, cache.size());
        
        // items 1 and 2 were reused, so 3 should have been removed
        Assert.assertNotNull(cache.get(KEY_PREFIX + 1));
        Assert.assertNotNull(cache.get(KEY_PREFIX + 2));
        Assert.assertFalse(cache.containsKey(KEY_PREFIX + THREE));
        
        // we now have 4,5,1,2,6 in order of removal
        Assert.assertEquals("[key4, key5, key6, key1, key2]", cache.keySet().toString());
    }
    
}

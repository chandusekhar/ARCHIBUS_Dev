var reviewARangeNoBookingController = View.createController('reviewARangeNoBookingController', {
    dateStart: '1900-12-15',
    dateEnd: '2200-12-15',
    searchBookingConsole_onSearch: function(){
        this.setRestrictionParameter();
        this.roomsGrid.addParameter('dateStart', this.dateStart);
        this.roomsGrid.addParameter('dateEnd', this.dateEnd);
        this.roomsGrid.refresh();
    },
	/**
	 * Clear restriction of console
	 */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.dateStart = '1900-12-15';
        this.dateEnd = '2200-12-15';
        this.roomsGrid.show(false);
    },
	/**
	 * Set restriction for console
	 */
    setRestrictionParameter: function(){
        var dateStart = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        var dateEnd = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (dateStart&& dateEnd&& dateStart <= dateEnd) {
            this.dateStart = dateStart;
            this.dateEnd = dateEnd;
        }
        else 
            if (!dateStart && !dateEnd) {
                this.dateStart = '1900-12-15';
                this.dateEnd = '2200-12-15';
                
            }
            else 
                if (!dateStart && dateEnd) {
                    this.date_start = '1900-12-15';
                    this.dateEnd = dateEnd;
                    
                }
                else 
                    if (dateStart && !dateEnd) {
                        this.dateStart = dateStart;
                        this.dateEnd = '2200-12-15';
                    }
    }
})

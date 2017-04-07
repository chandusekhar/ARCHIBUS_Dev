<?xml version="1.0" encoding="UTF-8"?>
<!-- ab-highlt-rmxselected-console.xsl -->
<!-- XSLT for ab-highlt-rmxselected-console.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
  <!-- activityGraphic holds the file name of our activity graphic -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>

  <!-- restOp1 is the restriction operator for the first field in 
      our form: =, LIKE, etc. -->
	<xsl:variable name="restOp1">LIKE</xsl:variable>
	
	<!-- restConj1 is the retriction conjuntion for the first field in
	     our form:  AND, OR, ) AND (, etc. -->
	<xsl:variable name="restConj1">AND</xsl:variable>
	
	<!-- restField1 is the first field we are restricting on.
	    Must be in the form: table.field, where the table is a source
	    for the table group we are restricting. -->
	<xsl:variable name="restField1">rm.dv_id</xsl:variable>

  <!-- Define the op, conj and field name  for the second restriction field.  -->
	<xsl:variable name="restOp2">LIKE</xsl:variable>
	<xsl:variable name="restConj2">AND</xsl:variable>
	<xsl:variable name="restField2">rm.dp_id</xsl:variable>
  
  <!-- importing ab-2field-consle-filter.xsl, the standard XSL for
      creating a 2 field restriction console  -->
  <xsl:include href="../../../ab-system/xsl/ab-2field-console-filter.xsl" />

</xsl:stylesheet>

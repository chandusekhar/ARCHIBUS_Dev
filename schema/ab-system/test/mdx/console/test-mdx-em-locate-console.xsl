<?xml version="1.0" encoding="UTF-8"?>
<!-- XSLT for ab-em-locate-console.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    This XSL file defines variables and constants that are unique to this form.  It
    then includes the main XSL stylesheet that performs most of the processing and
    creation of the restriction form.
  -->

  <!-- activityGraphic holds the file name of our activity graphic -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
	
  <!-- Perform a LIKE restriction on em.em_id -->
	<xsl:variable name="restOp">LIKE</xsl:variable>
	<xsl:variable name="restConj">AND</xsl:variable>
	<xsl:variable name="restField">em.em_id</xsl:variable>
  
  <!-- importing ab-simple-consle-filter.xsl, the standard XSL for
      creating a single-restriction console  -->
  <xsl:include href="../../../ab-system/xsl/ab-simple-console-filter.xsl" />

</xsl:stylesheet>

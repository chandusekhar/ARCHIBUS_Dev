<?xml version="1.0" encoding="utf-8"?>
<!-- ab-em-setup-or-move-console.xsl -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
	
	<!-- restOp is the restriction operator for our form: =, LIKE, etc. -->
	<xsl:variable name="restOp">LIKE</xsl:variable>
	
	<!-- restConj is the retriction conjuntion for our form:  AND, OR, ) AND (, etc. -->
	<xsl:variable name="restConj">AND</xsl:variable>
	
	<!-- restField is the field we are restricting on.  Must be in the form: table.field -->
	<xsl:variable name="restField">em.em_id</xsl:variable>
  
  <xsl:include href="../../../ab-system/xsl/ab-simple-console-filter.xsl" />

</xsl:stylesheet>

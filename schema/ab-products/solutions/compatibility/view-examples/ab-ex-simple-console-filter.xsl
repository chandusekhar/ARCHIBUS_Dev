<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle console filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    This XSL file defines variables and constants that are unique to this form.  It
    then includes the main XSL stylesheet that performs most of the processing and
    creation of the restriction form.
  -->

  <!--
    Localization note:  Any text that may need to be translated should be placed
    in a title or message element in the AXVW file, with a translatable="false"
    attribute.
  -->

  <!-- activityGraphic holds the file name of our activity graphic -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>

  <!-- restOp is the restriction operator for our form: =, LIKE, etc. -->
	<xsl:variable name="restOp">=</xsl:variable>

	<!-- restConj is the retriction conjuntion for our form:  AND, OR, ) AND (, etc. -->
	<xsl:variable name="restConj">AND</xsl:variable>

	<!-- restField is the field we are restricting on.  Must be in the form: table.field -->
	<xsl:variable name="restField">em.em_id</xsl:variable>

  <!-- importing ab-simple-consle-filter.xsl, the standard XSL for
      creating a single-restriction console  -->
  <xsl:include href="../../../ab-system/xsl/ab-simple-console-filter.xsl" />

</xsl:stylesheet>

<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle console filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    This XSL file defines variables and constants that are unique to this form. It
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

  <!-- restOp1 is the restriction operator for the first field in
      our form: =, LIKE, etc. -->
	<xsl:variable name="restOp1">=</xsl:variable>

	<!-- restConj1 is the retriction conjuntion for the first field in
	     our form:  AND, OR, ) AND (, etc. -->
	<xsl:variable name="restConj1">AND</xsl:variable>

	<!-- restField1 is the first field we are restricting on.
	    Must be in the form: table.field, where the table is a source
	    for the table group we are restricting. -->
	<xsl:variable name="restField1">rm.bl_id</xsl:variable>

  <!-- Define the op, conj and field name  for the second restriction field.  -->
	<xsl:variable name="restOp2">=</xsl:variable>
	<xsl:variable name="restConj2">AND</xsl:variable>
	<xsl:variable name="restField2">rm.fl_id</xsl:variable>

  <!-- importing ab-2field-consle-filter.xsl, the standard XSL for
      creating a 2 field restriction console  -->
  <xsl:include href="../../../ab-system/xsl/ab-2field-console-filter.xsl" />

</xsl:stylesheet>

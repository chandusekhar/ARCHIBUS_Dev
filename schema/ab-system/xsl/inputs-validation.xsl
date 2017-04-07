<?xml version="1.0"?>
<!-- which is contained in xslt files for edit or filter forms which are requiring inputs validation -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="SetUpFieldsInformArray">
		<xsl:param name="fieldNodes"/>
		<script language="javascript">
			<!-- javascript variables and functions used here are in inputs-validation.js -->
			<xsl:for-each select="$fieldNodes/field[@table!=''][@name!='']">
				<!-- don't change array's index names, they'll be used in javascript to get their values -->
				<!-- some boolean variables like "required" are used a javascript string to avoid the javascript variable definition error -->
				<!-- if there is no such attribute defined in source XML -->
				var arrInformationList = new Array();
				arrInformationList['type']='<xsl:value-of select="@type"/>';
				arrInformationList['afmType']='<xsl:value-of select="@afmType"/>';
				arrInformationList['readOnly']='<xsl:value-of select="@readOnly"/>';
				arrInformationList['format']='<xsl:value-of select="@format"/>';
				arrInformationList['primaryKey']='<xsl:value-of select="@primaryKey"/>';
				arrInformationList['foreignKey']='<xsl:value-of select="@foreignKey"/>';
				arrInformationList['size']='<xsl:value-of select="@size"/>';
				arrInformationList['decimal']='<xsl:value-of select="@decimals"/>';
				arrInformationList['required']='<xsl:value-of select="@required"/>';
				arrInformationList['displaySizeHeading']='<xsl:value-of select="@displaySizeHeading"/>';
				<xsl:variable name="isEnum">
					<xsl:choose>
						<xsl:when test="count(enumeration/item) &gt; 0">true</xsl:when>
						<xsl:otherwise>false</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				arrInformationList['isEnum']=<xsl:value-of select="$isEnum"/>;
				//XXX: console
				<xsl:variable name="operator">
					<xsl:choose>
						<xsl:when test="@op!=''"><xsl:value-of select="@op"/></xsl:when>
						<xsl:otherwise><xsl:text></xsl:text></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				arrInformationList['op']='<xsl:value-of select="$operator"/>';
				<!-- javascript function setupArrFieldsInformation() is defined in inputs-validation.js -->
				<xsl:variable name="fullName" select="concat(@table,'.',@name)"/>
				arrInformationList['fullName']='<xsl:value-of select="$fullName"/>';
				<xsl:variable name="id_name">
					<xsl:choose>
						<xsl:when test="@alias!=''"><xsl:value-of select="@alias"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="$fullName"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="primary_field_name">
					<xsl:choose>
						<xsl:when test="$fullName=$id_name"><xsl:value-of select="$fullName"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="$id_name"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				setupArrFieldsInformation('<xsl:value-of select="$primary_field_name"/>',arrInformationList);
			</xsl:for-each>
		</script>
                <span style="display:none" id="field_validation_warning_message_numeric_decimal1"  translatable="true">Please enter a numeric value with at most </span>
                <span style="display:none" id="field_validation_warning_message_numeric_decimal2"  translatable="true">decimals</span>
                <span style="display:none" id="field_validation_warning_message_too_small_integer"  translatable="true">Too small input! Please enter an integer larger than </span>
                <span style="display:none" id="field_validation_warning_message_too_large_integer"  translatable="true">Too large input! Please enter an integer less than </span>
                <span style="display:none" id="field_validation_warning_message_too_small_numeric"  translatable="true">Too small input! Please enter a numeric value larger than </span>
                <span style="display:none" id="field_validation_warning_message_too_large_numeric"  translatable="true">Too large input! Please enter a numeric value less than </span>
   </xsl:template>
</xsl:stylesheet>

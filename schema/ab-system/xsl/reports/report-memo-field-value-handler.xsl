<?xml version="1.0" encoding="UTF-8"?>
<!-- processing memo field value in report -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="memo_field_value_handler">
		<xsl:param name="memo_value"/>
		<xsl:choose>
			<xsl:when test="contains($memo_value,'&#x0D;&#x0A;')">
				<xsl:value-of select="substring-before($memo_value,'&#x0D;&#x0A;')"/><br />
				<xsl:call-template name="memo_field_value_handler">
					<xsl:with-param name="memo_value" select="substring-after($memo_value,'&#x0D;&#x0A;')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$memo_value"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
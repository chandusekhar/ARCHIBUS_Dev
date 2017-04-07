package com.archibus.app.common.extensionsarcgis;

import java.text.ParseException;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;

/**
 *
 * Test JsonReaderWriter#writeFile.
 *
 */
public final class TestWriteJson extends DataSourceTestBase {

    /**
     * Write a sample JSON file.
     */
    public void testWriteJson() {

        /*
         * Create the output file name.
         */
        final String filename = ArchibusProjectUtilities.getGeoJsonPath() + "json-test.json";
        
        /*
         * Create JSON for writing.
         */
        try {
            final JSONObject jsonTest =
                    new JSONObject(
                        "{\r\n"
                                + "  \"IsGeoreferenced\": false,\r\n"
                                + "  \"ID\": \"D:\\\\WebCentral\\\\projects\\\\gds_v2\\\\drawings\\\\B-US-MA-1002_1.dwg\",\r\n"
                                + "  \"ExtentsMin\": {\r\n" + "    \"X\": -132.62,\r\n"
                                + "    \"Y\": 55.11\r\n" + "  },\r\n" + "  \"ExtentsMax\": {\r\n"
                                + "    \"X\": 58.64,\r\n" + "    \"Y\": 256.29\r\n" + "  },\r\n"
                                + "  \"Assets\": {\r\n" + "    \"gros\": [\r\n" + "      {\r\n"
                                + "        \"Key\": \"B-US-MA-1002;1;EXT\",\r\n"
                                + "        \"AssetType\": \"gros\",\r\n"
                                + "        \"TagInsertionPoint\": {\r\n"
                                + "          \"X\": 10.56,\r\n" + "          \"Y\": 94.93\r\n"
                                + "        },\r\n" + "        \"TextHeight\": 15.0,\r\n"
                                + "        \"Shape\": {\r\n" + "          \"Verticies\": [\r\n"
                                + "            {\r\n" + "              \"X\": -5.44,\r\n"
                                + "              \"Y\": 105.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": 23.56,\r\n"
                                + "              \"Y\": 105.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": 23.56,\r\n"
                                + "              \"Y\": 225.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": -96.44,\r\n"
                                + "              \"Y\": 225.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": -96.44,\r\n"
                                + "              \"Y\": 105.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": -20.11,\r\n"
                                + "              \"Y\": 105.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": -20.11,\r\n"
                                + "              \"Y\": 55.11\r\n" + "            },\r\n"
                                + "            {\r\n" + "              \"X\": -5.44,\r\n"
                                + "              \"Y\": 55.22\r\n" + "            }\r\n"
                                + "          ]\r\n" + "        }\r\n" + "      }\r\n" + "    ]\r\n"
                                + "  }\r\n" + "}");
            
            /*
             * Write the JSON file.
             */
            JsonReaderWriter.writeFile(jsonTest, filename);

            // TODO how do i assert that this test was a success?

        } catch (final ParseException e) {
            System.out.println(e.getMessage());
        }

    }
    
}

/**
 * Encrypts and decrypts a string using transliteration and column transposition.
 * Strings are encrypted by calling the encryptString function.
 *
 * Strings are decrypted by calling the decryptString function.
 *
 * This code was ported from the ARCHIBUS ab-secure.js file.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.security.Security', {
    requires: [
        'Common.security.Password',
        'Common.security.PermutationGenerator'
    ],

    singleton: true,

    /**
     * The password used to encrypt the string.
     */
    signatureKey: '0@1Z2y3X4^5w6*7=8-9+',

    /**
     * The text to be encrypted
     */
    text: null,

    transliterate: function (encode) {

        var transliteratedString = '', textIteration = 0, textTrail = 0, characterRun, skipped, character, runIndex;

        while (textIteration < this.text.length) {
            characterRun = '';
            skipped = 0;
            while (skipped < 7 && textIteration < this.text.length) {
                character = this.text.charAt(textIteration++);
                if (-1 === characterRun.indexOf(character)) {
                    characterRun += character;
                    skipped = 0;
                } else {
                    skipped++;
                }
            }

            while (textTrail < textIteration) {
                runIndex = characterRun.indexOf(this.text.charAt(textTrail++));
                if (encode) {
                    runIndex++;
                    if (runIndex === characterRun.length) {
                        runIndex = 0;
                    }
                } else {
                    runIndex--;
                    if (runIndex === -1) {
                        runIndex += characterRun.length;
                    }
                }

                transliteratedString += characterRun.charAt(runIndex);
            }
        }

        this.text = transliteratedString;
    },

    encypher: function (permutation) {
        var encypherString = '',
            columns = permutation.length,
            rows = this.text.length / columns, i, k, j;

        for (i = 0; i < columns; i++) {
            k = permutation[i];
            for (j = 0; j < rows; j++) {
                encypherString += this.text.charAt(k);
                k += columns;
            }
        }

        this.text = encypherString;
    },

    padString: function (numberOfColumns) {
        var textLength = this.text.length + this.signatureKey.length, missingColumns = numberOfColumns
            - (textLength % numberOfColumns), padding = '', i;

        if (missingColumns < numberOfColumns) {
            for (i = 0; i < missingColumns; i++) {
                padding += ' ';
            }
        }

        this.text += padding + this.signatureKey;
    },

    encrypt: function (signatureKey) {
        var password = Ext.create('Common.security.Password', {
            password: signatureKey
        }), permutation = password.getPermutation();

        this.padString(permutation.length);
        this.transliterate(true);
        this.encypher(permutation);
    },

    unsign: function () {

        if ('' === this.signatureKey) {
            return true;
        }

        var textLength = this.text.lastIndexOf(this.signatureKey);
        if (-1 === textLength) {
            return false;
        }

        this.text = this.text.substr(0, textLength);

        return true;

    },

    decypher: function (permutation) {

        var rows = permutation.length, columns = this.text.length / rows, rowOffset = [], i, j;

        for (i = 0; i < rows; i++) {
            rowOffset[permutation[i]] = i * columns;
        }

        var plainString = '';

        for (i = 0; i < columns; i++) {
            for (j = 0; j < rows; j++) {
                plainString += this.text.charAt(rowOffset[j] + i);
            }
        }

        this.text = plainString;

    },

    decrypt: function (signatureKey) {
        var password = Ext.create('Common.security.Password', {
            password: signatureKey
        }), permutation = password.getPermutation();

        this.decypher(permutation);

        this.transliterate(false);

        return this.unsign();

    },

    /**
     * Encrypts a string using the coded key.
     *
     * @param stringToEncrypt
     *            The string to encrypt
     * @return {String} Encrypted string
     */
    encryptString: function (stringToEncrypt) {
        var me = this;

        if (stringToEncrypt === null) {
            return null;
        }

        me.text = stringToEncrypt;
        me.encrypt(me.signatureKey);
        return me.text;
    },

    /**
     * Decrypts an encrypted string using the coded key.
     *
     * @param stringToDecrypt
     *            The encrypted string
     * @return {String} The decrypted string
     */
    decryptString: function (stringToDecrypt) {
        this.text = stringToDecrypt;

        this.decrypt(this.signatureKey);

        return this.text;
    }
});

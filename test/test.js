'use strict';

delete require.cache[require.resolve('..')];
var powerAssertPreset = require('..');

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var babel = require('@gerhobbelt/babel-core');

function testTransform (fixtureName, extraSuffix, extraOptions) {
    it(fixtureName, function () {
        var suffix = extraSuffix ? '-' + extraSuffix : '';
        var fixtureFilepath = path.resolve(__dirname, 'fixtures', fixtureName, 'fixture.js');
        var expectedFilepath = path.resolve(__dirname, 'fixtures', fixtureName, 'expected' + suffix + '.js');
        var actualFilepath = path.resolve(__dirname, 'fixtures', fixtureName, 'actual' + suffix + '.js');
        var result = babel.transformFileSync(fixtureFilepath, Object.assign({
            presets: [
                '@gerhobbelt/babel-preset-react',
                powerAssertPreset
            ]
        }, extraOptions));
        var actual = result.code + '\n';

        // dirty hack to tweak the sources to ensure all platforms (Windows vs. UNIX) produce the same output:
        // tweak the forward-slash to backslash for all `filepath` entries in there:
        actual = actual.replace(/filepath:.*$/gm, function (line) {
            return line.replace(/[\\][\\]/g, '/');
        });

        if (fs.existsSync(expectedFilepath)) {
            var expected = fs.readFileSync(expectedFilepath, 'utf8');
            if (actual !== expected) {
                fs.writeFileSync(actualFilepath, actual, 'utf8');
            }
            assert.equal(actual, expected);
        } else {
            console.warn("          Regenerating test SOLLWERT for " + fixtureName + " ...");
            assert(true); // shut up test rig: one (fake) test done at least!
            fs.writeFileSync(expectedFilepath, actual, 'utf8');
        }
    });
}

describe('babel-preset-power-assert', function () {
    testTransform('React', 'presets-react');
});

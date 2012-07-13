var fs = require('fs'),
	builder = require('xmlbuilder');

// This can be used in a 'configure' block, e.g. 
// chook_xml_reporter = require('chook-xml-reporter');
// chook.use(chook_xml_reporter.reporter());
exports.reporter = function(outputXmlFile) { 
	return {
		reporter: function(e) {

			e.on('complete', function(status){

				var flattenedTests = [];

				function getTestTimes(suitePath, suites) {
					suites.forEach(function(suite) {
						var path = suitePath.slice();
						path.push(suite.name);
						suite.tests.forEach(function(test) {
							flattenedTests.push({path: path, name: test.name, status: test.status, error: test.error, duration: test.duration});
						});
						if (suite.suites) {
							getTestTimes(path, suite.suites);
						}
					});
				}
				getTestTimes([], status.suites);

				var doc = builder.create();


				var suitesEl = doc.begin('testsuites', {'version': '1.0', 'encoding': 'UTF-8'});

				flattenedTests.forEach(function(test) {
					var testcaseEl = suitesEl.ele('testcase', {classname: test.path, name: test.name, time: (test.duration/1000)});
					if (test.error) {
						var elName = test.status === 'fail' ? 'failure' : 'error';
						testcaseEl.ele(elName, {type: test.error.name || test.status}, test.error.message);
					}
				});
				//console.log(doc.toString({ pretty: true }));
				var xmlOutputStream = fs.createWriteStream(outputXmlFile, {'flags': 'w'});
				xmlOutputStream.write(doc.toString({ pretty: true }));
				xmlOutputStream.end();
			});
		}
	};
};

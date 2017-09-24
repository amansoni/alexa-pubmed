/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.a19a44cc-91ba-4809-88e9-ee029e1a6f28'

const SKILL_NAME = 'Life Science';
const HELP_MESSAGE = 'I can tell you about the number of research papers published in a period, or for a specific topic in that period.  You can give me keywords to search for, or, you can say exit... What do you want to know?';
const HELP_REPROMPT = 'What are your search terms?';
const STOP_MESSAGE = 'Goodbye!';

var days = 5;
var term = null;


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
	'Unhandled': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'PublishedCount': function () {
        httpsGet(days, term, (myResult) => {
                console.log("sent     : " + days);
                console.log("received : " + myResult);
				this.response.speak('There were  ' + myResult + ' papers published in the last ' + days + ' days');
					
                this.emit(':responseReady');
            }
        );

    },
    'PublishedTopicCount': function () {
        httpsGet(days, term, (myResult) => {
                console.log("sent     : " + days + " term:" + term);
                console.log("received : " + myResult);
				this.response.speak('There were  ' + myResult + ' papers published about ' + term + ' in the last ' + days + ' days');
					
                this.emit(':responseReady');
            }
        );

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

// 3. Helper Function  =================================================================================================

var https = require('https');

function httpsGet(days, terms, callback) {

	var path;
	if (term == null || term == "")
		path = '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=10&retmode=json&reldate=' + encodeURIComponent(days)
	else
		path = '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=10&retmode=json&reldate=' + encodeURIComponent(days) + '&term=' + encodeURIComponent(term);
	
	var options = {
            host: 'eutils.ncbi.nlm.nih.gov',
            port: 443,
            path: path,
            method: 'GET'
    };

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
			console.log(returnData);

            var pop = JSON.parse(returnData).esearchresult.count;

            callback(pop);  // this will execute whatever function the caller defined, with one argument

        });

    });
    req.end();

}

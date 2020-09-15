/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */


// For more information about Amazon Athena, see the user guide and API reference at:
// https://docs.aws.amazon.com/athena

const path = require('path');

const AWS = require('aws-sdk')
const Queue = require('async/queue')
const _ = require('lodash')

const ATHENA_DB = 'default'
const ATHENA_OUTPUT_LOCATION = 's3://orp-test-bucket/'
const RESULT_SIZE = 1000
const POLL_INTERVAL = 1000

const PORT = process.env.PORT || 3000;

// Not required if environment variables are used
// Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION and AWS_SESSION_TOKEN
// https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html
 let creds = new AWS.SharedIniFileCredentials({ filename: '/Users/sriramjayaraman/.aws/credentials', profile: 'default' });
 AWS.config.credentials = creds;

let client = new AWS.Athena({ region: 'us-east-1' })

/* Create an async queue to handle polling for query results */
let q = Queue((id, cb) => {
    startPolling(id)
        .then((data) => { return cb(null, data) })
        .catch((err) => { console.log('Failed to poll query: ', err); return cb(err) })
}, 5);


function makeQuery(sql) {
    return new Promise((resolve, reject) => {
        let params = {
            QueryString: sql,
            ResultConfiguration: { OutputLocation: ATHENA_OUTPUT_LOCATION },
            QueryExecutionContext: { Database: ATHENA_DB }
        }

        /* Make API call to start the query execution */
        client.startQueryExecution(params, (err, results) => {
            if (err) return reject(err)
            /* If successful, get the query ID and queue it for polling */
            q.push(results.QueryExecutionId, (err, qid) => {
                if (err) return reject(err)
                /* Once query completed executing, get and process results */
                return buildResults(qid)
                    .then((data) => { return resolve(data) })
                    .catch((err) => { return reject(err) })
            })
        })
    })
}

function buildResults(query_id, max, page) {
    let max_num_results = max ? max : RESULT_SIZE
    let page_token = page ? page : undefined
    return new Promise((resolve, reject) => {
        let params = {
            QueryExecutionId: query_id,
            MaxResults: max_num_results,
            NextToken: page_token
        }

        let dataBlob = []
        go(params)

        /* Get results and iterate through all pages */
        function go(param) {
            getResults(param)
                .then((res) => {
                    dataBlob = _.concat(dataBlob, res.list)
                    if (res.next) {
                        param.NextToken = res.next
                        return go(param)
                    } else return resolve(dataBlob)
                }).catch((err) => { return reject(err) })
        }

        /* Process results merging column names and values into a JS object */
        function getResults() {
            return new Promise((resolve, reject) => {
                client.getQueryResults(params, (err, data) => {
                    if (err) return reject(err)
                    var list = []
                    let header = buildHeader(data.ResultSet.ResultSetMetadata.ColumnInfo)
                    let top_row = _.map(_.head(data.ResultSet.Rows).Data, (n) => { return n.VarCharValue })
                    let resultSet = (_.difference(header, top_row).length > 0) ?
                        data.ResultSet.Rows :
                        _.drop(data.ResultSet.Rows)
                    resultSet.forEach((item) => {
                        list.push(_.zipObject(header, _.map(item.Data, (n) => { return n.VarCharValue })))
                    })
                    return resolve({ next: ('NextToken' in data) ? data.NextToken : undefined, list: list })
                })
            })
        }
    })
}

function startPolling(id) {
    return new Promise((resolve, reject) => {
        function poll(id) {
            client.getQueryExecution({ QueryExecutionId: id }, (err, data) => {
                if (err) return reject(err)
                if (data.QueryExecution.Status.State === 'SUCCEEDED') return resolve(id)
                else if (['FAILED', 'CANCELLED'].includes(data.QueryExecution.Status.State)) return reject(new Error(`Query ${data.QueryExecution.Status.State}`))
                else { setTimeout(poll, POLL_INTERVAL, id) }
            })
        }
        poll(id)
    })
}

function buildHeader(columns) {
    return _.map(columns, (i) => { return i.Name })
}

var express = require('express');
var app = express();

app.get('/api/fetch/', function (req, res) {
    /* Make a SQL query and display results */
    makeQuery("select product_title from amazon_reviews_parquet where product_category='PC' limit 10;")
        .then((data) => {
            console.log('Row Count: ', data.length)
            console.log('DATA: ', data)
            return res.json(data)
        })
        .catch((e) => { console.log('ERROR: ', e) })
})

app.get('/api/fetch/:searchTerm', function (req, res) {
    /* Make a SQL query and display results */
    makeQuery("select product_title, star_rating from amazon_reviews_parquet where product_category='PC' and product_title like '%" + req.params.searchTerm + "%' order by star_rating desc limit 10;")
        .then((data) => {
            console.log('Row Count: ', data.length)
            console.log('DATA: ', data)
            return res.json(data)
        })
        .catch((e) => { console.log('ERROR: ', e) })
})

app.get('/api/products/:productName', function (req, res) {
    /* Make a SQL query and display results */
    makeQuery("select product_title, star_rating, helpful_votes, total_votes, review_headline, review_body, year from amazon_reviews_parquet where product_category='PC' and product_title like '%" + req.params.productName + "%' order by helpful_votes desc limit 10;")
        .then((data) => {
            console.log('Row Count: ', data.length)
            console.log('DATA: ', data)
            return res.json(data)
        })
        .catch((e) => { console.log('ERROR: ', e) })
})

const allowedExt = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
];
app.get('*', (req, res) => {
    if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
        res.sendFile(path.resolve(`client/${req.url}`));
    } else {
        res.sendFile(path.resolve('client/index.html'));
    }
});

var server = app.listen(PORT, function () {
    var port = server.address().port

    console.log("scaling octo invention listening at %s", port)
})
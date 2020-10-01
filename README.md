# jobly
JSON API application using NodeJS/Express

## status: in development

## Language/Frameworks/Libraries used
* NodeJS/Express
* PostgreSQL
* js library _pg_ to establish low-level connection between app and database
* supertest for testing

## TO-DO
### companies
* Fix GET route to handle errors in request url incase unexpected query param is passed
* POST route currently requires request body to have all company columns in order to successfully create new route
### jobs 
* create routes
### users
* create routes
### helper functions
* Add more tests for both partialUpdate.js and searchParams
* Once routes for company are complete, add integration testing

## TESTING
In root directory, run the following command:
`jest`

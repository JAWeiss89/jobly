// Generate a SQL query using params in request.
// Possible params:
// - search: case-insensitive string to be matched with name of company. 
// - min_employees: an inclusive integer
// - max_employees: an inclusive integer
// if min_employees > max_employees, throw 400 error

// https://{domain}.com/companies?search=apple,min_employees=300,max_employees=1000
//    vvvvv
// filterResults(companies, {'search': 'apple', 'min_employees': 300, 'max_employees': 1000 })
//    vvvvv
/* 
{`SELECT id, name FROM companies WHERE 
    lower(name) LIKE %$1% AND 
    num_employees >= $2 AND 
    num_employees <= $3`, ['apple', 300, 1000]}
*/

function filterResults(table, params) {
    // Keep track of params indexes
    let idx = 1;
    let queryString = `SELECT * FROM ${table} WHERE `; // Rest of query added later
    let searchParams = []

    for (let param in params) {
        if (param == 'search' && table=="companies") {
            searchParams.push(`lower(name) LIKE $${idx}`)
        } else if (param == 'search' && table=="jobs") {
            searchParams.push(`lower(title) LIKE $${idx}`)
        } else if (param == 'min_employees') {
            searchParams.push(`num_employees >= $${idx}`)
        } else if (param == 'max_employees') {
            searchParams.push(`num_employees <= $${idx}`)
        } else if (param == 'min_salary') {
            searchParams.push(`salary >= $${idx}`)
        } else if (param == 'max_salary') {
            searchParams.push(`salary <= $${idx}`)
        }
        idx++;
    }

    // join separate search queries with word AND in between each. If just one param, 'AND' will not be added
    let joinedParams = searchParams.join(' AND ');
    // Put together complete query
    queryString += joinedParams;
    // Change value of search param to include % % around word, making it searchable
    if (params.search) {
        params.search = `%${params.search}%`
    }
    // Get all the param values into an array
    let values = Object.values(params);
    
    return { queryString, values };
}

module.exports = filterResults;
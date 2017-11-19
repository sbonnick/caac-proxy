
var schemas = {};


function loadSchema(schema) {
    schemas = schema;
}

function sanitizeJson(list, data) {
    if (data === null)
        return {};  

    var sanitized = {}
    list.forEach(function (element){
        if (element !== null && typeof element === 'object') {
            for (var childKey in element) {
                if (childKey in data)
                    sanitized[childKey] = sanitizeJson(element[childKey], data[childKey])
                else
                    sanitized[childKey] = null;
            }
        } else if (element in data)
            sanitized[element] = data[element];
        else
            sanitized[element] = null;
    })

    return sanitized;
}

function sanitizeResults(result) {
    if ((!('Results' in result)) || result.Results.length === 0)
        throw new Error('Whoops, Could not sanitize results as there were none');

    var sanitized = {Results:[]};
    result.Results.forEach(function(child){
        if (!(child._type.toLowerCase() in schemas))
            throw new Error("Whoops, no schema loaded for type " + child._type.toLowerCase());

        sanitized.Results.push(
            sanitizeJson(schemas[child._type.toLowerCase()].sanitize, child)
        )
    })
    
    return sanitized;
}

module.exports = {
    loadSchema: loadSchema,
    results: sanitizeResults
}
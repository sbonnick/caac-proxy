var rally = require('rally');

var conn;
var schemas = {};

function loadSchema(schema) {
    schemas = schema;
}

function connection(rally_apikey) {
    conn = rally({
        apiKey: rally_apikey,
        requestOptions: {
            headers: {
                'X-RallyIntegrationName': 'CAAC Proxy',     
                'X-RallyIntegrationVersion': '1.0'                    
            }
        }
    });
}

function getFetchSchema(type) {
     if (!(type.toLowerCase() in schemas))
            throw new Error("Whoops, no schema loaded for type " + type.toLowerCase());

    return schemas[type.toLowerCase()].fetch
}

function queryAll(type) {
    return conn.query({
        type: type.toLowerCase(),
        fetch: getFetchSchema(type.toLowerCase())
    })
}

function queryAllByProject(type, id) {
    return conn.query({
        type: type.toLowerCase(),
        fetch: getFetchSchema(type.toLowerCase()),
        scope: {
            project: '/project/' + id
        }
    })
}

function queryFormattedID(type, id) {
     return conn.query({
        type: type.toLowerCase(),
        fetch: getFetchSchema(type.toLowerCase()),
        query: rally.util.query.where('FormattedID', '=', id)
    })
}

function queryChildren(result) {
    
    var promises = [];

    result.Results.forEach(function(res){
        var referance = {}
        if ('Children' in res)
            referance = res.Children
        else if ('UserStories' in res)
            referance = res.UserStories
        else 
            throw new Error("Whoops, no children detected in " + res.FormattedID);

        promises.push( 
            conn.query({
                ref: referance,
                limit: Infinity,
                order: 'Rank',
                fetch: getFetchSchema(referance._type.toLowerCase())
            })
        )
    })

    return Promise.all(promises).then(function(results){
        var newChildren = {Results:[]}
        results.forEach(function(result){
            result.Results.forEach(function(item) {
                newChildren.Results.push(item)
            })
        })
        return newChildren;
    });

}


module.exports = {
    loadSchema: loadSchema,
    connection: connection,
    queryAll: queryAll,
    queryAllByProject: queryAllByProject,
    queryFormattedID: queryFormattedID,
    queryChildren: queryChildren
};


// Tools for determining queries
// https://rally1.rallydev.com/slm/doc/webservice/
// https://github.com/RallyTools/rally-node/wiki/User-Guide
// 
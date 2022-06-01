const config = {
    databaseSettings: {
        host     : 'localhost',
        port     : '3306',
        database : 'tamugradesDB',
        user     : 'tamugradesuser',
        password : '$&tamugradesdbpassword!',
    },
    gradesTable: 'tamugrades',
    statusTable: 'status',
    port       :  5001,
};

module.exports = config;
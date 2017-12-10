module.exports = {
    service: {
        host: 'http://localhost',
        port: 3002,
        apiversion: "v1",
	    baseurl: "http://localhost"
    },
    database: {
        host: 'localhost',
        port: 27017,
        db: 'cricketapp',
        username: '',
        password: ''       
    },
    email: {
        username: "support@clofus.com",
        password: "0182680c955d37f1ba707640aba9b0ed",
        from: "support@clofus.com",
        service: "mailgun",
	host: "smtp.mailgun.org",
	port: 587,
	trackerimage: "/logo_tiny.png"
    },
	googlemaps:{
		key: "AIzaSyCAZS4vCDwjVZgs-COeAC0YQfJAZv8BQk4"
	}
};

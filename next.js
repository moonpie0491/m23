var mysql = require('mysql');
var http = require('http');
var url = require('url');
var querystring = require('querystring');

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'ds',
    user: 'root',
    password: 'Srushti@228',
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);

    // Create the course table
    var createTableQuery = `
        CREATE TABLE IF NOT EXISTS course (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            instructor VARCHAR(255) NOT NULL,
            duration INT,
            level VARCHAR(50),
            fee DECIMAL(10, 2)
        )
    `;
    connection.query(createTableQuery, function(error, results, fields) {
        if (error) {
            console.error('Error creating table: ' + error.stack);
            return;
        }
        console.log('Table created successfully');

        // Insert values into the course table
        var courses = [
            ['Web Development', 'John Doe', 12, 'Intermediate', 200.00],
            ['Data Science', 'Jane Smith', 10, 'Advanced', 250.00],
            ['Mobile App Development', 'Michael Johnson', 8, 'Beginner', 150.00],
            ['Machine Learning', 'Emily Brown', 15, 'Intermediate', 300.00],
            ['Cybersecurity', 'David Wilson', 10, 'Advanced', 350.00]
        ];

        var insertQuery = 'INSERT INTO course (name, instructor, duration, level, fee) VALUES ?';
        connection.query(insertQuery, [courses], function(error, results, fields) {
            if (error) {
                console.error('Error inserting data: ' + error.stack);
                return;
            }
            console.log('Data inserted successfully');
            
            // Start the HTTP server after inserting data
            startServer();
        });
    });
});

function startServer() {
    // Create an HTTP server
    var server = http.createServer(function(req, res) {
        var reqUrl = url.parse(req.url, true);
        var pathname = reqUrl.pathname;

        if (req.method === 'GET') {
            if (pathname === '/courses') {
                // Fetch all courses
                connection.query('SELECT * FROM course', function(error, results, fields) {
                    if (error) {
                        console.error('Error fetching data: ' + error.stack);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Error fetching data from database');
                        return;
                    }

                    // Convert results to HTML table
                    let table = `
                        <table border="1">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Instructor</th>
                                <th>Duration</th>
                                <th>Level</th>
                                <th>Fee</th>
                            </tr>
                    `;
                    results.forEach(course => {
                        table += `
                            <tr>
                                <td>${course.id}</td>
                                <td>${course.name}</td>
                                <td>${course.instructor}</td>
                                <td>${course.duration}</td>
                                <td>${course.level}</td>
                                <td>${course.fee}</td>
                            </tr>
                        `;
                    });
                    table += `</table>`;

                    // Send the table as a response
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(table);
                });
            } else if (pathname === '/courses/detail') {
                // Fetch course details by ID
                var courseId = reqUrl.query.id;
                connection.query('SELECT * FROM course WHERE id = ?', [courseId], function(error, results, fields) {
                    if (error) {
                        console.error('Error fetching data: ' + error.stack);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Error fetching data from database');
                        return;
                    }

                    // Convert results to HTML table
                    let table = `
                        <table border="1">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Instructor</th>
                                <th>Duration</th>
                                <th>Level</th>
                                <th>Fee</th>
                            </tr>
                    `;
                    results.forEach(course => {
                        table += `
                            <tr>
                                <td>${course.id}</td>
                                <td>${course.name}</td>
                                <td>${course.instructor}</td>
                                <td>${course.duration}</td>
                                <td>${course.level}</td>
                                <td>${course.fee}</td>
                            </tr>
                        `;
                    });
                    table += `</table>`;

                    // Send the table as a response
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(table);
                });
            }
        } else if (req.method === 'POST') {
            if (pathname === '/courses') {
                // Insert a new course
                var body = '';
                req.on('data', function(chunk) {
                    body += chunk.toString();
                });
                req.on('end', function() {
                    var course = querystring.parse(body);
                    var insertQuery = 'INSERT INTO course (name, instructor, duration, level, fee) VALUES (?, ?, ?, ?, ?)';
                    connection.query(insertQuery, [course.name, course.instructor, course.duration, course.level, course.fee], function(error, results, fields) {
                        if (error) {
                            console.error('Error inserting data: ' + error.stack);
                            res.writeHead(500, {'Content-Type': 'text/plain'});
                            res.end('Error inserting data into database');
                            return;
                        }
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('Course added successfully');
                    });
                });
            }
        } else if (req.method === 'PUT') {
            if (pathname === '/courses/update') {
                // Update course details
                var courseId = reqUrl.query.id;
                var body = '';
                req.on('data', function(chunk) {
                    body += chunk.toString();
                });
                req.on('end', function() {
                    var course = querystring.parse(body);
                    var updateQuery = 'UPDATE course SET name=?, instructor=?, duration=?, level=?, fee=? WHERE id=?';
                    connection.query(updateQuery, [course.name, course.instructor, course.duration, course.level, course.fee, courseId], function(error, results, fields) {
                        if (error) {
                            console.error('Error updating data: ' + error.stack);
                            res.writeHead(500, {'Content-Type': 'text/plain'});
                            res.end('Error updating data in database');
                            return;
                        }
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('Course updated successfully');
                    });
                });
            }
        } else if (req.method === 'DELETE') {
            if (pathname === '/courses/delete') {
                // Delete course by ID
                var courseId = reqUrl.query.id;
                var deleteQuery = 'DELETE FROM course WHERE id = ?';
                connection.query(deleteQuery, [courseId], function(error, results, fields) {
                    if (error) {
                        console.error('Error deleting data: ' + error.stack);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end('Error deleting data from database');
                        return;
                    }
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('Course deleted successfully');
                });
            }
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found');
        }
    });

    // Start the server and listen on port 3000
    server.listen(3000, function() {
        console.log('Server is listening on port 3000');
    });
}

const express = require('express');
const emailVerifierRouter = require('./routes/email-verifier');
const emailFinderRoute = require('./routes/email-finder');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use the email verifier router
app.use('/email-verifier', emailVerifierRouter);
app.use('/email-finder', emailFinderRoute);

// Endpoint to serve the tracking pixel
app.get('/tracking-pixel.png', (req, res) => {
    const email = req.query.email;
    console.log(`Tracking email open for: ${email}`);
    
    // Log the tracking data (you can also save this to a database)
    fs.appendFileSync('tracking.log', `Email opened by: ${email} at ${new Date().toISOString()}\n`);

    // Serve the tracking pixel image
    const imgPath = path.join(__dirname, 'tracking-pixel.png');
    res.sendFile(imgPath);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
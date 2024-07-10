const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).send({ error: 'Email parameter is required' });
    }

    try {
        const response = await axios.post('http://37.187.127.75/v0/check_email', 
            { to_email: email }, 
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
            // Determine the score based on the status
            let score;
            if (response.data.is_reachable === 'safe') {
                score = 97;
            } else if (response.data.is_reachable === 'risky') {
                score = 80;
            } else {
                score = 0;
            }

            // Transform the response data to match the desired format
            const data = {
                status: response.data.is_reachable,
                email: response.data.input,
                score: score,
                catch_all: response.data.smtp.is_catch_all,
                valid_syntax: response.data.syntax.is_valid_syntax,
                mx_records: response.data.mx.accepts_mail,
                smtp_server: response.data.smtp.can_connect_smtp,
                full_inbox: response.data.smtp.has_full_inbox,
                disposable: response.data.misc.is_disposable,
                role_account: response.data.misc.is_role_account,
            };

            // Send the transformed data as the response
            res.json(data);
        } else {
            res.status(response.status).send(response.data);
        }
    } catch (error) {
        console.error(`Request failed for ${email}:`, error);
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
});

module.exports = router;

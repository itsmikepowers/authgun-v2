const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', async (req, res) => {
    const { firstName, lastName, domainName } = req.query;

    if (!firstName || !lastName || !domainName) {
        return res.status(400).send({ error: 'firstName, lastName, and domainName parameters are required' });
    }

    const cleanedFirstName = firstName.toLowerCase();
    const cleanedLastName = lastName.toLowerCase();
    const cleanedDomainName = domainName.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];

    const generateEmails = (firstName, lastName, domain) => {
        return [
            `${firstName}.${lastName}@${domain}`,
            `${firstName}${lastName}@${domain}`,
            `${firstName[0]}.${lastName}@${domain}`,
            `${firstName[0]}${lastName}@${domain}`,
            `${firstName[0]}${lastName[0]}@${domain}`,
            `${firstName}${lastName[0]}@${domain}`,
            `${lastName}.${firstName}@${domain}`,
            `${lastName}${firstName}@${domain}`,
            `${lastName}.${firstName[0]}@${domain}`,
            `${firstName}.${lastName[0]}@${domain}`,
            `${firstName[0]}.${lastName[0]}@${domain}`,
            `${lastName}${firstName[0]}@${domain}`,
            `${lastName[0]}.${firstName}@${domain}`,
            `${lastName[0]}${firstName}@${domain}`,
            `${firstName}@${domain}`
        ];
    };

    const checkEmail = async (email) => {
        const url = 'http://37.187.127.75/v0/check_email';
        const payload = { to_email: email };
        const headers = { 'Content-Type': 'application/json' };

        try {
            const response = await axios.post(url, payload, { headers });
            return response.data;
        } catch (error) {
            console.error(`Request failed for ${email}:`, error.message);
            return null;
        }
    };

    const emails = generateEmails(cleanedFirstName, cleanedLastName, cleanedDomainName);

    const allResponses = [];
    const safeResponses = [];
    const otherResponses = [];
    let foundSafeEmail = false;

    for (const email of emails) {
        const response = await checkEmail(email);
        if (response) {
            if (response.is_reachable === "safe") {
                safeResponses.push(response);
                foundSafeEmail = true;
                break;
            } else {
                otherResponses.push(response);
            }
        }
    }

    if (!foundSafeEmail) {
        for (const email of emails.slice(allResponses.length)) {
            const response = await checkEmail(email);
            if (response) {
                otherResponses.push(response);
            }
        }
    }

    allResponses.push(...safeResponses, ...otherResponses);

    res.json(allResponses);
});

module.exports = router;

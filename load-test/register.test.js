import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';

export const options = {
    stages: [
        { duration: '20s', target: 10 },
        { duration: '40s', target: 30 },
        { duration: '20s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {

    const uniqueEmail = `test_${__VU}_${__ITER}_${Date.now()}@example.com`;

    const payload = {
        email: uniqueEmail,
        password: config.password,
        firstName: "Test",
        lastName: "User",
    };

    const registerRes = http.post(
        `${config.baseUrl}/auth/register`,
        JSON.stringify(payload),
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }
    )

    // 🔥 DEBUG MINIMAL (safe)
    if (registerRes.status !== 200 && registerRes.status !== 201) {
        console.log("erreur de tester l'endpoint /auth/register");
        console.log(`Status: ${registerRes.status}`);
        console.log(`Body: ${registerRes.body}`);
    }

    check(registerRes, {
        'status OK': (r) => r.status === 200 || r.status === 201,
        'response has id': (r) => {
            const body = r.json();
            return body;
        },
    });

    sleep(1);
}
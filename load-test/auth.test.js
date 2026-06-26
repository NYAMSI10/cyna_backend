import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';

export const options = {
    stages: [
        { duration: '20s', target: 10 },  // Montée en charge progressive
        { duration: '40s', target: 30 },  // Palier de charge stable
        { duration: '20s', target: 0 },   // Descente progressive
    ],
    thresholds: {
        http_req_duration: ['p(95)<800'], // 95% des logins doivent répondre en moins de 800ms
        http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs HTTP autorisées
    },
};

export default function () {
    // 1. REQUÊTE DE LOGIN UNIQUEMENT
    const loginRes = http.post(
        `${config.baseUrl}/auth/login`,
        JSON.stringify({
            email: config.email,
            password: config.password,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }
    );

    let jsonBody = null;
    try {
        // k6 parse le JSON en gérant automatiquement la compression (gzip)
        jsonBody = loginRes.json(); 
    } catch (e) {
        console.log(`[ERREUR JSON] Statut HTTP: ${loginRes.status}. Impossible de parser le Body.`);
    }

    // 🔥 DEBUG : Si le HTTP est OK (200) mais que le contenu n'est pas celui attendu
    if (loginRes.status === 200 && (!jsonBody || jsonBody.success !== true)) {
        console.log(`[ALERTE RECHUTE API] HTTP 200 reçu mais success n'est pas true ! Body : ${loginRes.body}`);
    }

    // 🔬 VALIDATION DE LA RÉPONSE API
    check(loginRes, {
        'Connexion réussie (HTTP 200/201)': (r) => r.status === 200 || r.status === 201,
        'Statut interne success: true': () => jsonBody !== null && jsonBody.success === true,
        'Le rôle est bien CUSTOMER': () => jsonBody && jsonBody.data && jsonBody.data.user && jsonBody.data.user.role === 'CUSTOMER',
        'Contient un token JWT valide': () => jsonBody && jsonBody.data && typeof jsonBody.data.token === 'string' && jsonBody.data.token.length > 0,
    });

    // ⏱️ Pacing : Pause d'un vrai utilisateur avant la prochaine tentative de login
    sleep(1);
}
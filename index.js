const axios = require('axios');

async function executar() {
    const NINSAUDE_API_KEY = process.env.NINSAUDE_TOKEN;
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
    const MEU_NUMERO = '5561995553393'; 

    try {
        console.log("--- Iniciando Processo de Teste ---");
        const response = await axios.get('https://api.ninsaude.com/v1/agendamentos', {
            headers: { 'Authorization': `Bearer ${NINSAUDE_API_KEY}` }
        });

        const agendamentos = response.data;
        if (!agendamentos || agendamentos.length === 0) {
            console.log("⚠️ Log: A API do Ninsaúde retornou uma lista vazia.");
            return;
        }

        const item = agendamentos[0];
        console.log(`Dados obtidos do paciente: ${item.paciente_nome}`);

        const mensagem = `Olá, ${item.paciente_nome}!\n\nConfirme seu agendamento na Clínica Nest - Intervenção Comportamental em ${item.atendimento_data}, às ${item.atendimento_hora}, pelo link ${item.confirmacao_link}!\n\nAgradecemos desde já!`;

        await axios.post('https://gate.whapi.cloud/messages/text', {
            to: MEU_NUMERO,
            body: mensagem
        }, {
            headers: { 
                'Authorization': `Bearer ${WHAPI_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ SUCESSO: Verifique seu WhatsApp!");
    } catch (error) {
        console.error("❌ ERRO NA EXECUÇÃO:");
        console.error(error.response ? JSON.stringify(error.response.data) : error.message);
    }
}
executar();

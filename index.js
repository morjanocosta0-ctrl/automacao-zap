const axios = require('axios');

async function executar() {
    const NINSAUDE_API_KEY = process.env.NINSAUDE_TOKEN;
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

    try {
        console.log("Conectando ao Ninsaúde...");

        // 1. Busca os agendamentos
        const response = await axios.get('https://api.ninsaude.com/v1/agendamentos', {
            headers: { 'Authorization': `Bearer ${NINSAUDE_API_KEY}` }
        });

        const agendamentos = response.data; 

        if (!agendamentos || agendamentos.length === 0) {
            console.log("Nenhum agendamento encontrado.");
            return;
        }

        // 2. Disparo das mensagens
        for (const item of agendamentos) {
            
            // TRATAMENTO DO TELEFONE: Adiciona o 55 na frente do número (ex: 55619...)
            // Removemos espaços ou parênteses que possam vir da API antes de enviar
            const telefoneLimpo = item.paciente_telefone.replace(/\D/g, '');
            const telefoneWhatsApp = telefoneLimpo.startsWith('55') ? telefoneLimpo : `55${telefoneLimpo}`;

            // Texto formatado conforme seu modelo
            const mensagem = `Olá, ${item.paciente_nome}!\n\nConfirme seu agendamento na Clínica Nest - Intervenção Comportamental em ${item.atendimento_data}, às ${item.atendimento_hora}, pelo link ${item.confirmacao_link}!\n\nAgradecemos desde já!\nQualquer dúvida, estamos à disposição.`;
            
            try {
                await axios.post('https://gate.whapi.cloud/messages/text', {
                    to: telefoneWhatsApp,
                    body: mensagem
                }, {
                    headers: { 
                        'Authorization': `Bearer ${WHAPI_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`✅ Enviado para: ${item.paciente_nome} (${telefoneWhatsApp})`);
            } catch (errorEnvio) {
                console.error(`❌ Erro no paciente ${item.paciente_nome}:`, errorEnvio.message);
            }
        }

    } catch (error) {
        console.error("Erro na integração:", error.message);
    }
}

executar();

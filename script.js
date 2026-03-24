
// --- 1. CONFIGURAÇÕES DE FRETE (BASEADO NO SEU CÓDIGO) ---
const REGIOES_VALORES = {
    "Sudeste": 20.00,
    "Sul": 25.00,
    "Centro-Oeste": 30.00,
    "Nordeste": 35.00,
    "Norte": 45.00
};

const ESTADO_PARA_REGIAO = {
    "SP": "Sudeste", "MG": "Sudeste", "RJ": "Sudeste", "ES": "Sudeste",
    "PR": "Sul", "RS": "Sul", "SC": "Sul",
    "BA": "Nordeste", "PE": "Nordeste", "CE": "Nordeste", "AL": "Nordeste", "MA": "Nordeste", "PB": "Nordeste", "PI": "Nordeste", "RN": "Nordeste", "SE": "Nordeste",
    "AM": "Norte", "PA": "Norte", "AC": "Norte", "AP": "Norte", "RO": "Norte", "RR": "Norte", "TO": "Norte",
    "DF": "Centro-Oeste", "GO": "Centro-Oeste", "MT": "Centro-Oeste", "MS": "Centro-Oeste"
};

const CIDADES_METROPOLITANAS_SP = ["São Paulo", "Guarulhos", "São Bernardo do Campo", "Santo André", "Osasco", "Mogi das Cruzes", "Diadema", "São Caetano do Sul"];
const CIDADES_LITORANEAS_SP = ["Santos", "Guarujá", "Bertioga", "São Vicente", "Praia Grande", "Itanhaém", "Peruíbe", "Caraguatatuba", "Ubatuba", "São Sebastião", "Ilhabela"];

const calcularFrete = (endereco) => {
    const estado = endereco.uf;
    const cidade = endereco.localidade;
    let valorFinal = 0;
    let regra = "";

    if (estado === "SP") {
        const freteBaseSp = REGIOES_VALORES["Sudeste"];
        if (cidade.toLowerCase() === "mogi das cruzes") {
            valorFinal = 0;
            regra = "Frete Grátis (Mogi das Cruzes)";
        } else if (CIDADES_METROPOLITANAS_SP.includes(cidade)) {
            valorFinal = freteBaseSp * 0.50;
            regra = "50% de Desconto (Região Metropolitana)";
        } else if (CIDADES_LITORANEAS_SP.includes(cidade)) {
            valorFinal = freteBaseSp * 0.60;
            regra = "40% de Desconto (Região Litorânea)";
        } else {
            valorFinal = freteBaseSp;
            regra = "Valor Fixo (Sudeste/SP Interior)";
        }
    } else {
        const regiao = ESTADO_PARA_REGIAO[estado];
        valorFinal = REGIOES_VALORES[regiao] || 0;
        regra = `Valor Fixo (Região ${regiao})`;
    }

    document.getElementById("frete_valor").innerText = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById("frete_info").innerText = regra;
}

const preencherFormulario = (endereco) => {
    document.getElementById("rua").value = endereco.logradouro;
    document.getElementById("bairro").value = endereco.bairro;
    document.getElementById("cidade").value = endereco.localidade;
    document.getElementById("estado").value = endereco.uf;
    calcularFrete(endereco);
}

const pesquisarCep = async () => {
    const cep = document.getElementById("cep").value.replace("-", "").trim();
    if (cep.length === 8 && /^[0-9]+$/.test(cep)) {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        try {
            const dados = await fetch(url);
            const endereco = await dados.json();
            if (endereco.hasOwnProperty('erro')) {
                alert("CEP não encontrado!");
            } else {
                preencherFormulario(endereco);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    }
}

// --- 2. INTEGRAÇÃO DA API DE ECONOMIA (DÓLAR) ---
let cotacaoDolar = 0;

const atualizarPrecosReal = () => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const usdPriceElement = card.querySelector('.usd-price');
        const brlPriceElement = card.querySelector('.brl-price');
        const usdValue = parseFloat(usdPriceElement.getAttribute('data-usd'));
        
        if (cotacaoDolar > 0) {
            const brlValue = usdValue * cotacaoDolar;
            brlPriceElement.innerText = brlValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    });
}

const buscarCotacaoDolar = async () => {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        const data = await response.json();
        const economia = data.USDBRL;
        
        cotacaoDolar = parseFloat(economia.bid);
        
        // Atualiza os campos de cotação no topo
        document.getElementById("valorDolar").innerHTML = `R$ ${cotacaoDolar.toFixed(2)}`;
        document.getElementById("maiorValor").innerHTML = `R$ ${parseFloat(economia.high).toFixed(2)}`;
        document.getElementById("menorValor").innerHTML = `R$ ${parseFloat(economia.low).toFixed(2)}`;
        
        // Atualiza os preços dos produtos
        atualizarPrecosReal();
        
    } catch (error) {
        console.error("Erro ao buscar cotação do dólar:", error);
        document.getElementById("valorDolar").innerText = "Erro ao carregar";
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona evento de busca de CEP
    const inputCep = document.getElementById("cep");
    if (inputCep) {
        inputCep.addEventListener("focusout", pesquisarCep);
    }
    
    // Busca cotação inicial e inicia loop de atualização (a cada 10s conforme meta tag do seu código)
    buscarCotacaoDolar();
    setInterval(buscarCotacaoDolar, 10000);
});

// Faz o ícone do header dar foco no input de CEP ao ser clicado
document.addEventListener('DOMContentLoaded', () => {
    const btnCepHeader = document.getElementById("btn-cep-header");
    const inputCep = document.getElementById("cep");

    if (btnCepHeader && inputCep) {
        btnCepHeader.addEventListener("click", (e) => {
            // Opcional: Se quiser que o foco aconteça após a rolagem
            setTimeout(() => {
                inputCep.focus();
            }, 500); // 500ms é o tempo médio da animação de rolagem
        });
    }
});

document.querySelectorAll('.carousel-container').forEach(container => {
    const prevBtn = container.querySelector('.btn-prev');
    const nextBtn = container.querySelector('.btn-next');
    const items = container.querySelector('.carousel-items');

    if (prevBtn && nextBtn && items) {
        nextBtn.onclick = () => {
            // Desliza a largura de um card visível
            const scrollAmount = items.querySelector('.carousel-item-custom').offsetWidth + 20;
            items.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };
        prevBtn.onclick = () => {
            const scrollAmount = items.querySelector('.carousel-item-custom').offsetWidth + 20;
            items.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        };
    }
});
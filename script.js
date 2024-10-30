const aba = document.querySelector(".aba");
const fundo = document.querySelector(".fundo");
const enviarPara = document.querySelector(".enviarPara");
let nome;
let novaMensagem;
let tipoDeMensagem = "message";
let nomeSelecionado = "Todos"; 
let visibilidade = "público"

function adicionarAba() {
    aba.classList.add("active");
    fundo.classList.remove("invisivel");
}

function removerAba() {
    if (!aba.classList.contains("invisivel")) {
        aba.classList.remove("active");
        fundo.classList.add("invisivel");
    }
}

function manterConexao() {
    const novoNome = { name: nome };
    axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4`, novoNome)
        .then(() => console.log("Status enviado com sucesso"))
        .catch(erro => {
            console.error("Erro ao enviar status:", erro);
            if (!erro.response || erro.response.status >= 500) {
                window.location.reload();
            }
        });
}

function registrarNome() {
    let nomeExistente;

    axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4")
        .then((resposta) => {
            const participantes = resposta.data;

            do {
                nome = prompt("Insira seu nome");
                
                if (!nome) {
                    alert("Bota um nome ae");
                    const erro = { response: { status: 400, data: "Você deve inserir um nome" } };
                    quandoErro(erro);
                    return registrarNome();
                }
                nomeExistente = participantes.find(participante => participante.name === nome);

                if (nomeExistente) {
                    alert("Nome já registrado! Escolha outro nome.");
                    const erro = { response: { status: 400, data: "Nome já registrado!" } };
                    quandoErro(erro);
                }

            } while (nomeExistente);

            const novoNome = { name: nome };

            axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4", novoNome)
                .then(() => {
                    console.log("Nome registrado:", nome);
                    setInterval(manterConexao, 5000);
                    setInterval(buscarMensagens, 3000);
                    setInterval(mostrarUsuarios, 3000);
                })
                .catch(quandoErro); 
                
        })
        .catch(quandoErro);
}
registrarNome();

function quandoErro(erro) {
    console.error("Erro:", erro.response ? erro.response.data : erro);
}

function adicionarNovaMensagem() {
    const ul = document.querySelector("ul");
    novaMensagem = document.querySelector("input").value; 
    
    if (novaMensagem) {
        const objetoMensagem = {
            from: nome,
            to: nomeSelecionado,
            text: novaMensagem,
            type: tipoDeMensagem 
        };

        axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4", objetoMensagem)
            .then(() => {
                console.log("Mensagem enviada.", novaMensagem);
                buscarMensagens();
            })
            .catch(quandoErro);

        document.querySelector("input").value = ""; 
    }
}

document.querySelector("input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        adicionarNovaMensagem();
    }
});

function formatarHorario(horarioString) {
    const [horas, minutos] = horarioString.split(":").map(Number);
    const data = new Date(Date.UTC(1970, 0, 1, horas, minutos));
    

    const horasLocal = data.getHours().toString().padStart(2, '0');
    const minutosLocal = data.getMinutes().toString().padStart(2, '0');

    return `${horasLocal}:${minutosLocal}`;
}

function buscarMensagens() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4")
        .then((resposta) => {
            const mensagens = resposta.data;
            const ul = document.querySelector("ul");
            
            const mensagensAnteriores = ul.innerHTML;

            ul.innerHTML = ""; 

            mensagens.forEach(mensagem => {
                const horarioLocal = formatarHorario(mensagem.time);  
                if(mensagem.type === "status"){   
                    ul.innerHTML += `
                        <li class="status">
                            <span>
                                <span class="time">(${horarioLocal})</span>
                                <strong>${mensagem.from}</strong> 
                                ${mensagem.text}
                            </span>
                        </li>
                    `
                } 

                else if (mensagem.type === "private_message") {
                    if (mensagem.from === nome || mensagem.to === nome) {
                        ul.innerHTML += `
                        <li class="privado">
                          <span>
                                <span class="time">(${horarioLocal})</span>
                                <strong>${mensagem.from}</strong> 
                                reservadamente para <strong>${mensagem.to}:</strong> ${mensagem.text}
                           </span>
                        </li>
                    `
                    }
                }         
                
                else {
                    ul.innerHTML += `
                        <li>
                            <span>
                                <span class="time">(${horarioLocal})</span>
                                <strong>${mensagem.from}</strong> 
                                para <strong>${mensagem.to}:</strong> ${mensagem.text}
                           </span>
                        </li>
                   `;
                }
            });

            if (ul.innerHTML !== mensagensAnteriores) {
                const lastMessage = ul.lastElementChild;
                if (lastMessage) {
                    lastMessage.scrollIntoView({ behavior: 'smooth' });
                }
            }

        })
        .catch(quandoErro);
}
buscarMensagens()

let selecionadoAnterior1 = null;
let selecionadoAnterior2 = null;

function adicionarCheck1(selecionado) {

    if(selecionadoAnterior1) {
        const iconeAnterior = selecionadoAnterior1.querySelector("ion-icon[name='checkmark-sharp']");
        iconeAnterior.remove()
    }
    const icone = document.createElement("ion-icon");
    icone.setAttribute("name", "checkmark-sharp");
    icone.classList.add("check");

    selecionado.appendChild(icone)
    selecionadoAnterior1 = selecionado

    nomeSelecionado = selecionado.querySelector("span").textContent;

    enviarPara.innerHTML = `Enviando para ${nomeSelecionado} (${visibilidade})`;
}

function adicionarCheck2(selecionado) {

    if(selecionadoAnterior2) {
        const iconeAnterior = selecionadoAnterior2.querySelector("ion-icon[name='checkmark-sharp']");
        iconeAnterior.remove()
    }
    const icone = document.createElement("ion-icon");
    icone.setAttribute("name", "checkmark-sharp");
    icone.classList.add("check");

    selecionado.appendChild(icone)
    selecionadoAnterior2 = selecionado
}

function mostrarUsuarios() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/9eafcf41-7c4f-4645-a4d5-0e804b83e1a4")
        .then((resposta) => {
            const participantes = resposta.data;
            const ul = document.querySelector(".usuarios");

            ul.innerHTML = ""; 

            participantes.forEach(participante => {
                const li = document.createElement("li");
                li.classList.add("usuario");
                li.setAttribute("onclick", "adicionarCheck1(this)");

                if (participante.name === nome){
                    li.innerHTML = `
                    <ion-icon name="person-circle" class="icone1"></ion-icon>
                    <span class="voce">${participante.name} <p> (você) <p></span>
                `;
                } else {
                    li.innerHTML = `
                        <ion-icon name="person-circle" class="icone1"></ion-icon>
                        <span>${participante.name}</span>
                `;
                }

                if (participante.name === nomeSelecionado) {
                    adicionarCheck1(li);
                }

                ul.appendChild(li);
            });
            
        })
        .catch(quandoErro);
}
mostrarUsuarios()

function escolherVisibilidade() {
    const ul = document.querySelector(".pubOuRes");
    ul.innerHTML = `
        <li class="publico" onclick="selecionarVisibilidade('message', this)">
            <ion-icon name="lock-open" class="icone1"></ion-icon>
            <span>Público</span>
        </li>
        <li class="reservado" onclick="selecionarVisibilidade('private_message', this)">
            <ion-icon name="lock-closed" class="icone1"></ion-icon>
            <span>Reservado</span>
        </li>
    `;
}
escolherVisibilidade();

function selecionarVisibilidade(tipo, elemento) {
    tipoDeMensagem = tipo; 
    adicionarCheck2(elemento);

    if (tipoDeMensagem === "message") {
        visibilidade = "público"
    } else if (tipoDeMensagem === "private_message"){
        visibilidade = "reservadamente"
    }

    enviarPara.innerHTML = `Enviando para ${nomeSelecionado} (${visibilidade})`;
}

const enviandoPara = () => enviarPara.innerHTML = `Enviando para ${nomeSelecionado} (${visibilidade})`;
enviandoPara();




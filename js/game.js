class Game {
    constructor() {
        this.personagem = "";
        this.personagemImagem = "";
        this.vidaJogador = 3;
        this.vidaIA = 3;
        this.vidaMaxima = 3;
        this.turno = 1;
        this.ignorouDano = false;
        this.danoCausado = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('iniciarBtn')?.addEventListener('click', () => this.irParaEscolha());
        document.getElementById('confirmarDadoBtn')?.addEventListener('click', () => this.processarAtaqueJogador());
        document.getElementById('continuarTurnoBtn')?.addEventListener('click', () => this.finalizarTurno());
        document.getElementById('sortearRecompensaBtn')?.addEventListener('click', () => this.sortearRecompensa());
        document.getElementById('reiniciarBtn')?.addEventListener('click', () => this.reiniciarJogo());
    }

    irParaEscolha() {
        document.getElementById("inicio").classList.add("hidden");
        document.getElementById("escolha").classList.remove("hidden");
    }

    escolher(p, imagemSrc) {
        this.personagem = p;
        this.personagemImagem = imagemSrc;
        document.getElementById("escolha").classList.add("hidden");
        document.getElementById("combate").classList.remove("hidden");
        
        // Define a imagem do personagem
        const playerCharacter = document.getElementById("playerCharacter");
        playerCharacter.src = imagemSrc;
        
        
        // Atualiza HUD de vida do jogador
        const nomeJogador = document.getElementById("nomeJogador");
        const fotoJogador = document.getElementById("fotoJogador");
        if (nomeJogador) nomeJogador.textContent = p;
        if (fotoJogador) {
            const hudImgSrc = `Imgs/Player/HUD/${p}.png`;
            fotoJogador.src = hudImgSrc;
            // Remover quaisquer ajustes manuais anteriores
            fotoJogador.style.objectPosition = "";
            fotoJogador.style.transform = "";
        }
        
        // Mostrar ou esconder o slot do dado extra
        const dadoHackerCol = document.getElementById("dadoHackerCol");
        if (dadoHackerCol) {
            if (p === "AAA-404") {
                dadoHackerCol.style.display = "flex"; // mostra D12 acima
            } else {
                dadoHackerCol.style.display = "none";
            }
        }
        
        this.atualizarBarrasVida();
    }

    atualizarBarrasVida() {
        const porcentagemVidaJogador = (this.vidaJogador / this.vidaMaxima) * 100;
        const porcentagemVidaIA = (this.vidaIA / this.vidaMaxima) * 100;
        
        document.getElementById("vidaJogador").textContent = this.vidaJogador;
        document.getElementById("vidaIA").textContent = this.vidaIA;
        
        document.getElementById("vidaJogadorBarra").style.width = `${porcentagemVidaJogador}%`;
        document.getElementById("vidaIABarra").style.width = `${porcentagemVidaIA}%`;
    }

    processarAtaqueJogador() {
        let dado = parseInt(document.getElementById("dado").value);
        let nivelBonus = parseInt(document.getElementById("nivelInput")?.value || '0');
        let bonusD20 = parseInt(document.getElementById("bonusInput")?.value || '0');
        let ataqueTotal = dado + (isNaN(nivelBonus) ? 0 : nivelBonus) + (isNaN(bonusD20) ? 0 : bonusD20);
        let mensagemCentral = '';
        let tipoMensagem = '';
        let acertou = false;
        let dano = 1; // Dano padrão

        // Verifica acerto crítico
        if (dado === 20) {
            dano = 2;
            mensagemCentral = `ACERTO CRÍTICO! (D20: ${dado} + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})`;
            acertou = true;
        } else if (this.personagem === "DeadScope") {
            ataqueTotal = dado + 3 + (isNaN(nivelBonus) ? 0 : nivelBonus) + (isNaN(bonusD20) ? 0 : bonusD20);
            if (ataqueTotal >= 11) acertou = true;
            mensagemCentral = acertou ? `DeadScope acertou! (D20: ${dado} + 3 + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})` : `DeadScope errou. (D20: ${dado} + 3 + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})`;
        } else if (this.personagem === "AAA-404") {
            let dadoHacker = parseInt(document.getElementById("dadoHacker").value);
            ataqueTotal = dado + dadoHacker + (isNaN(nivelBonus) ? 0 : nivelBonus) + (isNaN(bonusD20) ? 0 : bonusD20);
            if (ataqueTotal >= 24) acertou = true;
            mensagemCentral = acertou ? `AAA-404 acertou! (D20: ${dado} + D12: ${dadoHacker} + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})` : `AAA-404 errou. (D20: ${dado} + D12: ${dadoHacker} + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})`;
        } else if (this.personagem === "Naya") {
            if (ataqueTotal >= 13) acertou = true;
            mensagemCentral = acertou ? `Naya acertou! (D20: ${dado} + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})` : `Naya errou. (D20: ${dado} + Nivel: ${nivelBonus} + Bonus: ${isNaN(bonusD20)?0:bonusD20} = ${ataqueTotal})`;
        }

        if (acertou) {
            this.vidaIA -= dano;
            this.danoCausado += dano;
            tipoMensagem = 'acerto';
            this.mostrarDanoIA();
        } else {
            tipoMensagem = 'erro';
        }
        this.exibirMensagemCentral(mensagemCentral, tipoMensagem);
        const resultadoJogador = document.getElementById("resultadoJogador");
        if (resultadoJogador) resultadoJogador.classList.add("hidden");
        this.atualizarBarrasVida();
        // Se a vida do jogador ou da IA chegou a 0, termina com delay para animação
        if (this.vidaJogador <= 0 || this.vidaIA <= 0) {
            setTimeout(() => this.encerrarJogo(), 2000);
            return;
        }
        // Exibir animação de dados antes do ataque da IA
        setTimeout(() => {
            // Só deixa a IA atacar se ela ainda tiver vida
            if (this.vidaIA > 0) {
                this.animarDadosIA(() => this.iniciarAtaqueIA());
            }
        }, 2000);
    }

    animarDadosIA(callback) {
        const diceEl = document.getElementById('diceAnimation');
        if (!diceEl) { callback(); return; }
        diceEl.classList.remove('hidden');
        let interval;
        let count = 0;
        interval = setInterval(() => {
            diceEl.textContent = Math.ceil(Math.random() * 6);
            count++;
            if (count > 10) {
                clearInterval(interval);
                diceEl.classList.add('hidden');
                diceEl.textContent = '';
                if (callback) callback();
            }
        }, 80);
    }

    exibirMensagemCentral(mensagem, tipo, onHide) {
        const el = document.getElementById('playerAttackMessage');
        if (!el) return;
        el.textContent = mensagem;
        el.className = `player-attack-message ${tipo}`;
        el.classList.remove('hidden');
        if (this._timeoutMsg) clearTimeout(this._timeoutMsg);
        this._timeoutMsg = setTimeout(() => {
            el.classList.add('hidden');
            if (onHide) onHide();
        }, 2000);
    }

    mostrarDanoIA() {
        const iaNormal = document.getElementById('iaNormal');
        const iaDano = document.getElementById('iaDano');
        
        // Adiciona efeito de glitch na imagem normal
        iaNormal.classList.add('glitch-effect');
        
        // Mostra a imagem de dano
        iaDano.classList.add('damage-effect');
        
        // Remove os efeitos após a animação
        setTimeout(() => {
            iaNormal.classList.remove('glitch-effect');
            iaDano.classList.remove('damage-effect');
        }, 500);
    }

    iniciarAtaqueIA() {
        // Simula a rolagem do dado da IA
        const ataqueIA = Math.ceil(Math.random() * 20); // D20
        let mensagemCentral = '';
        let tipoMensagem = '';
        let resultadoIA = '';
        let dano = 1; // Dano padrão
        const playerCharacter = document.getElementById('playerCharacter');
        const diceEl = document.getElementById('diceAnimation');

        // Verifica acerto crítico da IA
        if (ataqueIA === 20) {
            dano = 2;
            if (this.personagem === "Assassina" && !this.ignorouDano) {
                this.ignorouDano = true;
                resultadoIA = "Você evitou o ataque crítico! (Habilidade da Assassina)";
                mensagemCentral = resultadoIA;
                tipoMensagem = 'acerto';
            } else {
                this.vidaJogador -= dano;
                resultadoIA = "ACERTO CRÍTICO DA IA! (D20: " + ataqueIA + ")";
                mensagemCentral = resultadoIA;
                tipoMensagem = 'erro';
                if (playerCharacter) {
                    playerCharacter.classList.add('damage-effect');
                    setTimeout(() => {
                        playerCharacter.classList.remove('damage-effect');
                    }, 500);
                }
            }
        } else if (ataqueIA >= 13) {
            if (this.personagem === "Assassina" && !this.ignorouDano) {
                this.ignorouDano = true;
                resultadoIA = "Você evitou o ataque! (Habilidade da Assassina)";
                mensagemCentral = resultadoIA;
                tipoMensagem = 'acerto';
            } else {
                this.vidaJogador -= dano;
                resultadoIA = "A IA te acertou! (D20: " + ataqueIA + ")";
                mensagemCentral = resultadoIA;
                tipoMensagem = 'erro';
                if (playerCharacter) {
                    playerCharacter.classList.add('damage-effect');
                    setTimeout(() => {
                        playerCharacter.classList.remove('damage-effect');
                    }, 500);
                }
            }
        } else {
            resultadoIA = "A IA errou o ataque! (D20: " + ataqueIA + ")";
            mensagemCentral = resultadoIA;
            tipoMensagem = 'acerto';
        }
        // Esconde mensagem antiga da IA
        const resultadoIAEl = document.getElementById("resultadoIA");
        if (resultadoIAEl) resultadoIAEl.classList.add("hidden");
        // Exibe o número sorteado da IA
        if (diceEl) {
            diceEl.textContent = ataqueIA;
            diceEl.classList.remove('hidden');
        }
        // Exibe mensagem centralizada da IA após a do jogador
        setTimeout(() => {
            this.exibirMensagemCentral(mensagemCentral, tipoMensagem, () => {
                // Esconde o número sorteado da IA após a mensagem sumir
                if (diceEl) {
                    diceEl.classList.add('hidden');
                    diceEl.textContent = '';
                }
            });
            this.atualizarBarrasVida();
            // Verifica se o jogador ou a IA foram derrotados
            if (this.vidaJogador <= 0 || this.vidaIA <= 0) {
                this.encerrarJogo();
            } else {
                setTimeout(() => {
                    if (resultadoIAEl) resultadoIAEl.classList.add("hidden");
                    this.turno++;
                    document.getElementById("numeroTurno").textContent = this.turno;
                }, 2000);
            }
        }, 0);
    }

    finalizarTurno() {
        this.turno++;
        document.getElementById("numeroTurno").textContent = this.turno;
        if (this.vidaJogador <= 0 || this.vidaIA <= 0) {
            this.encerrarJogo();
        } else {
            // Prepara próximo turno
            document.getElementById("faseIA")?.classList.add("hidden");
            document.getElementById("faseJogador")?.classList.remove("hidden");
            document.getElementById("resultadoJogador")?.classList.add("hidden");
            document.getElementById("dadoIA")?.classList.add("hidden");
            document.getElementById("resultadoIA")?.classList.add("hidden");
            document.getElementById("continuarTurnoBtn")?.classList.add("hidden");
        }
    }

    encerrarJogo() {
        // Esconder qualquer mensagem central de erro/acerto
        const playerAttackMessage = document.getElementById('playerAttackMessage');
        if (playerAttackMessage) playerAttackMessage.classList.add('hidden');
        document.getElementById("combate").classList.add("hidden");
        document.getElementById("resultado").classList.remove("hidden");
        // Esconde o botão de recompensa
        const btnRecompensa = document.getElementById("sortearRecompensaBtn");
        if (btnRecompensa) btnRecompensa.style.display = "none";
        // Exibe título e mensagem hacker customizada
        const resultadoFinal = document.getElementById("resultadoFinal");
        const recompensaElement = document.getElementById("recompensa");
        if (this.vidaIA <= 0) {
            resultadoFinal.textContent = "Missão concluída com Sucesso!";
            recompensaElement.innerHTML = `<pre>\t&gt; EVA: NEUTRALIZADA [STATUS TEMPORÁRIO]\n\t&gt; Acesso à garra autorizado.\n\t&gt; Recupere seu prêmio antes que o sistema reinicie.</pre>`;
            recompensaElement.classList.remove("hidden");
        } else {
            resultadoFinal.textContent = "Missão FALHOU";
            recompensaElement.innerHTML = `<pre>\t&gt; EVA: STATUS - ATIVA\n\t&gt; Tentativa de invasão: FALHA\n\t&gt; Permissão parcial concedida: roll_d4()</pre>`;
            recompensaElement.classList.remove("hidden");
        }
        // Não exibe mais estatísticas
        // document.getElementById("turnosJogados").textContent = this.turno;
        // document.getElementById("danoCausado").textContent = this.danoCausado;
        // Atualiza as barras de vida uma última vez
        this.atualizarBarrasVida();
    }

    sortearRecompensa() {
        const itens = ["Print A5", "Print A4", "Botton", "Chaveiro"];
        const item = this.vidaIA <= 0 
            ? itens[Math.floor(Math.random() * itens.length)] 
            : "Você pode escolher um adesivo.";
        
        const recompensaElement = document.getElementById("recompensa");
        recompensaElement.textContent = `Sua recompensa: ${item}`;
        recompensaElement.classList.remove("hidden");
    }

    reiniciarJogo() {
        // Resetar todas as variáveis
        this.personagem = "";
        this.personagemImagem = "";
        this.vidaJogador = 3;
        this.vidaIA = 3;
        this.turno = 1;
        this.ignorouDano = false;
        this.danoCausado = 0;
        // Resetar interface
        document.getElementById("numeroTurno").textContent = "1";
        document.getElementById("vidaJogador").textContent = "3";
        document.getElementById("vidaIA").textContent = "3";
        document.getElementById("vidaJogadorBarra").style.width = "100%";
        document.getElementById("vidaIABarra").style.width = "100%";
        // Limpar HUD do jogador
        const nomeJogador = document.getElementById("nomeJogador");
        const fotoJogador = document.getElementById("fotoJogador");
        if (nomeJogador) nomeJogador.textContent = "Jogador";
        if (fotoJogador) fotoJogador.src = "Imgs/Player/HUD/AAA-404.png";
        // Limpar resultados anteriores
        document.getElementById("recompensa").classList.add("hidden");
        document.getElementById("resultadoJogador")?.classList.add("hidden");
        document.getElementById("resultadoIA")?.classList.add("hidden");
        // Esconder todas as seções exceto a inicial
        document.getElementById("resultado").classList.add("hidden");
        document.getElementById("combate").classList.add("hidden");
        document.getElementById("escolha").classList.add("hidden");
        document.getElementById("inicio").classList.remove("hidden");
        // Limpar imagem do personagem
        document.getElementById("playerCharacter").src = "";
        // Esconder slot do dado extra
        const dadoHackerContainer = document.getElementById("dadoHackerContainer");
        if (dadoHackerContainer) dadoHackerContainer.style.display = "none";
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
}); 
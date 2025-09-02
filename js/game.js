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
        document.getElementById('attackBtn')?.addEventListener('click', () => this.processarAtaqueJogador());
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
        if (fotoJogador) fotoJogador.src = imagemSrc;
        
        // Mostrar ou esconder a caixa D12 baseado no personagem
        const hackerDiceContainer = document.querySelector('.hacker-only');
        if (hackerDiceContainer) {
            hackerDiceContainer.style.display = p === "Hacker" ? "flex" : "none";
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
        // Desabilita o botão durante o ataque
        const attackBtn = document.getElementById('attackBtn');
        if (attackBtn) attackBtn.disabled = true;
        
        if (this.personagem === "Hacker") {
            // Lógica especial para o Hacker: duas animações sequenciais
            this.animarDadosJogador(() => {
                // Após D20, anima o D12
                this.animarDadosHacker(() => {
                    this.processarResultadoHacker();
                });
            });
        } else {
            // Para outros personagens: animação normal
            this.animarDadosJogador(() => {
                this.processarResultadoNormal();
            });
        }
    }

    processarResultadoNormal() {
        // Pega o resultado do D20 que foi mostrado na caixa
        let dado = parseInt(document.getElementById('playerDiceAnimation').textContent);
        let ataqueTotal = dado;
        let mensagemCentral = '';
        let tipoMensagem = '';
        let acertou = false;
        let dano = 1; // Dano padrão

        // Verifica acerto crítico
        if (dado === 20) {
            dano = 2;
            mensagemCentral = `ACERTO CRÍTICO! (D20: ${dado})`;
            acertou = true;
        } else if (this.personagem === "Sniper") {
            ataqueTotal = dado + 3;
            if (ataqueTotal >= 11) acertou = true;
            mensagemCentral = acertou ? `Sniper acertou! (D20: ${dado} + 3 = ${ataqueTotal})` : `Sniper errou. (D20: ${dado} + 3 = ${ataqueTotal})`;
        } else if (this.personagem === "Assassina") {
            if (dado >= 13) acertou = true;
            mensagemCentral = acertou ? `Assassina acertou! (D20: ${dado})` : `Assassina errou. (D20: ${dado})`;
        }

        this.finalizarAtaque(acertou, dano, mensagemCentral);
    }

    processarResultadoHacker() {
        // Pega os resultados dos dados que foram mostrados nas caixas
        let dadoD20 = parseInt(document.getElementById('playerDiceAnimation').textContent);
        let dadoD12 = parseInt(document.getElementById('playerDiceAnimationHacker').textContent);
        let ataqueTotal = dadoD20 + dadoD12;
        let acertou = ataqueTotal >= 16; // Novo requisito: 16+
        let dano = 1;
        let mensagemCentral = '';

        if (dadoD20 === 20) {
            dano = 2;
            mensagemCentral = `ACERTO CRÍTICO! (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`;
            acertou = true;
        } else {
            mensagemCentral = acertou ? `Hacker acertou! (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})` : `Hacker errou. (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`;
        }

        this.finalizarAtaque(acertou, dano, mensagemCentral);
    }

    finalizarAtaque(acertou, dano, mensagemCentral) {
        let tipoMensagem = acertou ? 'acerto' : 'erro';
        
        if (acertou) {
            this.vidaIA -= dano;
            this.danoCausado += dano;
            this.mostrarDanoIA();
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
        
        // Reabilita o botão após o ataque
        setTimeout(() => {
            const attackBtn = document.getElementById('attackBtn');
            if (attackBtn) attackBtn.disabled = false;
        }, 3000);
        

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

    animarDadosJogador(callback) {
        const diceEl = document.getElementById('playerDiceAnimation');
        if (!diceEl) { callback(); return; }
        diceEl.classList.remove('hidden');
        let interval;
        let count = 0;
        let lastNumber;
        interval = setInterval(() => {
            lastNumber = Math.ceil(Math.random() * 20);
            diceEl.textContent = lastNumber;
            count++;
            if (count > 15) {
                clearInterval(interval);
                // Mantém o último número gerado
                diceEl.textContent = lastNumber;
                if (callback) callback();
            }
        }, 60);
    }

    animarDadosHacker(callback) {
        const diceEl = document.getElementById('playerDiceAnimationHacker');
        if (!diceEl) { callback(); return; }
        diceEl.classList.remove('hidden');
        let interval;
        let count = 0;
        let lastNumber;
        interval = setInterval(() => {
            lastNumber = Math.ceil(Math.random() * 12);
            diceEl.textContent = lastNumber;
            count++;
            if (count > 12) {
                clearInterval(interval);
                // Mantém o último número gerado
                diceEl.textContent = lastNumber;
                if (callback) callback();
            }
        }, 70);
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
            // Limpa as caixas de dados quando a mensagem desaparece
            this.limparCaixasDados();
            if (onHide) onHide();
        }, 2000);
    }

    limparCaixasDados() {
        // Limpa as caixas de dados dos jogadores
        const playerDice = document.getElementById('playerDiceAnimation');
        const playerDiceHacker = document.getElementById('playerDiceAnimationHacker');
        if (playerDice) {
            playerDice.classList.add('hidden');
            playerDice.textContent = '';
        }
        if (playerDiceHacker) {
            playerDiceHacker.classList.add('hidden');
            playerDiceHacker.textContent = '';
        }
        
        // Limpa a caixa de dados da IA
        const iaDice = document.getElementById('diceAnimation');
        if (iaDice) {
            iaDice.classList.add('hidden');
            iaDice.textContent = '';
        }
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
                // Não esconde o número sorteado da IA imediatamente
                // Ele será escondido no próximo turno
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
        if (fotoJogador) fotoJogador.src = "Imgs/Player/Hacker.png";
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
        
        // Esconder o D12 do Hacker
        const hackerDiceContainer = document.querySelector('.hacker-only');
        if (hackerDiceContainer) {
            hackerDiceContainer.style.display = "none";
        }

    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
}); 
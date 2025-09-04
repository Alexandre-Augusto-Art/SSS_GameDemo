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
        this.hackingBonus = 0;
        this.hackingUsesRemaining = 3;
        this.hackingMaxUses = 3;
        this.hackingCritical = false;
        this.currentFloor = 1;
        this.maxFloors = 3;
        this.setupEventListeners();
        this.initializeUI();
    }

    setupEventListeners() {
        // Remove listeners existentes para evitar duplicação
        const iniciarBtn = document.getElementById('iniciarBtn');
        const attackBtn = document.getElementById('attackBtn');
        const reiniciarBtn = document.getElementById('reiniciarBtn');
        const hackBtn = document.getElementById('hackBtn');
        const closeHackingBtn = document.getElementById('closeHackingBtn');
        const proximoAndarBtn = document.getElementById('proximoAndarBtn');

        if (iniciarBtn) {
            iniciarBtn.removeEventListener('click', this.irParaEscolha);
            iniciarBtn.addEventListener('click', () => this.irParaEscolha());
        }

        if (attackBtn) {
            attackBtn.removeEventListener('click', this.processarAtaqueJogador);
            attackBtn.addEventListener('click', () => this.processarAtaqueJogador());
        }

        if (reiniciarBtn) {
            reiniciarBtn.removeEventListener('click', this.reiniciarJogo);
            reiniciarBtn.addEventListener('click', () => this.reiniciarJogo());
        }

        if (hackBtn) {
            hackBtn.removeEventListener('click', this.abrirHacking);
            hackBtn.addEventListener('click', () => this.abrirHacking());
        }

        if (closeHackingBtn) {
            closeHackingBtn.removeEventListener('click', this.fecharHacking);
            closeHackingBtn.addEventListener('click', () => this.fecharHacking());
        }

        if (proximoAndarBtn) {
            proximoAndarBtn.removeEventListener('click', this.proximoAndar);
            proximoAndarBtn.addEventListener('click', () => this.proximoAndar());
        }
    }

    initializeUI() {
        // Garante que o modal de hacking esteja oculto na inicialização
        const hackingModal = document.getElementById('hackingModal');
        if (hackingModal) {
            hackingModal.classList.add('hidden');
        }

        // Adiciona listener para fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('hackingModal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.fecharHacking();
                }
            }
        });

        // Adiciona listener para fechar modal clicando no overlay
        const hackingOverlay = document.querySelector('.hacking-overlay');
        if (hackingOverlay) {
            hackingOverlay.addEventListener('click', () => {
                this.fecharHacking();
            });
        }

        // Inicializa indicadores de uso do hack
        this.updateHackUsesIndicator();
        this.updateBonusIndicator(0); // Garante que o indicador esteja escondido
    }

    updateHackUsesIndicator() {
        for (let i = 1; i <= this.hackingMaxUses; i++) {
            const dot = document.getElementById(`hackUse${i}`);
            if (dot) {
                if (i <= this.hackingUsesRemaining) {
                    dot.classList.remove('used');
                    dot.classList.add('active');
                } else {
                    dot.classList.add('used');
                    dot.classList.remove('active');
                }
            }
        }

        // Atualiza estado do botão
        const hackBtn = document.getElementById('hackBtn');
        if (hackBtn) {
            hackBtn.disabled = this.hackingUsesRemaining <= 0;
        }
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
        
        // Mostrar ou esconder a caixa D12 e botão HACK baseado no personagem
        const hackerElements = document.querySelectorAll('.hacker-only');
        hackerElements.forEach(element => {
            element.style.display = p === "Hacker" ? "flex" : "none";
        });

        // Garante que o botão ATTACK esteja habilitado
        const attackBtn = document.getElementById('attackBtn');
        if (attackBtn) {
            attackBtn.disabled = false;
        }

        // Configura o primeiro inimigo
        document.querySelectorAll('.ia-image, .ia-damage').forEach(img => {
            img.classList.add('hidden');
        });
        document.querySelectorAll('.andar-1').forEach(img => {
            img.classList.remove('hidden');
        });

        // Atualiza nome e ícone do primeiro inimigo
        const nomeIA = document.getElementById("nomeIA");
        const fotoIA = document.getElementById("fotoIA");
        if (nomeIA) nomeIA.textContent = "Drone";
        if (fotoIA) fotoIA.src = "Imgs/Enemy/1-Drone/Drone_GameBattleImg.png";
        
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
        // Verifica se o personagem foi selecionado
        if (!this.personagem) {
            console.error('Nenhum personagem selecionado');
            return;
        }

        // Verifica se o botão já está desabilitado (ataque em andamento)
        const attackBtn = document.getElementById('attackBtn');
        if (attackBtn && attackBtn.disabled) {
            console.log('Ataque já em andamento');
            return;
        }

        // Desabilita o botão durante o ataque
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
        let ataqueTotal = dadoD20 + dadoD12 + this.hackingBonus; // ADICIONA BÔNUS DE HACKING
        let acertou = ataqueTotal >= 16; // Novo requisito: 16+
        let dano = 1;
        let mensagemCentral = '';

        if (dadoD20 === 20 || this.hackingCritical) {
            dano = 2;
            if (dadoD20 === 20) {
                mensagemCentral = this.hackingBonus > 0 
                    ? `ACERTO CRÍTICO! (D20: ${dadoD20} + D12: ${dadoD12} + HACK: ${this.hackingBonus} = ${ataqueTotal})`
                    : `ACERTO CRÍTICO! (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`;
            } else {
                mensagemCentral = this.hackingBonus > 0 
                    ? `HACK PERFEITO! DANO CRÍTICO! (D20: ${dadoD20} + D12: ${dadoD12} + HACK: ${this.hackingBonus} = ${ataqueTotal})`
                    : `HACK PERFEITO! DANO CRÍTICO! (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`;
            }
            acertou = true;
        } else {
            if (this.hackingBonus > 0) {
                mensagemCentral = acertou 
                    ? `Hacker acertou! (D20: ${dadoD20} + D12: ${dadoD12} + HACK: ${this.hackingBonus} = ${ataqueTotal})`
                    : `Hacker errou. (D20: ${dadoD20} + D12: ${dadoD12} + HACK: ${this.hackingBonus} = ${ataqueTotal})`;
            } else {
                mensagemCentral = acertou 
                    ? `Hacker acertou! (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`
                    : `Hacker errou. (D20: ${dadoD20} + D12: ${dadoD12} = ${ataqueTotal})`;
            }
        }

        // Reset do bônus e crítico após uso
        this.hackingBonus = 0;
        this.hackingCritical = false; // Reseta o crítico após o ataque

        this.finalizarAtaque(acertou, dano, mensagemCentral);
    }

    finalizarAtaque(acertou, dano, mensagemCentral) {
        let tipoMensagem = acertou ? 'acerto' : 'erro';
        
        if (acertou) {
            this.vidaIA -= dano;
            this.danoCausado += dano;
            this.mostrarDanoIA();
        }
        
        this.exibirMensagemCentral(mensagemCentral, tipoMensagem, null, true); // true = é resultado de ataque
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
        if (!diceEl) { 
            console.error('Elemento playerDiceAnimation não encontrado');
            if (callback) callback(); 
            return; 
        }
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
        if (!diceEl) { 
            console.error('Elemento playerDiceAnimationHacker não encontrado');
            if (callback) callback(); 
            return; 
        }
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

    exibirMensagemCentral(mensagem, tipo, onHide, isAttackResult = false) {
        const el = document.getElementById('playerAttackMessage');
        if (!el) return;
        el.textContent = mensagem;
        el.className = `player-attack-message ${tipo}`;
        el.classList.remove('hidden');
        if (this._timeoutMsg) clearTimeout(this._timeoutMsg);
        this._timeoutMsg = setTimeout(() => {
            el.classList.add('hidden');
            // Se for resultado de ataque, limpa dados E bônus
            if (isAttackResult) {
                this.limparDadosAposAtaque();
            } else {
                // Senão, limpa apenas os dados
                this.limparCaixasDados();
            }
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

    limparDadosAposAtaque() {
        // Limpa dados normalmente
        this.limparCaixasDados();
        
        // E também esconde o indicador de bônus (só após ataque)
        this.updateBonusIndicator(0);
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

        // Se derrotou o inimigo e não é o último andar, mostra tela de transição
        if (this.vidaIA <= 0 && this.currentFloor < this.maxFloors) {
            document.getElementById("combate").classList.add("hidden");
            document.getElementById("transicao").classList.remove("hidden");
            document.getElementById("mensagemTransicao").textContent = `Parabéns! Seguindo para o Andar ${this.currentFloor + 1}`;
        } else {
            // Se morreu ou é o último andar, mostra tela de resultado final
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
        }
        // Atualiza as barras de vida uma última vez
        this.atualizarBarrasVida();
    }

    proximoAndar() {
        this.currentFloor++;
        
        // Reset das variáveis de combate
        this.vidaJogador = this.vidaMaxima;
        this.vidaIA = this.vidaMaxima;
        this.turno = 1;
        this.ignorouDano = false;
        this.danoCausado = 0;
        
        // Reset do hacking para o novo andar
        this.hackingBonus = 0;
        this.hackingCritical = false;
        this.hackingUsesRemaining = 3;
        this.updateHackUsesIndicator();
        this.updateBonusIndicator(0);
        
        // Esconde tela de transição
        document.getElementById("transicao").classList.add("hidden");
        document.getElementById("combate").classList.remove("hidden");

        // Atualiza inimigo visível
        document.querySelectorAll('.ia-image, .ia-damage').forEach(img => {
            img.classList.add('hidden');
        });
        document.querySelectorAll(`.andar-${this.currentFloor}`).forEach(img => {
            img.classList.remove('hidden');
        });

        // Atualiza nome do inimigo no HUD
        const nomeIA = document.getElementById("nomeIA");
        if (nomeIA) {
            switch(this.currentFloor) {
                case 1: nomeIA.textContent = "Drone"; break;
                case 2: nomeIA.textContent = "K9"; break;
                case 3: nomeIA.textContent = "IA Maligna"; break;
            }
        }

        // Reabilita botões de ação
        const attackBtn = document.getElementById('attackBtn');
        const hackBtn = document.getElementById('hackBtn');
        if (attackBtn) attackBtn.disabled = false;
        if (hackBtn) hackBtn.disabled = false;

        // Limpa mensagens e resultados anteriores
        document.getElementById("resultadoJogador")?.classList.add("hidden");
        document.getElementById("resultadoIA")?.classList.add("hidden");
        const playerAttackMessage = document.getElementById('playerAttackMessage');
        if (playerAttackMessage) playerAttackMessage.classList.add('hidden');

        // Atualiza número do turno
        document.getElementById("numeroTurno").textContent = this.turno;

        // Atualiza barras de vida
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
        this.currentFloor = 1;
        this.hackingCritical = false;
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
        document.getElementById("transicao").classList.add("hidden");
        document.getElementById("inicio").classList.remove("hidden");
        // Limpar imagem do personagem
        document.getElementById("playerCharacter").src = "";
        
        // Esconder o D12 do Hacker
        const hackerElements = document.querySelectorAll('.hacker-only');
        hackerElements.forEach(element => {
            element.style.display = "none";
        });

        // Reset variáveis de hacking
        this.hackingBonus = 0;
        this.hackingUsesRemaining = 3;
        this.updateHackUsesIndicator();
        this.updateBonusIndicator(0); // Esconde o indicador de bônus

        // Garante que o botão ATTACK esteja habilitado
        const attackBtn = document.getElementById('attackBtn');
        if (attackBtn) {
            attackBtn.disabled = false;
        }

        // Reset dos inimigos
        document.querySelectorAll('.ia-image, .ia-damage').forEach(img => {
            img.classList.add('hidden');
        });
        const nomeIA = document.getElementById("nomeIA");
        const fotoIA = document.getElementById("fotoIA");
        if (nomeIA) nomeIA.textContent = "Drone";
        if (fotoIA) fotoIA.src = "Imgs/Enemy/1-Drone/Drone_GameBattleImg.png";
    }

    // === MÉTODOS DO MINI-JOGO DE HACKING ===
    
    abrirHacking() {
        if (this.hackingUsesRemaining <= 0) {
            this.exibirMensagemCentral("Sem usos de hacking restantes!", "erro");
            return;
        }
        
        const modal = document.getElementById('hackingModal');
        modal.classList.remove('hidden');
        this.initHackingGame();
    }

    fecharHacking() {
        const modal = document.getElementById('hackingModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.resetHackingGame();
    }

    initHackingGame() {
        // Constantes do mini-jogo
        this.MATRIX_SIZE = 5;
        this.SEQUENCES = [
            { seq: ['55','1C'], bonus: 3, label: '+3' },
            { seq: ['1C','1C','E9'], bonus: 6, label: '+6' },
            { seq: ['BD','E9','55'], bonus: 9, label: '+9' }
        ];
        this.BUFFER_MAX = 8;
        this.CODES = ['1C','55','BD','E9'];

        // Variáveis de estado
        this.hackBuffer = [];
        this.hackNextKind = 'row';
        this.hackIdx = 0;
        this.hackTime = 30.00;
        this.hackTimeInit = this.hackTime;
        this.hackTimer = null;
        this.hackGameEnded = false;

        this.buildHackMatrix();
        this.highlightHackMatrix();
        this.renderHackSequences();
        this.createHackBufferBoxes();
    }

    buildHackMatrix() {
        const grid = document.getElementById('hackGrid');
        grid.innerHTML = '';
        
        // Matriz fixa do HackingDemo
        const codesArr = [
            ['1C','E9','1C','55','1C'],
            ['E9','55','1C','1C','BD'],
            ['55','BD','1C','BD','55'],
            ['55','1C','55','55','1C'],
            ['E9','1C','1C','1C','55']
        ];

        for(let r = 0; r < this.MATRIX_SIZE; r++) {
            const tr = grid.insertRow();
            for(let c = 0; c < this.MATRIX_SIZE; c++) {
                const td = tr.insertCell();
                td.textContent = codesArr[r][c] || '';
                td.dataset.row = r;
                td.dataset.col = c;
                td.className = 'cell';
                td.addEventListener('click', () => this.onHackPick(td));
                td.addEventListener('mouseenter', () => this.showHackHint(td));
                td.addEventListener('mouseleave', () => this.clearHackHint());
            }
        }
    }

    createHackBufferBoxes() {
        const container = document.getElementById('hackBufferBoxes');
        container.innerHTML = '';
        for(let i = 0; i < this.BUFFER_MAX; i++) {
            const box = document.createElement('div');
            box.className = 'bp-buffer-box';
            box.id = 'hackBuffer' + i;
            box.innerHTML = '&nbsp;';
            container.appendChild(box);
        }
    }

    highlightHackMatrix() {
        const grid = document.getElementById('hackGrid');
        grid.querySelectorAll('td').forEach(td => td.classList.remove('rowOk','colOk'));
        const selector = this.hackNextKind === 'row'
            ? `td[data-row="${this.hackIdx}"]`
            : `td[data-col="${this.hackIdx}"]`;
        grid.querySelectorAll(selector).forEach(td =>
            td.classList.add(this.hackNextKind === 'row' ? 'rowOk' : 'colOk')
        );
    }

    showHackHint(td) {
        this.clearHackHint();
        const r = +td.dataset.row, c = +td.dataset.col;
        if((this.hackNextKind === 'row' && r !== this.hackIdx) || 
           (this.hackNextKind === 'col' && c !== this.hackIdx)) return;

        const futureKind = this.hackNextKind === 'row' ? 'col' : 'row';
        const futureIdx = futureKind === 'row' ? r : c;
        const sel = futureKind === 'row'
            ? `td[data-row="${futureIdx}"]`
            : `td[data-col="${futureIdx}"]`;
        document.getElementById('hackGrid').querySelectorAll(sel).forEach(cell =>
            cell.classList.add(futureKind === 'row' ? 'hintRow' : 'hintCol')
        );
    }

    clearHackHint() {
        document.getElementById('hackGrid').querySelectorAll('.hintRow,.hintCol')
            .forEach(td => td.classList.remove('hintRow','hintCol'));
    }

    startHackTimer() {
        this.hackTimer = setInterval(() => {
            this.hackTime -= 0.01;
            if(this.hackTime < 0) this.hackTime = 0;
            document.getElementById('hackTimerValue').textContent = this.hackTime.toFixed(2);
            document.querySelector('.bp-timer-bar-inner').style.width = (this.hackTime / this.hackTimeInit * 100) + '%';
            if(!this.hackTime) {
                clearInterval(this.hackTimer);
                this.validateHacking();
            }
        }, 10);
    }

    onHackPick(td) {
        if(this.hackGameEnded) return;

        const r = +td.dataset.row, c = +td.dataset.col;
        if((this.hackNextKind === 'row' && r !== this.hackIdx) || 
           (this.hackNextKind === 'col' && c !== this.hackIdx)) return;

        if(!this.hackTimer) this.startHackTimer();
        this.clearHackHint();

        td.classList.add('sel');
        this.hackBuffer.push(td.textContent.trim());
        document.getElementById('hackBuffer' + (this.hackBuffer.length - 1)).textContent = td.textContent.trim();

        this.hackNextKind = this.hackNextKind === 'row' ? 'col' : 'row';
        this.hackIdx = this.hackNextKind === 'row' ? r : c;
        this.highlightHackMatrix();

        if(this.hackBuffer.length === this.BUFFER_MAX) this.validateHacking();
    }

    validateHacking() {
        if(this.hackGameEnded) return;
        this.hackGameEnded = true;
        clearInterval(this.hackTimer);
        this.clearHackHint();

        let completed = 0;
        let completedArr = [];
        let totalBonus = 0;

        for(const [idx, seq] of this.SEQUENCES.entries()) {
            const str = seq.seq.join(',');
            if(this.hackBuffer.join(',').includes(str)) {
                completed++;
                completedArr.push(idx);
                totalBonus += seq.bonus;
            }
        }

        // Dano crítico se completar todas as sequências
        if(completedArr.length === this.SEQUENCES.length) {
            totalBonus += 2;
            this.hackingCritical = true; // Flag para indicar dano crítico
        } else {
            this.hackingCritical = false;
        }

        this.onHackingComplete(totalBonus, completedArr);
    }

    onHackingComplete(bonus, completedArr) {
        this.hackingBonus = bonus;
        this.hackingUsesRemaining--;
        this.updateHackUsesIndicator();

        // Feedback visual
        if(bonus > 0) {
            document.getElementById('hackWinMsg').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('hackWinMsg').classList.add('hidden');
                this.fecharHacking();
                this.mostrarBonusHacking(bonus);
            }, 2000);
        } else {
            document.getElementById('hackFailMsg').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('hackFailMsg').classList.add('hidden');
                this.fecharHacking();
            }, 2000);
        }

        // Atualiza visual das sequências
        document.querySelectorAll('.bp-hack-item').forEach((el, idx) => {
            if(completedArr.includes(idx)) {
                el.classList.add('success-seq');
            } else {
                el.classList.add('failed-seq');
            }
        });
    }

    mostrarBonusHacking(bonus) {
        this.exibirMensagemCentral(`HACKING CONCLUÍDO! Bônus +${bonus} para o próximo ataque!`, "acerto");
        this.updateBonusIndicator(bonus);
    }

    updateBonusIndicator(bonus) {
        const bonusIndicator = document.getElementById('hackBonus');
        if (bonusIndicator) {
            if (bonus > 0) {
                bonusIndicator.textContent = `+${bonus}`;
                bonusIndicator.classList.remove('hidden');
            } else {
                bonusIndicator.classList.add('hidden');
            }
        }
    }

    renderHackSequences() {
        const list = document.getElementById('hackList');
        list.innerHTML = '';
        const icons = [
            '<div style="color: #00fff7; font-size: 1.2em;">▲</div>',
            '<div style="color: #00fff7; font-size: 1.2em;">♦</div>',
            '<div style="color: #00fff7; font-size: 1.2em;">●</div>'
        ];
        const names = ['DATAMINE_V1', 'DATAMINE_V2', 'DATAMINE_V3'];
        const descs = [
            'Execute a weak hack against the enemy (Bonus +3)',
            'Execute a moderate hack against the enemy (Bonus +6)', 
            'Execute a powerful hack against the enemy (Bonus +9)'
        ];

        this.SEQUENCES.forEach((seq, i) => {
            const div = document.createElement('div');
            div.className = 'bp-hack-item';
            div.innerHTML = `
                <div class='bp-hack-seq'>${seq.seq.join(' ')}</div>
                <div class='bp-hack-icon'>${icons[i]}</div>
                <div class='bp-hack-info'>
                    <div class='bp-hack-title'>${names[i]}</div>
                    <div class='bp-hack-desc'>${descs[i]}</div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    resetHackingGame() {
        if(this.hackTimer) {
            clearInterval(this.hackTimer);
            this.hackTimer = null;
        }
        this.hackBuffer = [];
        this.hackNextKind = 'row';
        this.hackIdx = 0;
        this.hackTime = 30.00;
        this.hackGameEnded = false;
        
        // Limpa interface de forma segura
        const hackWinMsg = document.getElementById('hackWinMsg');
        const hackFailMsg = document.getElementById('hackFailMsg');
        const hackTimerValue = document.getElementById('hackTimerValue');
        const timerBarInner = document.querySelector('.bp-timer-bar-inner');
        
        if (hackWinMsg) hackWinMsg.classList.add('hidden');
        if (hackFailMsg) hackFailMsg.classList.add('hidden');
        if (hackTimerValue) hackTimerValue.textContent = '30.00';
        if (timerBarInner) timerBarInner.style.width = '100%';
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
}); 
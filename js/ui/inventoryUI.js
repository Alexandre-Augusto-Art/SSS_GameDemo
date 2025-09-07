// Interface do Inventário
class InventoryUI {
    constructor(inventorySystem) {
        this.inventorySystem = inventorySystem;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inventoryBtn = document.getElementById('inventoryBtn');
        const closeInventoryBtn = document.getElementById('closeInventoryBtn');
        const inventoryModal = document.getElementById('inventoryModal');

        if (inventoryBtn) {
            inventoryBtn.addEventListener('click', () => this.openInventory());
        }

        if (closeInventoryBtn) {
            closeInventoryBtn.addEventListener('click', () => this.closeInventory());
        }

        if (inventoryModal) {
            inventoryModal.addEventListener('click', (e) => {
                if (e.target === inventoryModal || e.target.classList.contains('inventory-overlay')) {
                    this.closeInventory();
                }
            });
        }

        // Configurar drag and drop nos slots de equipamento
        this.setupEquipmentSlotDragDrop();
    }

    setupEquipmentSlotDragDrop() {
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const itemId = e.dataTransfer.getData('text/plain');
                this.equipItemToSlot(itemId, slot.dataset.slot);
            });
        });
    }

    openInventory() {
        const modal = document.getElementById('inventoryModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateInventoryDisplay();
        }
    }

    closeInventory() {
        const modal = document.getElementById('inventoryModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    updateInventoryDisplay() {
        this.updateEquipmentSlots();
        this.updateInventoryGrid();
    }

    updateEquipmentSlots() {
        const equippedItems = this.inventorySystem.getEquippedItems();
        
        Object.keys(equippedItems).forEach(slot => {
            const slotElement = document.getElementById(`${slot}Slot`);
            if (slotElement) {
                slotElement.innerHTML = '';
                
                const item = equippedItems[slot];
                if (item) {
                    if (Array.isArray(item)) {
                        // Se for array (modificações), mostra cada item
                        item.forEach((mod, index) => {
                            const itemCard = this.createItemCard(mod, true, `${slot}_${index}`);
                            slotElement.appendChild(itemCard);
                        });
                    } else {
                        // Item normal
                        const itemCard = this.createItemCard(item, true, slot);
                        slotElement.appendChild(itemCard);
                        
                        // Se for rifle, verificar se tem modificações
                        if (item.id === 'rifle') {
                            const modifications = equippedItems.modifications || [];
                            modifications.forEach((mod, index) => {
                                if (mod.compatibleWith && mod.compatibleWith.includes('rifle')) {
                                    const modElement = document.createElement('div');
                                    modElement.className = 'modification-item';
                                    modElement.textContent = mod.name;
                                    slotElement.appendChild(modElement);
                                }
                            });
                        }
                    }
                } else {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'empty-slot';
                    emptySlot.textContent = 'Vazio';
                    slotElement.appendChild(emptySlot);
                }
            }
        });
    }

    updateInventoryGrid() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (!inventoryGrid) return;

        inventoryGrid.innerHTML = '';
        
        const inventoryItems = this.inventorySystem.getInventoryItems();
        
        inventoryItems.forEach(item => {
            if (item) {
                const itemCard = this.createItemCard(item, false);
                inventoryGrid.appendChild(itemCard);
            }
        });

        // Adiciona slots vazios se necessário
        const maxSlots = 20;
        const currentSlots = inventoryItems.length;
        for (let i = currentSlots; i < maxSlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'empty-slot';
            emptySlot.textContent = 'Vazio';
            inventoryGrid.appendChild(emptySlot);
        }
    }

    createItemCard(item, isEquipped = false, slot = null) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemId = item.id;
        card.draggable = true;
        
        if (isEquipped) {
            card.dataset.slot = slot;
        }

        // Imagem do item
        const img = document.createElement('img');
        img.src = `Imgs/${item.image}`;
        img.alt = item.name;
        img.onerror = () => {
            img.src = 'Imgs/Itens/GenericItem_Card.png'; // Fallback
        };
        card.appendChild(img);

        // Nome do item
        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = item.name;
        card.appendChild(name);

        // Evento de clique para ler (mostrar em tamanho grande)
        let clickTimer;
        card.addEventListener('mousedown', (e) => {
            clickTimer = setTimeout(() => {
                this.showItemReading(card, item);
            }, 200);
        });

        card.addEventListener('mouseup', () => {
            clearTimeout(clickTimer);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(clickTimer);
        });

        // Eventos de drag and drop
        card.addEventListener('dragstart', (e) => {
            clearTimeout(clickTimer);
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        // Clique duplo para equipar (se não estiver equipado)
        card.addEventListener('dblclick', () => {
            if (!isEquipped) {
                this.equipItem(item.id);
            }
        });

        return card;
    }

    equipItem(itemId) {
        if (this.inventorySystem.equipFromInventory(itemId)) {
            this.updateInventoryDisplay();
            this.showMessage(`Item equipado: ${this.inventorySystem.getItemSystem().getItem(itemId).name}`);
            // Atualiza o status de ataque do jogador
            if (window.gameInstance) {
                window.gameInstance.atualizarStatusAtaque();
                window.gameInstance.atualizarStatusDetalhado();
            }
        } else {
            this.showMessage('Não é possível equipar este item');
        }
    }

    unequipItem(slot) {
        // Verifica se é uma modificação
        if (slot.includes('_')) {
            const [slotName, index] = slot.split('_');
            const item = this.inventorySystem.unequipModificationToInventory(slotName, parseInt(index));
            if (item) {
                this.updateInventoryDisplay();
                this.showMessage(`Modificação desequipada: ${item.name}`);
                // Atualiza o status de ataque do jogador
                if (window.gameInstance) {
                    window.gameInstance.atualizarStatusAtaque();
                    window.gameInstance.atualizarStatusDetalhado();
                }
            } else {
                this.showMessage('Inventário cheio!');
            }
        } else {
            const item = this.inventorySystem.unequipToInventory(slot);
            if (item) {
                this.updateInventoryDisplay();
                this.showMessage(`Item desequipado: ${item.name}`);
                // Atualiza o status de ataque do jogador
                if (window.gameInstance) {
                    window.gameInstance.atualizarStatusAtaque();
                    window.gameInstance.atualizarStatusDetalhado();
                }
            } else {
                this.showMessage('Inventário cheio!');
            }
        }
    }

    highlightCard(card) {
        // Remove destaque de outras cartas
        document.querySelectorAll('.item-card.highlighted').forEach(c => {
            c.classList.remove('highlighted');
        });
        
        // Adiciona destaque à carta clicada
        card.classList.add('highlighted');
        
        // Remove o destaque após um tempo
        setTimeout(() => {
            card.classList.remove('highlighted');
        }, 1000);
    }

    showMessage(message) {
        // Cria uma mensagem temporária
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #00fff7;
            border: 2px solid #00fff7;
            padding: 15px 25px;
            border-radius: 0;
            font-family: 'Rajdhani Medium', 'Rajdhani', Arial, sans-serif;
            font-size: 1.1em;
            text-shadow: 0 0 8px #00fff7;
            z-index: 10001;
            box-shadow: 0 0 20px #00fff799;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 2000);
    }

    // Método para adicionar item ao inventário (chamado quando inimigo é derrotado)
    addItemToInventory(itemId) {
        if (this.inventorySystem.addItem(itemId)) {
            this.showMessage(`Novo item obtido: ${this.inventorySystem.getItemSystem().getItem(itemId).name}`);
            this.updateInventoryDisplay(); // Atualiza a interface
            return true;
        } else {
            this.showMessage('Inventário cheio!');
            return false;
        }
    }

    // Método para adicionar múltiplos itens do segundo andar
    addSecondFloorItemsToInventory() {
        const rifleAdded = this.inventorySystem.addItem('rifle');
        const scopeAdded = this.inventorySystem.addItem('scope');
        
        if (rifleAdded && scopeAdded) {
            this.showMessage('Novos itens obtidos: Rifle e Scope');
            this.updateInventoryDisplay();
            return true;
        } else {
            this.showMessage('Inventário cheio!');
            return false;
        }
    }

    showItemReading(card, item) {
        // Criar overlay para mostrar o item em tamanho grande
        const overlay = document.createElement('div');
        overlay.className = 'item-reading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1002;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;

        const readingCard = document.createElement('div');
        readingCard.className = 'item-card reading';
        readingCard.innerHTML = `
            <img src="Imgs/${item.image}" alt="${item.name}" style="width: 200px; height: 200px; object-fit: contain;">
            <div class="item-name" style="font-size: 1.2em; margin-top: 10px;">${item.name}</div>
            <div style="color: #00fff7; margin-top: 10px; text-align: center;">${item.description || 'Sem descrição'}</div>
        `;

        overlay.appendChild(readingCard);
        document.body.appendChild(overlay);

        // Fechar ao clicar
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    }

    equipItemToSlot(itemId, slotName) {
        if (this.inventorySystem.equipFromInventory(itemId)) {
            this.updateInventoryDisplay();
            this.showMessage(`Item equipado: ${this.inventorySystem.getItemSystem().getItem(itemId).name}`);
        } else {
            this.showMessage('Não foi possível equipar o item neste slot');
        }
    }
}

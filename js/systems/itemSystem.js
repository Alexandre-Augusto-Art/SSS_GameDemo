// Sistema de Itens e Equipamentos
class ItemSystem {
    constructor() {
        this.items = this.initializeItems();
        this.equipmentSlots = {
            head: null,
            leftHand: null,
            rightHand: null,
            torso: null,
            legs: null,
            modifications: []
        };
    }

    initializeItems() {
        return {
            cyberdeck: {
                id: 'cyberdeck',
                name: 'Cyberdeck',
                slot: 'hand',
                image: 'Cards/Card-Cyberdeck.jpg',
                bonuses: {
                    geral: 2,
                    cibernetico: 5
                },
                description: 'Dispositivo de hacking avançado'
            },
            rifle: {
                id: 'rifle',
                name: 'Rifle',
                slot: 'twoHands',
                image: 'Cards/Card-Rifle.jpg',
                bonuses: {
                    geral: 3,
                    blindado: 4
                },
                description: 'Rifle de assalto de alta precisão',
                mods: []
            },
            scope: {
                id: 'scope',
                name: 'Scope',
                slot: 'mod',
                image: 'Cards/Card-Scope.jpg',
                bonuses: {
                    geral: 2,
                    blindado: 3
                },
                description: 'Mira telescópica para rifles',
                compatibleWith: ['rifle']
            }
        };
    }

    // Calcula o bônus total de ataque baseado nos itens equipados
    calculateAttackBonus(enemyTags = []) {
        let totalBonus = 0;
        let bonusDetails = [];

        // Verifica itens equipados
        Object.values(this.equipmentSlots).forEach(item => {
            if (item) {
                if (Array.isArray(item)) {
                    // Se for array (modificações), processa cada item
                    item.forEach(mod => {
                        const itemBonus = this.getItemBonus(mod, enemyTags);
                        totalBonus += itemBonus.total;
                        if (itemBonus.total > 0) {
                            bonusDetails.push(`${mod.name}: +${itemBonus.total}`);
                        }
                    });
                } else {
                    // Item normal
                    const itemBonus = this.getItemBonus(item, enemyTags);
                    totalBonus += itemBonus.total;
                    if (itemBonus.total > 0) {
                        bonusDetails.push(`${item.name}: +${itemBonus.total}`);
                    }
                }
            }
        });

        return {
            total: totalBonus,
            details: bonusDetails
        };
    }

    // Calcula bônus de um item específico
    getItemBonus(item, enemyTags = []) {
        let bonus = 0;
        let details = [];

        // Bônus geral
        if (item.bonuses.geral) {
            bonus += item.bonuses.geral;
            details.push(`Geral: +${item.bonuses.geral}`);
        }

        // Bônus específico contra tipos de inimigo
        enemyTags.forEach(tag => {
            if (item.bonuses[tag]) {
                bonus += item.bonuses[tag];
                details.push(`${tag}: +${item.bonuses[tag]}`);
            }
        });

        return {
            total: bonus,
            details: details
        };
    }

    // Equipa um item
    equipItem(itemId) {
        const item = this.items[itemId];
        if (!item) return false;

        // Verifica compatibilidade para modificações
        if (item.slot === 'mod' && item.compatibleWith) {
            const hasCompatibleItem = item.compatibleWith.some(compatibleId => {
                // Verifica se o item compatível está equipado em qualquer slot
                return Object.values(this.equipmentSlots).some(equippedItem => {
                    if (Array.isArray(equippedItem)) {
                        // Se for array (modificações), verifica cada item
                        return equippedItem.some(mod => mod && mod.id === compatibleId);
                    } else {
                        // Item normal
                        return equippedItem && equippedItem.id === compatibleId;
                    }
                });
            });
            if (!hasCompatibleItem) {
                return false; // Não pode equipar modificação sem item compatível
            }
        }

        // Verifica se o slot está disponível
        if (item.slot === 'hand') {
            if (!this.equipmentSlots.leftHand) {
                this.equipmentSlots.leftHand = item;
                return true;
            } else if (!this.equipmentSlots.rightHand) {
                this.equipmentSlots.rightHand = item;
                return true;
            }
        } else if (item.slot === 'twoHands') {
            if (!this.equipmentSlots.leftHand && !this.equipmentSlots.rightHand) {
                this.equipmentSlots.leftHand = item;
                this.equipmentSlots.rightHand = item; // Ocupa ambos os slots
                return true;
            }
        } else if (item.slot === 'mod') {
            // Para modificações, adiciona como um item especial
            if (!this.equipmentSlots.modifications) {
                this.equipmentSlots.modifications = [];
            }
            this.equipmentSlots.modifications.push(item);
            return true;
        } else if (item.slot === 'head' && !this.equipmentSlots.head) {
            this.equipmentSlots.head = item;
            return true;
        } else if (item.slot === 'torso' && !this.equipmentSlots.torso) {
            this.equipmentSlots.torso = item;
            return true;
        } else if (item.slot === 'legs' && !this.equipmentSlots.legs) {
            this.equipmentSlots.legs = item;
            return true;
        }

        return false; // Não foi possível equipar
    }

    // Remove um item do equipamento
    unequipItem(slot) {
        if (this.equipmentSlots[slot]) {
            const item = this.equipmentSlots[slot];
            
            // Se for item de duas mãos, limpa ambos os slots
            if (item.slot === 'twoHands') {
                this.equipmentSlots.leftHand = null;
                this.equipmentSlots.rightHand = null;
            } else {
                this.equipmentSlots[slot] = null;
            }
            
            return item;
        }
        return null;
    }

    // Remove uma modificação do equipamento
    unequipModification(slot, index) {
        if (this.equipmentSlots[slot] && Array.isArray(this.equipmentSlots[slot])) {
            const item = this.equipmentSlots[slot][index];
            if (item) {
                this.equipmentSlots[slot].splice(index, 1);
                return item;
            }
        }
        return null;
    }

    // Verifica se um item pode ser equipado
    canEquipItem(itemId) {
        const item = this.items[itemId];
        if (!item) return false;

        // Verifica compatibilidade para modificações
        if (item.slot === 'mod' && item.compatibleWith) {
            const hasCompatibleItem = item.compatibleWith.some(compatibleId => {
                return Object.values(this.equipmentSlots).some(equippedItem => {
                    if (Array.isArray(equippedItem)) {
                        return equippedItem.some(mod => mod && mod.id === compatibleId);
                    } else {
                        return equippedItem && equippedItem.id === compatibleId;
                    }
                });
            });
            if (!hasCompatibleItem) {
                return false;
            }
        }

        if (item.slot === 'hand') {
            return !this.equipmentSlots.leftHand || !this.equipmentSlots.rightHand;
        } else if (item.slot === 'twoHands') {
            return !this.equipmentSlots.leftHand && !this.equipmentSlots.rightHand;
        } else if (item.slot === 'head') {
            return !this.equipmentSlots.head;
        } else if (item.slot === 'torso') {
            return !this.equipmentSlots.torso;
        } else if (item.slot === 'legs') {
            return !this.equipmentSlots.legs;
        } else if (item.slot === 'mod') {
            return true; // Modificações sempre podem ser equipadas se compatíveis
        }

        return false;
    }

    // Retorna itens equipados
    getEquippedItems() {
        return this.equipmentSlots;
    }

    // Retorna item por ID
    getItem(itemId) {
        return this.items[itemId];
    }

    // Retorna todos os itens disponíveis
    getAllItems() {
        return this.items;
    }
}

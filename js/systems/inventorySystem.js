// Sistema de Inventário
class InventorySystem {
    constructor() {
        this.inventory = [];
        this.maxInventorySlots = 20; // Limite do inventário
        this.itemSystem = new ItemSystem();
    }

    // Adiciona um item ao inventário
    addItem(itemId) {
        if (this.inventory.length < this.maxInventorySlots) {
            this.inventory.push(itemId);
            return true;
        }
        return false; // Inventário cheio
    }

    // Remove um item do inventário
    removeItem(itemId) {
        const index = this.inventory.indexOf(itemId);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }

    // Move item do inventário para equipamento
    equipFromInventory(itemId) {
        if (this.itemSystem.canEquipItem(itemId)) {
            if (this.removeItem(itemId)) {
                return this.itemSystem.equipItem(itemId);
            }
        }
        return false;
    }

    // Move item do equipamento para inventário
    unequipToInventory(slot) {
        const item = this.itemSystem.unequipItem(slot);
        if (item && this.addItem(item.id)) {
            return item;
        }
        return null;
    }

    // Move modificação do equipamento para inventário
    unequipModificationToInventory(slot, index) {
        const item = this.itemSystem.unequipModification(slot, index);
        if (item && this.addItem(item.id)) {
            return item;
        }
        return null;
    }

    // Retorna itens do inventário
    getInventoryItems() {
        return this.inventory.map(itemId => this.itemSystem.getItem(itemId));
    }

    // Retorna itens equipados
    getEquippedItems() {
        return this.itemSystem.getEquippedItems();
    }

    // Calcula bônus total de ataque
    calculateAttackBonus(enemyTags = []) {
        return this.itemSystem.calculateAttackBonus(enemyTags);
    }

    // Gera item específico baseado no andar
    generateFloorItem(floor) {
        switch(floor) {
            case 1:
                return 'cyberdeck'; // Primeiro andar: Cyberdeck
            case 2:
                return 'rifle'; // Segundo andar: Rifle (primeiro item)
            default:
                return null; // Não há drops em outros andares
        }
    }

    // Adiciona item específico do andar ao inventário
    addFloorItem(floor) {
        const itemId = this.generateFloorItem(floor);
        if (itemId) {
            return this.addItem(itemId);
        }
        return false;
    }

    // Adiciona múltiplos itens do segundo andar (rifle + scope)
    addSecondFloorItems() {
        const rifleAdded = this.addItem('rifle');
        const scopeAdded = this.addItem('scope');
        return rifleAdded && scopeAdded;
    }

    // Método legado para compatibilidade (não usado mais)
    addRandomItem() {
        return this.addFloorItem(1); // Fallback para cyberdeck
    }

    // Verifica se inventário está cheio
    isInventoryFull() {
        return this.inventory.length >= this.maxInventorySlots;
    }

    // Retorna quantidade de itens no inventário
    getInventoryCount() {
        return this.inventory.length;
    }

    // Retorna item system para acesso direto
    getItemSystem() {
        return this.itemSystem;
    }

    // Reseta o inventário (remove todos os itens e desequipa tudo)
    resetInventory() {
        this.inventory = [];
        this.itemSystem.equipmentSlots = {
            head: null,
            leftHand: null,
            rightHand: null,
            torso: null,
            legs: null,
            modifications: []
        };
    }
}

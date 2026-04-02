export default class ItemSale {
    constructor(id_item_sale, quantity, unit_price, product_id,sale_id) {
        this.id_item_sale = id_item_sale;
        this.quantity = Number(quantity);
        this.unit_price = Number(unit_price);
        this.product_id = product_id;
        this.sale_id = sale_id;

        this.validate();
    }

    validate= () => {
        if (this.quantity <= 0 || this.unit_price <= 0) {
            throw new Error("Quantidade ou preço unitário não podem ser negativos");
        }

        if (!this.product_id) {
            throw new Error("O ID do produto é obrigatório para o item da venda");
        }
    }
}
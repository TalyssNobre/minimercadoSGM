export default class Sale {
    constructor({id, date, total_value, payment_date,status,user_id,member_id, items, discount}) {

        this.id = id;
        this.date = date;
        this.payment_date = payment_date;
        this.status = (status === 'Pago' || status === true)
        this.user_id = user_id;
        this.member_id = member_id;
        this.discount = Number(discount || 0);

        this.items = items || [];
        this.total_value = this.calculateTotal();
    
        this.validate();
    }
     calculateTotal = () => {
        if(!this.items ||this.items == 0){
        throw new Error("É necessário pelo menos um item no carrinho");
    }  

        return this.items.reduce((acc, produto) => {
            return acc + (produto.quantity * produto.unit_price);
    },0);
    }
    validate = () => {
        if(this.total_value < 0 && this.discount < 0 ){
           throw new Error("Preço não pode ser negativo")
        }
        if (this.status === false && !this.member_id) {
            throw new Error("Venda fiada precisa obrigatoriamente de um Cliente.");
        }
    }

}




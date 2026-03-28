
export default class Product{
    constructor({product_id,name,price,stock,imagem,category_id,isActive = true}){
        this.id = product_id;
        this.name = name;
        this.price = Number(price);
        this.stock = Number(stock);
        this.imagem = imagem;
        this.category_id = category_id;
        this.isActive = isActive;

        this.validate();
    }

    validate = () => {
         if (!this.name || !this.category_id || !this.price || !this.stock) {
      throw new Error("Campos obrigatórios faltando");
    }
        if(this.price < 0 || this.stock < 0 ){
        throw new Error("Preço não pode ser negativo")
        }
        
        if(!this.isActive && !this.id) {
      throw new Error("Id está faltando");
    }
  };
}

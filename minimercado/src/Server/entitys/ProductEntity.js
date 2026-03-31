
export default class Product{
    constructor({id,name,price,stock,image,category_id}){
        this.id = id;
        this.name = name;
        this.price = Number(price);
        this.stock = Number(stock);
        this.image = image;
        this.category_id = category_id;

        this.validate();
    }

    validate = () => {
         if (!this.name || !this.category_id || !this.price) {
      throw new Error("Campos obrigatórios faltando");
    }
        if(this.price < 0 || this.stock < 0 ){
        throw new Error("Preço não pode ser negativo")
        }
        

    }
  };


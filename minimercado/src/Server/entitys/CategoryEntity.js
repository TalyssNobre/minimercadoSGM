export default class Category {
    constructor({id, name}) {
        this.id = id ;
        this.name = name;

        this.validate();
    }
    validate = () =>{
        if (!this.name) {
            throw new Error("Campos obrigatórios faltando");
        }
    }
}
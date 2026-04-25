import { formatText } from "../utils/formatter";

export default class User {
    constructor({ id, name, email, profile, user_id}) {
        this.id = id; 
        this.name = formatText(name); 
        this.email = email?.toLowerCase().trim();
        this.profile = profile || 'Operador';
        this.user_id = user_id;

        this.validate();
    }

    validate() {
        if (!this.name || this.name.length < 3) {
            throw new Error("O nome deve ter pelo menos 3 caracteres.");
        }
        if (!this.email || !this.email.includes("@")) {
            throw new Error("E-mail inválido.");
        }
        const validProfiles = ['Admin', 'Operador'];
        if (!validProfiles.includes(this.profile)) {
            throw new Error("Perfil de acesso inválido.");
        }
    }
}
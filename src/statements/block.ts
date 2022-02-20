import visitor from "./statement-visitor";
import Statement from "./statement";

export default class Block extends Statement {
    readonly statements:Array<Statement>

    constructor(statements:Array<Statement>){
        super();
        this.statements = statements;
    }
    
     accept<T>(visitor: visitor<T>): T {
        return visitor.visitBlockStatement(this);
    }

}
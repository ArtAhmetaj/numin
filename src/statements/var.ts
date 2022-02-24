import Expression from "../expressions/expression";
import Token from "../token";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

export default class Var extends Statement{
    readonly name:Token;
    readonly initializer:Expression;

    constructor(name:Token,initializer:Expression){
        super();
        this.name = name;
        this.initializer = initializer;
    }
    accept<T>(visitor: statementVisitor<T>): T {
        return visitor.visitVariableStatement(this);
    }

}
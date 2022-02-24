import Expression from "../expressions/expression";
import Token from "../token";
import Function from "./function";
import Statement from "./statement"
import statementVisitor from "./statement-visitor";

export default class Class extends Statement {

    readonly name: Token;
    readonly superClass: Expression;
    readonly methods: Array<Function>;

    constructor(name: Token, superClass: Expression, methods: Array<Function>) {
        super();
        this.name = name;
        this.superClass = superClass;
        this.methods = methods;

    }

    accept<T>(visitor: statementVisitor<T>): T {
        return visitor.visitClassStatement(this);
    }

}
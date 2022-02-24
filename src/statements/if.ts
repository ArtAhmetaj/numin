import Expression from "../expressions/expression";
import Statement from "./statement";
import statementVisitor from "./statement-visitor";

export default class If extends Statement {

    //  If(Expr condition, Stmt thenBranch, Stmt elseBranch) {
    readonly condition: Expression;
    readonly thenBranch: Statement;
    readonly elseBranch: Statement;

    constructor(condition: Expression, thenBranch: Statement, elseBranch: Statement) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept<T>(visitor: statementVisitor<T>): T {
        return visitor.visitIfStatement(this);
    }

}

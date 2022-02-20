import StatementVisitor from "./statement-visitor";


export default abstract class Statement {
    protected abstract accept<T>(visitor:StatementVisitor<T>):T;
}
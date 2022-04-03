import StatementVisitor from "./statement-visitor";


export default abstract class Statement {
    public abstract accept<T>(visitor:StatementVisitor<T>):T;
}
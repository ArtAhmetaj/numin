import Assign from "./assign"
import Binary from "./binary"
import Call from "./call"
import Get from "./get"
import Grouping from "./grouping"
import Literal from "./literal"
import Logical from "./logical"
import Set from "./set"
import Super from "./super"
import This from "./this"
import Unary from "./unary"
import Variable from "./variable"

export default interface ExpressionVisitor<T>{
    //TODO: add types when created
    visitAssignExpression(expr:Assign): T 
    visitBinaryExpression(binaryExpression:Binary): T
    visitCallExpression(callExpression:Call):T
    visitGetExpression(getExpresssion:Get):T
    visitGroupingExpression(groupingExpression:Grouping):T
    visitLiteralExpression(literalExpression:Literal):T
    visitlogicalExpression(logicalExpression:Logical):T
    visitSetExpression(setExpression:Set):T
    visitSuperExpression(superExpression:Super):T
    visitThisExpression(thisExpression:This):T
    visitUnaryExpression(unaryExpression:Unary):T
    visitVariableExpression(variableExpression:Variable):T

}

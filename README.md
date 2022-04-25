1.numin/lox.ts
2.resolver 

shprehje → detyrë ;

detyrë → ( thirrje "." )? IDENTIFIKUES "=" detyrë
                | logjika_ose ;

logjika_ose → logjika_dhe ("ose" logjika_dhe )* ;
logjika_dhe → barazi ("dhe" barazi)* ;
barazi → krahasim ( ( "!=" | "==") krahasimi)* ;
krahasimi → termi ( ( ">" | ">=" | "<" | "<=" ) term )* ;
termi → faktori ( ( "-" | "+" ) faktori )* ;
faktori → unar (("/" | "*") unar)*;

unar → ( "!" | "-" ) unar | thirrje ;
thirrje → primar ( "(" argumente? ")" | "." IDENTIFIKUES )* ;
primar → "e vërtetë" | "e rreme" | "nuk" | "kjo"
                | NUMRI | STRING | IDENTIFIKUES | "(" shprehje ")"
                | "super" "." IDENTIFIKUES ;



program → deklaratë* EOF ;
deklaratë → shprehje deklarimi
|printim;
shprehje deklarimi→ shprehja ";" ;
printim → shprehja "print" ";" ;



shprehje → caktim ;
caktim → IDENTIFIKUES "=" caktim | barazi ;


deklarim → Deklarim i klases 
| Deklarim i funksionit
| Deklarim i variables
| Deklarim ;
Deklarim i klases→ "class" IDENTIFIKUES "{" funksion* "}" ;